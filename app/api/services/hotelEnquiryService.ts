import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";
import HotelService from "./hotelServices";

/**
 * HotelEnquiry interface (now includes authId for hotel-specific queries)
 * Fields: id, hotelName, city, status, createdAt, updatedAt, authId
 */
export interface HotelEnquiry {
  id: string;
  hotelName: string;
  city: string;
  status: "Pending" | "Contacted" | "Closed";
  createdAt: string;
  updatedAt: string;
  authId: string; // The authId of the hotel user
}

class HotelEnquiryService {
  private static collectionName = "hotelEnquiries";

  private static convertTimestampToString(timestamp: any): string {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  }

  private static convertToType(id: string, data: any): HotelEnquiry {
    return {
      id,
      hotelName: data.hotelName || "Unknown Hotel",
      city: data.city || "Unknown City",
      status: data.status || "Pending",
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
      authId: data.authId || "",
    };
  }

  /**
   * Create a new hotel enquiry. Requires authId in enquiryData.
   */
  static async createEnquiry(
    enquiryData: Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">
  ): Promise<HotelEnquiry> {
    try {
      if (!enquiryData.authId) {
        throw new Error("authId is required to create a hotel enquiry.");
      }
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newEnquiryRef = await db.collection(this.collectionName).add({
        ...enquiryData,
        status: enquiryData.status || "Pending",
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const newEnquiryDoc = await newEnquiryRef.get();
      if (!newEnquiryDoc.exists) {
        throw new Error("Failed to create and retrieve the new enquiry.");
      }

      consoleManager.log(
        "Firestore Write: New hotel enquiry created with ID:",
        newEnquiryRef.id
      );
      return this.convertToType(newEnquiryDoc.id, newEnquiryDoc.data());
    } catch (error: any) {
      consoleManager.error("Error creating new hotel enquiry:", error);
      throw error;
    }
  }

  /**
   * Get all hotel enquiries. If authId is provided, only return those for that hotel.
   */
  static async getAllEnquiries(): Promise<HotelEnquiry[]> {
    try {
      const query = db.collection(this.collectionName).orderBy("createdAt", "desc");
      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );

      consoleManager.log(
        "Firestore Read: Fetched all hotel enquiries, count:",
        enquiries.length
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching hotel enquiries:", error);
      throw error;
    }
  }

  /**
   * Get a single hotel enquiry by its ID.
   */
  static async getEnquiryById(id: string): Promise<HotelEnquiry | null> {
    try {
      const doc = await db.collection(this.collectionName).doc(id).get();
      if (!doc.exists) {
        consoleManager.log(`Firestore Read: No hotel enquiry found with ID: ${id}`);
        return null;
      }
      consoleManager.log(`Firestore Read: Fetched hotel enquiry with ID: ${id}`);
      return this.convertToType(doc.id, doc.data());
    } catch (error: any) {
      consoleManager.error(`Error fetching hotel enquiry by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a hotel enquiry by ID. authId cannot be changed.
   */
  static async updateEnquiry(
    id: string,
    updateData: Partial<Omit<HotelEnquiry, "id" | "createdAt" | "authId">>
  ): Promise<HotelEnquiry> {
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
        throw new Error("Hotel enquiry not found after update.");
      }

      consoleManager.log(
        "Firestore Write: Updated hotel enquiry with ID:",
        id
      );
      return this.convertToType(updatedDoc.id, updatedDoc.data());
    } catch (error: any) {
      consoleManager.error(`Error updating hotel enquiry ${id}:`, error);
      throw error;
    }
  }

  static async deleteEnquiry(id: string): Promise<{ id: string }> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      consoleManager.log(
        "Firestore Write: Deleted hotel enquiry with ID:",
        id
      );
      return { id };
    } catch (error: any) {
      consoleManager.error(`Error deleting hotel enquiry ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get hotel enquiries by authId, but only if the hotel isPremium is true.
   * Uses HotelService.getHotelById to fetch the hotel.
   * Throws error if hotel is not found or not premium.
   */
  static async getEnquiryByAuthId(authId: string): Promise<HotelEnquiry[]> {
    try {
      if (!authId) {
        throw new Error("authId is required.");
      }

      

      

      // Use HotelService.getHotelById to get the hotel (ensures consistent conversion)
      const hotel = await HotelService.getHotelById(authId);

      if (!hotel) {
        throw new Error("Hotel not found for the provided authId.");
      }

      if (!hotel.isPremium) {
        throw new Error("Access denied: Hotel is not premium.");
      }

      // If premium, fetch hotel enquiries for this authId
      let query = db
        .collection(this.collectionName)
        .where("authId", "==", authId)
        .orderBy("createdAt", "desc");

      const snapshot = await query.get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );

      consoleManager.log(
        "Firestore Read: Fetched hotel enquiries for premium hotel, count:",
        enquiries.length,
        `(authId: ${authId})`
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching hotel enquiries by authId (premium only):", error);
      throw error;
    }
  }
}

export default HotelEnquiryService;