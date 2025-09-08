import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";
import BanquetService from "./banquetServices";

/**
 * BanquetEnquiry interface (extended)
 * Includes name, email, phoneNumber, status, and authId.
 */
export enum BanquetEnquiryStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface BanquetEnquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: BanquetEnquiryStatus;
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the banquet user
  message: string;
}

class BanquetEnquiryService {
  private static collectionName = "banquetEnquiries";

  private static convertTimestampToString(timestamp: any): string {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  }

  private static convertToType(id: string, data: any): BanquetEnquiry {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      status: (data.status as BanquetEnquiryStatus) || BanquetEnquiryStatus.NEW,
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
      authId: data.authId || "",
      message: data.message || "",
    };
  }

  /**
   * Create a new banquet enquiry. Requires authId in enquiryData.
   */
  static async createEnquiry(
    enquiryData: Omit<BanquetEnquiry, "id" | "createdAt" | "updatedAt">
  ): Promise<BanquetEnquiry> {
    try {
      if (!enquiryData.authId) {
        throw new Error("authId is required to create a banquet enquiry.");
      }
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newEnquiryRef = await db.collection(this.collectionName).add({
        ...enquiryData,
        status: enquiryData.status || BanquetEnquiryStatus.NEW,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      const newEnquiryDoc = await newEnquiryRef.get();
      if (!newEnquiryDoc.exists) {
        throw new Error("Failed to create and retrieve the new enquiry.");
      }
      consoleManager.log(
        "Firestore Write: New banquet enquiry created with ID:",
        newEnquiryRef.id
      );
      return this.convertToType(newEnquiryDoc.id, newEnquiryDoc.data());
    } catch (error: any) {
      consoleManager.error("Error creating new banquet enquiry:", error);
      throw error;
    }
  }

  /**
   * Get all banquet enquiries. Returns all enquiries, ignoring authId.
   */
  static async getAllEnquiries(): Promise<BanquetEnquiry[]> {
    try {
      const query = db.collection(this.collectionName).orderBy("createdAt", "desc");
      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );
      consoleManager.log(
        "Firestore Read: Fetched all banquet enquiries, count:",
        enquiries.length
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching banquet enquiries:", error);
      throw error;
    }
  }

  /**
   * Get a single banquet enquiry by its ID.
   */
  static async getEnquiryById(id: string): Promise<BanquetEnquiry | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) {
        consoleManager.log(`Firestore Read: No banquet enquiry found with ID: ${id}`);
        return null;
      }
      consoleManager.log(`Firestore Read: Fetched banquet enquiry with ID: ${id}`);
      return this.convertToType(doc.id, doc.data());
    } catch (error: any) {
      consoleManager.error(`Error fetching banquet enquiry by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a banquet enquiry by ID. authId cannot be changed.
   */
  static async updateEnquiry(
    id: string,
    updateData: Partial<Omit<BanquetEnquiry, "id" | "createdAt" | "authId" | "message">>
  ): Promise<BanquetEnquiry> {
    try {
      const enquiryRef = db.collection(this.collectionName).doc(id);
      // Prevent authId from being updated
      const { authId, ...restUpdate } = updateData as any;
      await enquiryRef.update({
        ...restUpdate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const updatedDoc = await enquiryRef.get();
      if (!updatedDoc.exists) {
        throw new Error("Banquet enquiry not found after update.");
      }
      consoleManager.log(
        "Firestore Write: Updated banquet enquiry with ID:",
        id
      );
      return this.convertToType(updatedDoc.id, updatedDoc.data());
    } catch (error: any) {
      consoleManager.error(`Error updating banquet enquiry ${id}:`, error);
      throw error;
    }
  }

  static async deleteEnquiry(id: string): Promise<{ id: string }> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      consoleManager.log(
        "Firestore Write: Deleted banquet enquiry with ID:",
        id
      );
      return { id };
    } catch (error: any) {
      consoleManager.error(`Error deleting banquet enquiry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get banquet enquiries by authId, but only if the banquet isPremium is true.
   * Uses BanquetService.getBanquetById to fetch the banquet.
   * Throws error if banquet is not found or not premium.
   */
  static async getEnquiryByAuthId(authId: string): Promise<BanquetEnquiry[]> {
    try {
      if (!authId) {
        throw new Error("authId is required.");
      }

      // Use BanquetService.getBanquetById to get the banquet (ensures consistent conversion)
      const banquet = await BanquetService.getBanquetById(authId);

      if (!banquet) {
        throw new Error("Banquet not found for the provided authId.");
      }

      if (!banquet.isPremium) {
        throw new Error("Access denied: Banquet is not premium.");
      }

      // If premium, fetch banquet enquiries for this authId
      let query = db
        .collection(this.collectionName)
        .where("authId", "==", authId)
        .orderBy("createdAt", "desc");

      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );

      consoleManager.log(
        "Firestore Read: Fetched banquet enquiries for premium banquet, count:",
        enquiries.length,
        `(authId: ${authId})`
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching banquet enquiries by authId (premium only):", error);
      throw error;
    }
  }
}

export default BanquetEnquiryService;
