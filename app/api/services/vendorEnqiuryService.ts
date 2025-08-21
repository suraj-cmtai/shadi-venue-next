import { db } from "../config/firebase"; // Adjust path to your Firebase config
import consoleManager from "../utils/consoleManager"; // Adjust path to your console manager
import admin from "firebase-admin";

// Define all the types based on your form
export type VendorCategory =
  | "Venue"
  | "Planner"
  | "Photographer"
  | "Decorator"
  | "Caterer"
  | "Makeup"
  | "Entertainment"
  | "Others";
export type Designation = "Owner" | "Manager" | "Other";
export type ServiceArea =
  | "Local City"
  | "Statewide"
  | "Pan India"
  | "International";
export type PaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Card" | "Other";
export type Facility =
  | "Rooms"
  | "Parking"
  | "Catering"
  | "Decor"
  | "DJ"
  | "Liquor License"
  | "Pool"
  | "Other";

// The main interface for a vendor enquiry
export interface VendorEnquiry {
  id: string;
  businessName: string;
  category: VendorCategory;
  yearOfEstablishment?: string;
  contactPersonName: string;
  designation: Designation;
  mobileNumber: string;
  whatsappNumber?: string;
  emailId: string;
  websiteOrSocial?: string;
  fullAddress: string;
  city: string;
  state: string;
  pinCode: string;
  serviceAreas: ServiceArea;
  servicesOffered: string[];
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  facilitiesAvailable?: Facility[];
  specialities?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  portfolioImageUrls?: string[];
  videoLinks?: string[];
  about?: string;
  awards?: string;
  notableClients?: string;
  advancePaymentPercent?: number;
  refundPolicy?: string;
  paymentModesAccepted?: PaymentMode[];
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
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
      businessName: data.businessName || "",
      category: data.category || "Others",
      yearOfEstablishment: data.yearOfEstablishment || "",
      contactPersonName: data.contactPersonName || "",
      designation: data.designation || "Other",
      mobileNumber: data.mobileNumber || "",
      whatsappNumber: data.whatsappNumber || "",
      emailId: data.emailId || "",
      websiteOrSocial: data.websiteOrSocial || "",
      fullAddress: data.fullAddress || "",
      city: data.city || "",
      state: data.state || "",
      pinCode: data.pinCode || "",
      serviceAreas: data.serviceAreas || "Local City",
      servicesOffered: data.servicesOffered || [],
      startingPrice: Number(data.startingPrice || 0),
      guestCapacityMin: data.guestCapacityMin
        ? Number(data.guestCapacityMin)
        : undefined,
      guestCapacityMax: data.guestCapacityMax
        ? Number(data.guestCapacityMax)
        : undefined,
      facilitiesAvailable: data.facilitiesAvailable || [],
      specialities: data.specialities || "",
      logoUrl: data.logoUrl || "",
      coverImageUrl: data.coverImageUrl || "",
      portfolioImageUrls: data.portfolioImageUrls || [],
      videoLinks: data.videoLinks || [],
      about: data.about || "",
      awards: data.awards || "",
      notableClients: data.notableClients || "",
      advancePaymentPercent: data.advancePaymentPercent
        ? Number(data.advancePaymentPercent)
        : undefined,
      refundPolicy: data.refundPolicy || "",
      paymentModesAccepted: data.paymentModesAccepted || [],
      status: data.status || "Pending",
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
    };
  }

  static async createEnquiry(
    enquiryData: Omit<VendorEnquiry, "id" | "createdAt" | "updatedAt">
  ): Promise<VendorEnquiry> {
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

  static async getAllEnquiries(): Promise<VendorEnquiry[]> {
    try {
      const snapshot = await db
        .collection(this.collectionName)
        .orderBy("createdAt", "desc")
        .get();
      const enquiries = snapshot.docs.map((doc: any) =>
        this.convertToType(doc.id, doc.data())
      );
      consoleManager.log(
        "Firestore Read: Fetched all vendor enquiries, count:",
        enquiries.length
      );
      return enquiries;
    } catch (error: any) {
      consoleManager.error("Error fetching all vendor enquiries:", error);
      throw error;
    }
  }

  static async updateEnquiry(
    id: string,
    updateData: Partial<Omit<VendorEnquiry, "id" | "createdAt">>
  ): Promise<VendorEnquiry> {
    try {
      const enquiryRef = db.collection(this.collectionName).doc(id);
      await enquiryRef.update({
        ...updateData,
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
}

export default VendorEnquiryService;
