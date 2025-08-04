import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export type VendorType = 'flower' | 'catering' | 'decoration' | 'photography' | 'music' | 'other';
export type VendorStatus = 'active' | 'inactive';

interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  description: string;
  services: string[];
  pricing: {
    basePrice: number;
    currency: 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  portfolio: {
    images: string[];
    videos?: string[];
  };
  rating: number;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  availability: {
    days: string[];
    hours: string;
  };
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
}

class VendorService {
  static vendors: Vendor[] = [];
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

  private static convertToType(id: string, data: any): Vendor {
    return {
      id,
      name: data.name || "",
      type: data.type || "other",
      description: data.description || "",
      services: data.services || [],
      pricing: {
        basePrice: Number(data.pricing?.basePrice || 0),
        currency: data.pricing?.currency || "USD",
      },
      location: {
        address: data.location?.address || "",
        city: data.location?.city || "",
        state: data.location?.state || "",
        country: data.location?.country || "",
      },
      contactInfo: {
        phone: data.contactInfo?.phone || "",
        email: data.contactInfo?.email || "",
        website: data.contactInfo?.website || "",
      },
      portfolio: {
        images: data.portfolio?.images || [],
        videos: data.portfolio?.videos || [],
      },
      rating: Number(data.rating || 0),
      reviews: data.reviews || [],
      availability: {
        days: data.availability?.days || [],
        hours: data.availability?.hours || "",
      },
      status: data.status || "inactive",
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
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
      const snapshot = await db.collection("vendors").orderBy("createdAt", "desc").get();
      this.vendors = snapshot.docs.map((doc: any) => {
        return this.convertToType(doc.id, doc.data());
      });
      this.isInitialized = true;
    }
    return this.vendors;
  }

  static async addVendor(vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const timestamp = admin.firestore.FieldValue.serverTimestamp();
      const newVendorRef = await db.collection("vendors").add({
        ...vendorData,
        rating: 0,
        reviews: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      const vendor = this.vendors.find((vendor) => vendor.id === id);
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

      await new Promise(resolve => setTimeout(resolve, 100));
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

  static async getVendorsByType(type: VendorType) {
    return this.vendors.filter(vendor => vendor.type === type);
  }

  static async getActiveVendors() {
    return this.vendors.filter(vendor => vendor.status === "active");
  }

  static async searchVendors(query: string) {
    const searchTerm = query.toLowerCase();
    return this.vendors.filter(vendor => 
      vendor.name.toLowerCase().includes(searchTerm) ||
      vendor.description.toLowerCase().includes(searchTerm) ||
      vendor.type.toLowerCase().includes(searchTerm) ||
      vendor.location.city.toLowerCase().includes(searchTerm) ||
      vendor.location.country.toLowerCase().includes(searchTerm)
    );
  }
}

export default VendorService;
