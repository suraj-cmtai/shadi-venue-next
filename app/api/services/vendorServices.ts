import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

// Vendor Category options as per new requirements
export type VendorCategory =
  | "Venue"
  | "Planner"
  | "Photographer"
  | "Decorator"
  | "Caterer"
  | "Makeup"
  | "Entertainment"
  | "Others";

// Service Areas options
export type ServiceArea =
  | "Local City"
  | "Statewide"
  | "Pan India"
  | "International";

// Payment Modes
export type PaymentMode =
  | "UPI"
  | "Cash"
  | "Bank Transfer"
  | "Card"
  | "Other";

// Facilities for venues
export type Facility =
  | "Rooms"
  | "Parking"
  | "Catering"
  | "Decor"
  | "DJ"
  | "Liquor License"
  | "Pool"
  | "Other";

// Vendor interface as per new registration form
export interface Vendor {
  id: string;

  // Step 1: Basic Business Info
  name: string;
  category: VendorCategory;
  yearOfEstablishment?: string;

  // Step 2: Contact Details
  contactPersonName: string;
  designation: "Owner" | "Manager" | "Other";
  mobileNumber: string;
  mobileVerified?: boolean;
  whatsappNumber?: string;
  email: string;
  websiteOrSocial?: string;

  // Step 3: Location & Coverage
  address: string;
  city: string;
  state: string;
  pinCode: string;
  serviceAreas: ServiceArea[];

  // Step 4: Services / Venue Details
  servicesOffered: string[];
  startingPrice: number;
  guestCapacityMin?: number;
  guestCapacityMax?: number;
  facilitiesAvailable?: Facility[];
  specialities?: string;

  // Step 5: Portfolio Upload
  logoUrl: string;
  coverImageUrl: string;
  portfolioImages: string[]; // up to 10–15
  videoLinks?: string[]; // YouTube/Vimeo

  // Step 6: Business Highlights
  about: string;
  awards?: string;
  notableClients?: string;

  // Step 7: Payment & Booking Terms
  advancePaymentPercent?: number;
  refundPolicy?: string;
  paymentModesAccepted: PaymentMode[];

  // Step 8: Account Setup
  username: string;
  passwordHash?: string; // never expose plain password
  agreedToTerms: boolean;

  // System fields
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;

  // Premium field
  isPremium?: boolean;
  isFeatured?: boolean;
}

class VendorService {
  static vendors: Vendor[] = [];
  static isInitialized = false;

  private static convertTimestampToString(timestamp: any): string {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toISOString();
    }
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toISOString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toISOString();
    }
    if (typeof timestamp === "string") {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
    }
    if (typeof timestamp === "number") {
      return new Date(timestamp).toISOString();
    }
    return new Date().toISOString();
  }

  private static convertToType(id: string, data: any): Vendor {
    return {
      id,
      name: data.name || "",
      category: data.category || "Others",
      yearOfEstablishment: data.yearOfEstablishment || "",
      contactPersonName: data.contactPersonName || "",
      designation: data.designation || "Other",
      mobileNumber: data.mobileNumber || "",
      mobileVerified: data.mobileVerified ?? false,
      whatsappNumber: data.whatsappNumber || "",
      email: data.email || "",
      websiteOrSocial: data.websiteOrSocial || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      pinCode: data.pinCode || "",
      serviceAreas: data.serviceAreas || [],
      servicesOffered: data.servicesOffered || [],
      startingPrice: Number(data.startingPrice || 0),
      guestCapacityMin: data.guestCapacityMin ? Number(data.guestCapacityMin) : undefined,
      guestCapacityMax: data.guestCapacityMax ? Number(data.guestCapacityMax) : undefined,
      facilitiesAvailable: data.facilitiesAvailable || [],
      specialities: data.specialities || "",
      logoUrl: data.logoUrl || "",
      coverImageUrl: data.coverImageUrl || "",
      portfolioImages: data.portfolioImages || [],
      videoLinks: data.videoLinks || [],
      about: data.about || "",
      awards: data.awards || "",
      notableClients: data.notableClients || "",
      advancePaymentPercent: data.advancePaymentPercent ? Number(data.advancePaymentPercent) : undefined,
      refundPolicy: data.refundPolicy || "",
      paymentModesAccepted: data.paymentModesAccepted || [],
      username: data.username || "",
      passwordHash: data.passwordHash || "",
      agreedToTerms: !!data.agreedToTerms,
      status: data.status || "inactive",
      createdAt: this.convertTimestampToString(data.createdAt),
      updatedAt: this.convertTimestampToString(data.updatedAt),
      isPremium: data.isPremium ?? false,
      isFeatured: data.isFeatured ?? false,
    };
  }

  static initVendors() {
    if (this.isInitialized) return;

    consoleManager.log("Initializing Firestore listener for vendors...");
    const vendorsCollection = db.collection("vendors");

    vendorsCollection.onSnapshot((snapshot: any) => {
      this.vendors = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      consoleManager.log("Firestore Read: Vendors updated, count:", this.vendors.length);
    });

    this.isInitialized = true;
  }

  static async getAllVendors(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      this.initVendors();
      const snapshot = await db.collection("vendors").orderBy("createdAt", "desc").get();
      this.vendors = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    }
    return this.vendors;
  }

  static async addVendor(vendorData: Omit<Vendor, "id" | "createdAt" | "updatedAt">) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newVendorRef = await db.collection("vendors").add({
        ...vendorData,
        isPremium: vendorData.isPremium ?? false,
        isFeatured: vendorData.isFeatured ?? false,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const newVendorDoc = await db.collection("vendors").doc(newVendorRef.id).get();
      const newVendor = this.convertToType(newVendorDoc.id, newVendorDoc.data());

      await this.getAllVendors(true);

      return newVendor;
    } catch (error: any) {
      consoleManager.error("Error adding new vendor:", error);
      throw error;
    }
  }

  static async getVendorById(id: string) {
    try {
      const vendor = this.vendors.find((vendor) => vendor.id == id);
      if (vendor) {
        return vendor;
      }

      const vendorDoc = await db.collection("vendors").doc(id).get();

      if (!vendorDoc.exists) {
        throw new Error("Vendor not found");
      }

      return this.convertToType(vendorDoc.id, vendorDoc.data());
    } catch (error) {
      consoleManager.error(`Error fetching vendor ${id}:`, error);
      throw error;
    }
  }

  static async updateVendor(id: string, updateData: Partial<Vendor>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const vendorRef = db.collection("vendors").doc(id);
      await vendorRef.update({
        ...updateData,
        updatedAt: timestamp,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
      await this.getAllVendors(true);

      return await this.getVendorById(id);
    } catch (error: any) {
      consoleManager.error("Error updating vendor:", error);
      throw error;
    }
  }

  static async deleteVendor(id: string) {
    try {
      await db.collection("vendors").doc(id).delete();
      await this.getAllVendors(true);
      return { id };
    } catch (error: any) {
      consoleManager.error("Error deleting vendor:", error);
      throw error;
    }
  }

  static async getVendorsByCategory(category: VendorCategory) {
    return this.vendors.filter((vendor) => vendor.category === category);
  }

  static async getActiveVendors(forceRefresh = true) {
    if (forceRefresh || !this.isInitialized) {
      consoleManager.log("Force refreshing active vendors from Firestore...");
      const snapshot = await db
        .collection("vendors")
        .where("status", "==", "active")
        .orderBy("createdAt", "desc")
        .get();
      this.vendors = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
    } else {
      consoleManager.log("Returning cached active vendors. No Firestore read.");
    }
    return this.vendors;
  }

  static async searchVendors(query: string) {
    const searchTerm = query.toLowerCase();
    return this.vendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchTerm) ||
      vendor.category.toLowerCase().includes(searchTerm) ||
      vendor.city.toLowerCase().includes(searchTerm) ||
      vendor.state.toLowerCase().includes(searchTerm) ||
      vendor.address.toLowerCase().includes(searchTerm) ||
      vendor.servicesOffered.some((service) => service.toLowerCase().includes(searchTerm)) ||
      (vendor.specialities && vendor.specialities.toLowerCase().includes(searchTerm)) ||
      (vendor.about && vendor.about.toLowerCase().includes(searchTerm))
    );
  }

  static async getPremiumVendors(forceRefresh = true, status: "active" | "inactive" = 'active') {
    if (forceRefresh || !this.isInitialized) {
        this.initVendors();
        consoleManager.log("Force refreshing premium vendors from Firestore...");
        const snapshot = await db
            .collection("vendors")
            .where("isPremium", "==", true)
            .where("isFeatured", "==", true)
            .where("status", "==", status)
            .orderBy("createdAt", "desc")
            .get();
        const premiumVendors = snapshot.docs.map((doc: any) => this.convertToType(doc.id, doc.data()));
        return premiumVendors;
    } else {
        consoleManager.log("Returning cached premium vendors. No Firestore read.");
        return this.vendors.filter(vendor => vendor.isPremium && vendor.status === status);
    }
  }

  // Debug method to check vendor count
  static async getVendorCount() {
    try {
      const snapshot = await db.collection("vendors").get();
      consoleManager.log(`Total vendors in database: ${snapshot.size}`);
      return snapshot.size;
    } catch (error) {
      consoleManager.error("Error getting vendor count:", error);
      return 0;
    }
  }
}

export default VendorService;
