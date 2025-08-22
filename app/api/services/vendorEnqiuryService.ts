import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";
import VendorService from "./vendorServices";

/**
 * VendorEnquiry interface (extended)
 * Includes name, email, phoneNumber, status, and authId.
 */
export enum VendorEnquiryStatus {
  NEW = "New",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface VendorEnquiry {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: VendorEnquiryStatus;
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the vendor user
}

class VendorEnquiryService {
  private static collectionName = "vendorEnquiries";

  private static convertTimestampToString(timestamp: any): string {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  }

  private static convertToType(id: string, data: any): VendorEnquiry {
    return {
      id,
      name: data.name || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      status: (data.status as VendorEnquiryStatus) || VendorEnquiryStatus.NEW,
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
      authId: data.authId || "",
    };
  }

  /**
   * Create a new vendor enquiry. Requires authId in enquiryData.
   */
  static async createEnquiry(
    enquiryData: Omit<VendorEnquiry, "id" | "createdAt" | "updatedAt">
  ): Promise<VendorEnquiry> {
    try {
      if (!enquiryData.authId) {
        throw new Error("authId is required to create a vendor enquiry.");
      }
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newEnquiryRef = await db.collection(this.collectionName).add({
        ...enquiryData,
        status: enquiryData.status || VendorEnquiryStatus.NEW,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      const newEnquiryDoc = await newEnquiryRef.get();
      if (!newEnquiryDoc.exists) {
        throw new Error("Failed to create and retrieve the new enquiry.");
      }
      consoleManager.log(
        "Firestore Write: New vendor enquiry created with ID:",
        newEnquiryRef.id
      );
      return this.convertToType(newEnquiryDoc.id, newEnquiryDoc.data());
    } catch (error: any) {
      consoleManager.error("Error creating new vendor enquiry:", error);
      throw error;
    }
  }

  /**
   * Get all vendor enquiries. Returns all enquiries, ignoring authId.
   */
  static async getAllEnquiries(): Promise<VendorEnquiry[]> {
    try {
      const query = db.collection(this.collectionName).orderBy("createdAt", "desc");
      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );
      consoleManager.log(
        "Firestore Read: Fetched all vendor enquiries, count:",
        enquiries.length
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching vendor enquiries:", error);
      throw error;
    }
  }

  /**
   * Get a single vendor enquiry by its ID.
   */
  static async getEnquiryById(id: string): Promise<VendorEnquiry | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) {
        consoleManager.log(`Firestore Read: No vendor enquiry found with ID: ${id}`);
        return null;
      }
      consoleManager.log(`Firestore Read: Fetched vendor enquiry with ID: ${id}`);
      return this.convertToType(doc.id, doc.data());
    } catch (error: any) {
      consoleManager.error(`Error fetching vendor enquiry by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a vendor enquiry by ID. authId cannot be changed.
   */
  static async updateEnquiry(
    id: string,
    updateData: Partial<Omit<VendorEnquiry, "id" | "createdAt" | "authId">>
  ): Promise<VendorEnquiry> {
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
        throw new Error("Vendor enquiry not found after update.");
      }
      consoleManager.log(
        "Firestore Write: Updated vendor enquiry with ID:",
        id
      );
      return this.convertToType(updatedDoc.id, updatedDoc.data());
    } catch (error: any) {
      consoleManager.error(`Error updating vendor enquiry ${id}:`, error);
      throw error;
    }
  }

  static async deleteEnquiry(id: string): Promise<{ id: string }> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      consoleManager.log(
        "Firestore Write: Deleted vendor enquiry with ID:",
        id
      );
      return { id };
    } catch (error: any) {
      consoleManager.error(`Error deleting vendor enquiry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get vendor enquiries by authId, but only if the vendor isPremium is true.
   * Uses VendorService.getVendorById to fetch the vendor.
   * Throws error if vendor is not found or not premium.
   */
  static async getEnquiryByAuthId(authId: string): Promise<VendorEnquiry[]> {
    try {
      if (!authId) {
        throw new Error("authId is required.");
      }

      // Use VendorService.getVendorById to get the vendor (ensures consistent conversion)
      const vendor = await VendorService.getVendorById(authId);

      if (!vendor) {
        throw new Error("Vendor not found for the provided authId.");
      }

      if (!vendor.isPremium) {
        throw new Error("Access denied: Vendor is not premium.");
      }

      // If premium, fetch vendor enquiries for this authId
      let query = db
        .collection(this.collectionName)
        .where("authId", "==", authId)
        .orderBy("createdAt", "desc");

      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );

      consoleManager.log(
        "Firestore Read: Fetched vendor enquiries for premium vendor, count:",
        enquiries.length,
        `(authId: ${authId})`
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching vendor enquiries by authId (premium only):", error);
      throw error;
    }
  }
}

export default VendorEnquiryService;
