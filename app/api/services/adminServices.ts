import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export type AdminRole = 'admin' | 'superadmin';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  phoneNumber?: string;
  lastLogin?: string;
  actions: {
    action: string;
    target: string;
    timestamp: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

class AdminService {
  static admins: Admin[] = [];
  static isInitialized = false;

  private static convertTimestamp(timestamp: any): Date {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000);
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  }

  private static convertToType(id: string, data: any): Admin {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      role: data.role || "admin",
      avatar: data.avatar || null,
      phoneNumber: data.phoneNumber || "",
      lastLogin: data.lastLogin || null,
      actions: data.actions || [],
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  static initAdmins() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for admins...");
    const adminsCollection = db.collection("admins");

    adminsCollection.onSnapshot((snapshot: any) => {
      this.admins = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log("Firestore Read: Admins updated, count:", this.admins.length);
    });

    this.isInitialized = true;
  }

  static async getAllAdmins(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      const snapshot = await db.collection("admins").orderBy("createdAt", "desc").get();
      this.admins = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    }
    return this.admins;
  }

  static async addAdmin(adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      const newAdminRef = await db.collection("admins").add({
        ...adminData,
        actions: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newAdminDoc = await db.collection("admins").doc(newAdminRef.id).get();
      const newAdmin = this.convertToType(newAdminDoc.id, newAdminDoc.data());
      
      await this.getAllAdmins(true);
      
      return newAdmin;
    } catch (error: any) {
      consoleManager.error("Error adding new admin:", error);
      throw error;
    }
  }

  static async getAdminById(id: string) {
    try {
      const admin = this.admins.find((admin) => admin.id === id);
      if (admin) {
        return admin;
      }

      const adminDoc = await db.collection("admins").doc(id).get();
      
      if (!adminDoc.exists) {
        throw new Error("Admin not found");
      }

      return this.convertToType(adminDoc.id, adminDoc.data());
    } catch (error) {
      consoleManager.error(`Error fetching admin ${id}:`, error);
      throw error;
    }
  }

  static async updateAdmin(id: string, updateData: Partial<Admin>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const adminRef = db.collection("admins").doc(id);

      await adminRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      await this.getAllAdmins(true);
      
      return await this.getAdminById(id);
    } catch (error: any) {
      consoleManager.error("Error updating admin:", error);
      throw error;
    }
  }

  static async deleteAdmin(id: string) {
    try {
      const admin = await this.getAdminById(id);
      if (admin.role === 'superadmin') {
        throw new Error("Cannot delete superadmin account");
      }

      await db.collection("admins").doc(id).delete();
      await this.getAllAdmins(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting admin:", error);
      throw error;
    }
  }

  static async updateLastLogin(id: string) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      await db.collection("admins").doc(id).update({
        lastLogin: timestamp,
        updatedAt: timestamp,
      });
      await this.getAllAdmins(true);
    } catch (error: any) {
      consoleManager.error("Error updating admin last login:", error);
      throw error;
    }
  }

  static async logAdminAction(id: string, action: string, target: string) {
    try {
      const actionRecord = {
        action,
        target,
        timestamp: new Date().toISOString(),
      };

      await db.collection("admins").doc(id).update({
        actions: admin.firestore.FieldValue.arrayUnion(actionRecord),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllAdmins(true);
      return actionRecord;
    } catch (error: any) {
      consoleManager.error("Error logging admin action:", error);
      throw error;
    }
  }

  // Get admin by email
  static async getAdminByEmail(email: string) {
    return this.admins.find(admin => admin.email === email);
  }

  // Search admins
  static async searchAdmins(query: string) {
    const searchTerm = query.toLowerCase();
    return this.admins.filter(admin => 
      admin.name.toLowerCase().includes(searchTerm) ||
      admin.email.toLowerCase().includes(searchTerm) ||
      admin.role.toLowerCase().includes(searchTerm)
    );
  }

  // Get action logs for an admin
  static async getAdminActionLogs(id: string, startDate?: Date, endDate?: Date) {
    const admin = await this.getAdminById(id);
    let actions = admin.actions;

    if (startDate) {
      actions = actions.filter(action => new Date(action.timestamp) >= startDate);
    }
    if (endDate) {
      actions = actions.filter(action => new Date(action.timestamp) <= endDate);
    }

    return actions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    const admins = await this.getAllAdmins();
    return {
      totalAdmins: admins.length,
      superadmins: admins.filter(a => a.role === 'superadmin').length,
      regularAdmins: admins.filter(a => a.role === 'admin').length,
      activeToday: admins.filter(a => {
        if (!a.lastLogin) return false;
        const lastLogin = new Date(a.lastLogin);
        const today = new Date();
        return lastLogin.toDateString() === today.toDateString();
      }).length,
    };
  }

  // Approval Request Methods
  static approvalRequests: ApprovalRequest[] = [];
  static isApprovalInitialized = false;

  static async getAllApprovalRequests(forceRefresh = true) {
    if (forceRefresh || !this.isApprovalInitialized) {
      const snapshot = await db.collection("approvalRequests").orderBy("submittedAt", "desc").get();
      this.approvalRequests = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: this.convertTimestamp(doc.data().submittedAt).toISOString(),
        processedAt: doc.data().processedAt ? this.convertTimestamp(doc.data().processedAt).toISOString() : undefined
      }));
      this.isApprovalInitialized = true;
    }
    return this.approvalRequests;
  }

  static async getApprovalRequestById(id: string) {
    try {
      const request = this.approvalRequests.find((req) => req.id === id);
      if (request) return request;

      const doc = await db.collection("approvalRequests").doc(id).get();
      if (!doc.exists) throw new Error("Approval request not found");

      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: this.convertTimestamp(data?.submittedAt).toISOString(),
        processedAt: data?.processedAt ? this.convertTimestamp(data.processedAt).toISOString() : undefined
      };
    } catch (error) {
      consoleManager.error(`Error fetching approval request ${id}:`, error);
      throw error;
    }
  }

  static async processApprovalRequest(requestId: string, approved: boolean, notes?: string) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const requestRef = db.collection("approvalRequests").doc(requestId);

      const data = {
        status: approved ? 'approved' : 'rejected',
        processedAt: timestamp,
        notes: notes || '',
      };

      await requestRef.update(data);
      await this.getAllApprovalRequests(true);

      return await this.getApprovalRequestById(requestId);
    } catch (error) {
      consoleManager.error("Error processing approval request:", error);
      throw error;
    }
  }
}

export interface ApprovalRequest {
  id: string;
  entityId: string;
  entityType: 'hotel' | 'vendor' | 'user' | 'super-admin';
  status: 'pending' | 'approved' | 'rejected';
  metadata: {
    name?: string;
    email: string;
    registrationDate: string;
    documents?: string[];
    notes?: string;
  };
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export default AdminService;
