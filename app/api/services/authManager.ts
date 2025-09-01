import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";

export interface Auth {
    id: string;
    email: string;
    name: string;
    role: "admin" | "super-admin" | "hotel" | "vendor" | "user" | "blog" | "marketing";
    status: "active" | "inactive";
    userId?: string;
    hotelId?: string;
    adminId?: string;
    vendorId?: string;
    "super-adminId"?: string;
    blogId?: string;
    marketingId?: string;
    createdOn: string;
    updatedOn: string;
}

export default class AuthService {
    private static collection = "auth";
    
    // Existing signup and login methods...

    /**
     * Get all auth entries
     */
    static async getAllAuth(): Promise<Auth[]> {
        try {
            const snapshot = await db.collection(this.collection).get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Auth));
        } catch (error: any) {
            consoleManager.error("Error getting all auth:", error);
            throw error;
        }
    }

    /**
     * Get a single auth entry by ID
     */
    static async getAuthById(id: string): Promise<Auth | null> {
        try {
            const doc = await db.collection(this.collection).doc(id).get();
            if (!doc.exists) return null;
            return {
                id: doc.id,
                ...doc.data()
            } as Auth;
        } catch (error: any) {
            consoleManager.error("Error getting auth by ID:", error);
            throw error;
        }
    }

    /**
     * Update auth status and corresponding role document status
     */
    static async updateAuthStatus(id: string, status: "active" | "inactive"): Promise<Auth> {
        try {
            const authDoc = await db.collection(this.collection).doc(id).get();
            if (!authDoc.exists) {
                throw new Error("Auth entry not found");
            }

            const authData = authDoc.data() as Auth;
            const { role } = authData;
            const roleId = authData[`${role}Id`];

            // Update auth status
            await db.collection(this.collection).doc(id).update({
                status,
                updatedOn: new Date().toISOString()
            });

            // Update role document status (except for user role which is always active)
            if (role !== "user" && roleId) {
                const roleCollection = this.getRoleCollection(role);
                await db.collection(roleCollection).doc(roleId).update({
                    status,
                    updatedAt: new Date().toISOString()
                });
            }

            // Return updated auth
            const updatedDoc = await db.collection(this.collection).doc(id).get();
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            } as Auth;
        } catch (error: any) {
            consoleManager.error("Error updating auth status:", error);
            throw error;
        }
    }

    /**
     * Update auth entry details
     */
    static async updateAuth(id: string, updates: { name: string; email: string; role: string }): Promise<Auth> {
        try {
            const authDoc = await db.collection(this.collection).doc(id).get();
            if (!authDoc.exists) {
                throw new Error("Auth entry not found");
            }

            const authData = authDoc.data() as Auth;
            const oldRole = authData.role;
            const newRole = updates.role as Auth["role"];

            // Update auth document
            await db.collection(this.collection).doc(id).update({
                name: updates.name,
                email: updates.email,
                role: newRole,
                updatedOn: new Date().toISOString()
            });

            // If role changed, update the corresponding role documents
            if (oldRole !== newRole) {
                const oldRoleId = authData[`${oldRole}Id`];
                const newRoleId = authData[`${newRole}Id`];

                // Update old role document if it exists
                if (oldRoleId) {
                    const oldRoleCollection = this.getRoleCollection(oldRole);
                    await db.collection(oldRoleCollection).doc(oldRoleId).update({
                        name: updates.name,
                        email: updates.email,
                        updatedAt: new Date().toISOString()
                    });
                }

                // Update new role document if it exists
                if (newRoleId) {
                    const newRoleCollection = this.getRoleCollection(newRole);
                    await db.collection(newRoleCollection).doc(newRoleId).update({
                        name: updates.name,
                        email: updates.email,
                        updatedAt: new Date().toISOString()
                    });
                }
            } else {
                // Same role, just update the role document
                const roleId = authData[`${newRole}Id`];
                if (roleId) {
                    const roleCollection = this.getRoleCollection(newRole);
                    await db.collection(roleCollection).doc(roleId).update({
                        name: updates.name,
                        email: updates.email,
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            // Return updated auth
            const updatedDoc = await db.collection(this.collection).doc(id).get();
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            } as Auth;
        } catch (error: any) {
            consoleManager.error("Error updating auth:", error);
            throw error;
        }
    }

    /**
     * Delete auth entry and corresponding role document
     */
    static async deleteAuth(id: string): Promise<void> {
        try {
            const authDoc = await db.collection(this.collection).doc(id).get();
            if (!authDoc.exists) {
                throw new Error("Auth entry not found");
            }

            const authData = authDoc.data() as Auth;
            const { role } = authData;
            const roleId = authData[`${role}Id`];

            // Delete role document
            if (roleId) {
                const roleCollection = this.getRoleCollection(role);
                await db.collection(roleCollection).doc(roleId).delete();
            }

            // Delete auth document
            await db.collection(this.collection).doc(id).delete();
        } catch (error: any) {
            consoleManager.error("Error deleting auth:", error);
            throw error;
        }
    }

    // Helper function to get role collection name
    private static getRoleCollection(role: Auth["role"]): string {
        switch (role) {
            case "user":
                return "users";
            case "hotel":
                return "hotels";
            case "vendor":
                return "vendors";
            case "blog":
                return "blog";
            case "marketing":
                return "marketing";
            case "admin":
            case "super-admin":
                return "admins";
            default:
                throw new Error("Invalid role");
        }
    }
}
