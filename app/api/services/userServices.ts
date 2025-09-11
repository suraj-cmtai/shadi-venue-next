import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

// Interfaces for user data, matching userSlice structure
export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  nameColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface Social {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface Person {
  name: string;
  description: string;
  image: string | null;
  socials: Social;
}

export interface AboutSection {
  title: string;
  subtitle: string;
  groom: Person;
  bride: Person;
  coupleImage: string | null;
}

export interface WeddingEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  description: string;
  image: string | null;
  selfVenue?: {
    name: string;
    address: string;
    googleLocation: string;
    landmark: string;
  };
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  image?: string;
}

export interface PlanningItem {
  title: string;
  description: string;
  icon?: string;
  completed: boolean;
  time?: string;
  phone?: string;
}

export interface InviteSection {
  heading: string;
  subheading: string;
  message: string;
  rsvpLink: string | null;
  backgroundImage: string | null;
  youtubeLinks?: string[];
}

export interface Invite {
  isEnabled: boolean;
  theme: Theme;
  about: AboutSection;
  weddingEvents: WeddingEvent[];
  loveStory: TimelineEvent[];
  planning: PlanningItem[];
  invitation: InviteSection;
}

export type UserRole = 'user' | 'super-admin' | 'admin' | 'hotel' | 'vendor' | 'blog' | 'marketing' | 'banquet';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  phoneNumber?: string | null;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  } | null;
  bookings?: string[];
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
  invite?: Invite | null;
  createdAt: string;
  updatedAt: string;
}

class UserService {
  static users: User[] = [];
  static isInitialized = false;

  // Helper: convert Firestore timestamp to ISO string
  private static convertTimestampToString(timestamp: any): string {
    if (!timestamp) return new Date().toISOString();
    if (timestamp instanceof Date) return timestamp.toISOString();
    if (typeof timestamp === "string") return new Date(timestamp).toISOString();
    if (timestamp._seconds) return new Date(timestamp._seconds * 1000).toISOString();
    if (typeof timestamp.toDate === "function") return timestamp.toDate().toISOString();
    if (typeof timestamp === "number") return new Date(timestamp).toISOString();
    return new Date().toISOString();
  }

  // Convert Firestore doc to User (matching userSlice)
  private static convertToUser(id: string, data: any): User {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      role: data.role || "user",
      avatar: data.avatar ?? null,
      phoneNumber: data.phoneNumber ?? null,
      address: data.address ?? null,
      bookings: data.bookings ?? [],
      favorites: data.favorites ?? { hotels: [], vendors: [] },
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      invite: data.invite ?? null,
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
    };
  }

  // Real-time Firestore listener
  static initUsers() {
    if (this.isInitialized) return;
    consoleManager.log("Initializing Firestore listener for users...");
    db.collection("users").onSnapshot((snapshot: any) => {
      this.users = snapshot.docs.map((doc: any) => this.convertToUser(doc.id, doc.data()));
      consoleManager.log("Firestore Read: Users updated, count:", this.users.length);
    });
    this.isInitialized = true;
  }

  // Get all users (returns array of User matching userSlice)
  static async getAllUsers(forceRefresh = true): Promise<User[]> {
    if (forceRefresh || !this.isInitialized) {
      const snapshot = await db.collection("users").orderBy("createdAt", "desc").get();
      this.users = snapshot.docs.map((doc: any) => this.convertToUser(doc.id, doc.data()));
      this.isInitialized = true;
    }
    return this.users;
  }

  // Add a new user (expects userData from userSlice, omits id/createdAt/updatedAt)
  static async addUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const now = new Date().toISOString();

      const newUserRef = await db.collection("users").add({
        ...userData,
        notifications: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdAtStr: now,
        updatedAtStr: now,
      });

      // Wait for Firestore to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const newUserDoc = await db.collection("users").doc(newUserRef.id).get();
      const newUser = this.convertToUser(newUserDoc.id, newUserDoc.data());

      await this.getAllUsers(true);
      return newUser;
    } catch (error: any) {
      consoleManager.error("Error adding new user:", error);
      throw error;
    }
  }

  // Get a user by ID (returns User matching userSlice)
  static async getUserById(id: string): Promise<User> {
    try {
      const cachedUser = this.users.find((user) => user.id === id);
      if (cachedUser) return cachedUser;

      const userDoc = await db.collection("users").doc(id).get();
      if (!userDoc.exists) throw new Error("User not found");
      const fetchedUser = this.convertToUser(userDoc.id, userDoc.data());
      return fetchedUser;
    } catch (error) {
      consoleManager.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  // Update a user by ID (updateData matches userSlice)
  static async updateUser(id: string, updateData: Partial<User>): Promise<User> {
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

  // Add notification (userSlice expects notifications as array of objects)
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
      const notifications = user.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      await db.collection("users").doc(userId).update({
        notifications,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Update user favorites (userSlice expects favorites as {hotels:[], vendors:[]})
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
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.users.filter(user => user.role === role);
  }

  // Search users (userSlice expects User[])
  static async searchUsers(query: string): Promise<User[]> {
    const searchTerm = query.toLowerCase();
    return this.users.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm)) ||
      (user.address?.city && user.address.city.toLowerCase().includes(searchTerm))
    );
  }

  // Update user's invite data (inviteData matches Invite from userSlice)
  static async updateInvite(userId: string, inviteData: Partial<Invite>) {
    try {
      const user = await this.getUserById(userId);
      const currentInvite = user.invite || {
        isEnabled: false,
        theme: {
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          titleColor: "#333333",
          nameColor: "#666666",
          backgroundColor: "#ffffff",
          textColor: "#000000"
        },
        about: {
          title: "",
          subtitle: "",
          groom: {
            name: "",
            description: "",
            image: "",
            socials: {}
          },
          bride: {
            name: "",
            description: "",
            image: "",
            socials: {}
          },
          coupleImage: ""
        },
        weddingEvents: [],
        loveStory: [],
        planning: [],
        invitation: {
          heading: "",
          subheading: "",
          message: "",
          rsvpLink: null,
          backgroundImage: null
        }
      };

      const updatedInvite = {
        ...currentInvite,
        ...inviteData,
      };

      await db.collection("users").doc(userId).update({
        invite: updatedInvite,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
      return updatedInvite;
    } catch (error: any) {
      consoleManager.error("Error updating invite:", error);
      throw error;
    }
  }

  // Toggle invite enabled status
  static async toggleInviteStatus(userId: string, isEnabled: boolean) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite) {
        await this.updateInvite(userId, { isEnabled });
      } else {
        await db.collection("users").doc(userId).update({
          "invite.isEnabled": isEnabled,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error toggling invite status:", error);
      throw error;
    }
  }

  // Update invite theme
  static async updateInviteTheme(userId: string, theme: Theme) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite) {
        await this.updateInvite(userId, { theme });
      } else {
        await db.collection("users").doc(userId).update({
          "invite.theme": theme,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error updating invite theme:", error);
      throw error;
    }
  }

  // Add or update wedding event
  static async updateWeddingEvent(userId: string, eventData: WeddingEvent, eventIndex?: number) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite) {
        await this.updateInvite(userId, {
          weddingEvents: [eventData]
        });
        return;
      }

      const events = [...(user.invite.weddingEvents || [])];
      if (typeof eventIndex === 'number' && eventIndex >= 0) {
        events[eventIndex] = eventData;
      } else {
        events.push(eventData);
      }

      await db.collection("users").doc(userId).update({
        "invite.weddingEvents": events,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error updating wedding event:", error);
      throw error;
    }
  }

  // Delete wedding event
  static async deleteWeddingEvent(userId: string, eventIndex: number) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite?.weddingEvents) return;

      const events = [...user.invite.weddingEvents];
      events.splice(eventIndex, 1);

      await db.collection("users").doc(userId).update({
        "invite.weddingEvents": events,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error deleting wedding event:", error);
      throw error;
    }
  }

  // Update love story events
  static async updateLoveStory(userId: string, storyEvents: TimelineEvent[]) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite) {
        await this.updateInvite(userId, { loveStory: storyEvents });
        return;
      }

      await db.collection("users").doc(userId).update({
        "invite.loveStory": storyEvents,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error updating love story:", error);
      throw error;
    }
  }

  // Update planning items
  static async updatePlanning(userId: string, planningItems: PlanningItem[]) {
    try {
      const user = await this.getUserById(userId);
      if (!user.invite) {
        await this.updateInvite(userId, { planning: planningItems });
        return;
      }

      await db.collection("users").doc(userId).update({
        "invite.planning": planningItems,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await this.getAllUsers(true);
    } catch (error: any) {
      consoleManager.error("Error updating planning items:", error);
      throw error;
    }
  }
}

export default UserService;
