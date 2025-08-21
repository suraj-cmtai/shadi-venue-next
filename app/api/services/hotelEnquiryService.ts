import { db } from "../config/firebase"; 
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export interface HotelEnquiry {
  id: string;
  hotelName: string; 
  city: string;      
  
  // Optional Fields
  name?: string;
  phone?: string;
  email?: string;
  
  eventType: string;
  eventDate: string;
  guestCount: number;
  message?: string;
  status: "Pending" | "Contacted" | "Closed";
  
  // System fields
  createdAt: string;
  updatedAt: string;
}

class HotelEnquiryService {
  private static collectionName = "hotelEnquiries";
  
  private static convertTimestampToString(timestamp: any): string {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    return new Date().toISOString();
  }
  
  private static convertToType(id: string, data: any): HotelEnquiry {
    return {
      id,
      hotelName: data.hotelName || "Unknown Hotel",
      city: data.city || "Unknown City",
      name: data.name || "", // Default to empty string if not present
      phone: data.phone || "", // Default to empty string
      email: data.email || "", // Default to empty string
      eventType: data.eventType || "General Enquiry",
      eventDate: data.eventDate || "",
      guestCount: Number(data.guestCount || 0),
      message: data.message || "",
      status: data.status || "Pending",
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
    };
  }

  static async createEnquiry(enquiryData: Omit<HotelEnquiry, "id" | "createdAt" | "updatedAt">): Promise<HotelEnquiry> {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newEnquiryRef = await db.collection(this.collectionName).add({
        ...enquiryData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      const newEnquiryDoc = await newEnquiryRef.get();
      if (!newEnquiryDoc.exists) {
        throw new Error("Failed to create and retrieve the new enquiry.");
      }
      
      consoleManager.log("Firestore Write: New hotel enquiry created with ID:", newEnquiryRef.id);
      return this.convertToType(newEnquiryDoc.id, newEnquiryDoc.data());

    } catch (error: any) {
      consoleManager.error("Error creating new hotel enquiry:", error);
      throw error;
    }
  }

  static async getAllEnquiries(): Promise<HotelEnquiry[]> {
    try {
      const snapshot = await db.collection(this.collectionName).orderBy("createdAt", "desc").get();
      const enquiries = snapshot.docs.map((doc: any) => this.convertToType(doc.id, doc.data()));
      
      consoleManager.log("Firestore Read: Fetched all hotel enquiries, count:", enquiries.length);
      return enquiries;

    } catch (error: any) {
      consoleManager.error("Error fetching all hotel enquiries:", error);
      throw error;
    }
  }
  
  static async updateEnquiry(id: string, updateData: Partial<Omit<HotelEnquiry, "id" | "createdAt">>): Promise<HotelEnquiry> {
    try {
      const enquiryRef = db.collection(this.collectionName).doc(id);
      await enquiryRef.update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const updatedDoc = await enquiryRef.get();
      if (!updatedDoc.exists) {
        throw new Error("Hotel enquiry not found after update.");
      }
      
      consoleManager.log("Firestore Write: Updated hotel enquiry with ID:", id);
      return this.convertToType(updatedDoc.id, updatedDoc.data());

    } catch (error: any) {
      consoleManager.error(`Error updating hotel enquiry ${id}:`, error);
      throw error;
    }
  }

  static async deleteEnquiry(id: string): Promise<{ id: string }> {
    try {
      await db.collection(this.collectionName).doc(id).delete();
      consoleManager.log("Firestore Write: Deleted hotel enquiry with ID:", id);
      return { id };
    } catch (error: any) {
      consoleManager.error(`Error deleting hotel enquiry ${id}:`, error);
      throw error;
    }
  }
}

export default HotelEnquiryService;