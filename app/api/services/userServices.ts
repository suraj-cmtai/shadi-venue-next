import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export type UserRole = 'user' | 'admin' | 'hotel' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  bookings?: string[]; // IDs of bookings
  favorites?: {
    hotels?: string[];
    vendors?: string[];
  };
  notifications: {
    id: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  static users: User[] = [];
  static isInitialized = false;

  // Helper method to convert Firestore timestamp to Date
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

  // Helper method to convert document data to User type
  private static convertToType(id: string, data: any): User {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      role: data.role || "user",
      avatar: data.avatar || null,
      phoneNumber: data.phoneNumber || "",
      address: data.address || null,
      bookings: data.bookings || [],
      favorites: data.favorites || { hotels: [], vendors: [] },
      notifications: data.notifications || [],
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    };
  }

  // Initialize Firestore real-time listener
  static initUsers() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for users...");
    const usersCollection = db.collection("users");

    usersCollection.onSnapshot((snapshot: any) => {
      this.users = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log("Firestore Read: Users updated, count:", this.users.length);
    });

    this.isInitialized = true;
  }

  // Get all users
  static async getAllUsers(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
      this.users = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    }
    return this.users;
  }

  // Add a new user
  static async addUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const now = new Date();

      const newUserRef = await db.collection("users").add({
        ...userData,
        notifications: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdAtStr: now.toISOString(),
        updatedAtStr: now.toISOString(),
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newUserDoc = await db.collection("users").doc(newUserRef.id).get();
      const newUser = this.convertToType(newUserDoc.id, newUserDoc.data());
      
      await this.getAllUsers(true);
      
      return {
        ...newUser,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString()
      };
    } catch (error: any) {
      consoleManager.error("Error adding new user:", error);
      throw error;
    }
  }

  // Get a user by ID
  static async getUserById(id: string) {
    try {
      const cachedUser = this.users.find((user) => user.id === id);
      if (cachedUser) {
        return {
          ...cachedUser,
          createdAt: cachedUser.createdAt.toISOString(),
          updatedAt: cachedUser.updatedAt.toISOString()
        };
      }

      const userDoc = await db.collection("users").doc(id).get();
      
      if (!userDoc.exists) {
        throw new Error("User not found");
      }

      const fetchedUser = this.convertToType(userDoc.id, userDoc.data());
      return {
        ...fetchedUser,
        createdAt: fetchedUser.createdAt.toISOString(),
        updatedAt: fetchedUser.updatedAt.toISOString()
      };
    } catch (error) {
      consoleManager.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  // Update a user by ID
  static async updateUser(id: string, updateData: Partial<User>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const userRef = db.collection("users").doc(id);
      await userRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      await this.getAllUsers(true);
      
      return await this.getUserById(id);
    } catch (error: any) {
      consoleManager.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete a user by ID
  static async deleteUser(id: string) {
    try {
      await db.collection("users").doc(id).delete();
      await this.getAllUsers(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting user:", error);
      throw error;
    }
  }

  // Add notification
  static async addNotification(userId: string, message: string) {
    try {
      const notification = {
        id: Date.now().toString(),
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };

      await db.collection("users").doc(userId).update({
        notifications: admin.firestore.FieldValue.arrayUnion(notification),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
      return notification;
    } catch (error: any) {
      consoleManager.error("Error adding notification:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      const user = await this.getUserById(userId);
      const notifications = user.notifications.map((n: { id: string; message: string; read: boolean; createdAt: string }) =>
        n.id === notificationId ? { ...n, read: true } : n
      );      await db.collection("users").doc(userId).update({
        notifications,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Update user favorites
  static async updateFavorites(userId: string, type: 'hotels' | 'vendors', itemId: string, add: boolean) {
    try {
      const user = await this.getUserById(userId);
      const favorites = user.favorites || { hotels: [], vendors: [] };
      
      if (add) {
        favorites[type] = [...(favorites[type] || []), itemId];
      } else {
        favorites[type] = (favorites[type] || []).filter((id: string) => id !== itemId);
      }

      await db.collection("users").doc(userId).update({
        favorites,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error updating favorites:", error);
      throw error;
    }
  }

  // Get users by role
  static async getUsersByRole(role: UserRole) {
    return this.users.filter(user => user.role === role);
  }

  // Search users
  static async searchUsers(query: string) {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
      (user.address?.city && user.address.city.toLowerCase().includes(searchTerm))
    );
  }
}

export default UserService;
