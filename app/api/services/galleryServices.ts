import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

class GalleryService {
    static galleries: any[] = [];
    static isInitialized = false;

    // Initialize Firestore real-time listener (runs once)
    static initGalleries() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for galleries...");
        const galleriesCollection = db.collection("galleries");

        galleriesCollection.onSnapshot((snapshot: any) => {
            this.galleries = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            consoleManager.log("Firestore Read: Galleries updated, count:", this.galleries.length);
        });

        this.isInitialized = true;
    }
    private static convertTimestamp(timestamp: any): Date {
        if (timestamp && timestamp._seconds) {
          return new Date(timestamp._seconds * 1000);
        }
        return timestamp instanceof Date ? timestamp : new Date(timestamp);
      }

      private static convertToType(id: string, data: any): any {
        return {
            id,
            title: data.title || "",
            image: data.image || "",
            category: data.category || "",
            description: data.description || "",
            status: data.status || "active",
            createdOn: this.convertTimestamp(data.createdOn),
            updatedOn: this.convertTimestamp(data.updatedOn),
        }
    }

    // Get all galleries (Uses cache unless forceRefresh is true)
    static async getAllGalleries(forceRefresh = false) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing galleries from Firestore...");
            const snapshot = await db.collection("galleries").orderBy("createdOn", "desc").get();
            this.galleries = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached galleries. No Firestore read.");
        }
        return this.galleries;
    }

    // Add a new gallery with createdOn timestamp   
    static async addGallery(galleryData: any) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newGalleryRef = await db.collection("galleries").add({
                ...galleryData,
                status: galleryData.status || 'active',
                createdOn: timestamp,
            });

            consoleManager.log("New gallery added with ID:", newGalleryRef.id);

            // Force refresh the cache after adding a new gallery
            await this.getAllGalleries(true);

            return { id: newGalleryRef.id, ...galleryData, createdOn: timestamp };
        } catch (error) {
            consoleManager.error("Error adding gallery:", error);
            throw new Error("Failed to add gallery");
        }
    }

    // Get gallery by ID (fetches from cache first)
    static async getGalleryById(galleryId: string) {
        try {
            // Check if gallery exists in cache
            const cachedGallery = this.galleries.find((g: any) => g.id === galleryId);
            if (cachedGallery) {
                consoleManager.log("Gallery fetched from cache:", galleryId);
                return cachedGallery;
            }

            // Fetch from Firestore if not in cache
            const galleryRef = db.collection("galleries").doc(galleryId);
            const doc = await galleryRef.get();

            if (!doc.exists) {
                consoleManager.warn("Gallery not found:", galleryId);
                return null;
            }

            consoleManager.log("Gallery fetched from Firestore:", galleryId);
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            consoleManager.error("❌ Error fetching gallery by ID:", error);
            throw new Error("Failed to fetch gallery");
        }
    }

    // Update gallery with updatedOn timestamp
    static async updateGallery(galleryId: string, updatedData: any) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const galleryRef = db.collection("galleries").doc(galleryId);
            await galleryRef.update({
                ...updatedData,
                updatedOn: timestamp,
            });

            consoleManager.log("Gallery updated:", galleryId);

            // Force refresh the cache after updating a gallery
            await this.getAllGalleries(true);

            return { id: galleryId, ...updatedData, updatedOn: timestamp };
        } catch (error) {
            consoleManager.error("Error updating gallery:", error);
            throw new Error("Failed to update gallery");
        }
    }

    // Delete gallery
    static async deleteGallery(galleryId: string) {
        try {
            await db.collection("galleries").doc(galleryId).delete();
            consoleManager.log("Gallery deleted:", galleryId);

            // Force refresh the cache after deleting a gallery
            await this.getAllGalleries(true);

            return { success: true, message: "Gallery deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting gallery:", error);
            throw new Error("Failed to delete gallery");
        }
    }

    // Get all active galleries (Uses cache)
    static async getAllActiveGalleries(forceRefresh = true) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing active galleries from Firestore...");
            const snapshot = await db
                .collection("galleries")
                .where("status", "==", "active")
                .orderBy("createdOn", "desc")
                .get();
            this.galleries = snapshot.docs.map((doc: any) => {return this.convertToType(doc.id, doc.data())});
        } else {
            consoleManager.log("Returning cached active galleries. No Firestore read.");
        }
        return this.galleries;
    }
}

export default GalleryService;
