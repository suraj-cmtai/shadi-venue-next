import { db } from "../config/firebase";
import admin from "firebase-admin";
import consoleManager from "../utils/consoleManager";

/**
 * Interface for a Role.
 * @property {string} id - The unique identifier of the role.
 * @property {string} name - The name of the role (e.g., "admin", "editor", "viewer").
 * @property {string[]} permissions - An array of permissions associated with the role.
 * @property {Date} createdAt - The timestamp when the role was created.
 * @property {Date} updatedAt - The timestamp when the role was last updated.
 */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service class for managing roles in Firestore.
 */
class RoleService {
  private static rolesCollection = db.collection("roles");

  /**
   * Converts a Firestore timestamp to a JavaScript Date object.
   * @param {any} timestamp - The Firestore timestamp.
   * @returns {Date} - The converted Date object.
   */
  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  }

  /**
   * Converts a Firestore document to a Role object.
   * @param {string} id - The document ID.
   * @param {any} data - The document data.
   * @returns {Role} - The Role object.
   */
  private static convertToType(id: string, data: any): Role {
    return {
      id,
      name: data.name || "",
      permissions: data.permissions || [],
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  /**
   * Adds a new role to Firestore.
   * @param {Omit<Role, 'id' | 'createdAt' | 'updatedAt'>} roleData - The data for the new role.
   * @returns {Promise<Role>} - The newly created role.
   */
  static async addRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newRoleRef = await this.rolesCollection.add({
        ...roleData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      consoleManager.log("New role added with ID:", newRoleRef.id);
      const newRoleDoc = await newRoleRef.get();
      return this.convertToType(newRoleDoc.id, newRoleDoc.data());
    } catch (error: any) {
      consoleManager.error("Error adding new role:", error);
      throw error;
    }
  }

  /**
   * Retrieves all roles from Firestore.
   * @returns {Promise<Role[]>} - An array of all roles.
   */
  static async getAllRoles(): Promise<Role[]> {
    try {
      const snapshot = await this.rolesCollection.orderBy("createdAt", "desc").get();
      const roles = snapshot.docs.map((doc:any) => this.convertToType(doc.id, doc.data()));
      consoleManager.log("Firestore Read: All roles fetched, count:", roles.length);
      return roles;
    } catch (error: any) {
      consoleManager.error("Error fetching all roles:", error);
      throw error;
    }
  }

  /**
   * Retrieves a role by its ID from Firestore.
   * @param {string} id - The ID of the role to retrieve.
   * @returns {Promise<Role | null>} - The role object if found, otherwise null.
   */
  static async getRoleById(id: string): Promise<Role | null> {
    try {
      const roleDoc = await this.rolesCollection.doc(id).get();

      if (!roleDoc.exists) {
        consoleManager.log(`Role with ID ${id} not found.`);
        return null;
      }

      consoleManager.log(`Role fetched from Firestore:`, id);
      return this.convertToType(roleDoc.id, roleDoc.data());
    } catch (error: any) {
      consoleManager.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  }

  /**
   * Updates an existing role in Firestore.
   * @param {string} id - The ID of the role to update.
   * @param {Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>} updateData - The data to update.
   * @returns {Promise<Role | null>} - The updated role object.
   */
  static async updateRole(id: string, updateData: Partial<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Role | null> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const roleRef = this.rolesCollection.doc(id);

      await roleRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      consoleManager.log("Role updated successfully:", id);
      const updatedRoleDoc = await roleRef.get();
      return this.convertToType(updatedRoleDoc.id, updatedRoleDoc.data());
    } catch (error: any) {
      consoleManager.error("Error updating role:", error);
      throw error;
    }
  }

  /**
   * Deletes a role from Firestore by its ID.
   * @param {string} id - The ID of the role to delete.
   * @returns {Promise<{ id: string }>} - An object containing the ID of the deleted role.
   */
  static async deleteRole(id: string): Promise<{ id: string }> {
    try {
      await this.rolesCollection.doc(id).delete();
      consoleManager.log("Role deleted successfully:", id);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting role:", error);
      throw error;
    }
  }
}

export default RoleService;