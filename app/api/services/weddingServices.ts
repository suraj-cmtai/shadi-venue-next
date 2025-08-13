import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

class WeddingService {
    static weddings: any[] = [];
    static isInitialized = false;

    // Initialize Firestore real-time listener (runs once)
    static initWeddings() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for weddings...");
        const weddingsCollection = db.collection("weddings");

        weddingsCollection.onSnapshot((snapshot: any) => {
            this.weddings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            consoleManager.log("Firestore Read: Weddings updated, count:", this.weddings.length);
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
            coupleNames: data.coupleNames || "",
            location: data.location || "",
            photoCount: data.photoCount || 0,
            weddingDate: data.weddingDate || "",
            theme: data.theme || "",
            description: data.description || "",
            status: data.status || "active",
            images: data.images || {
                main: "",
                thumbnail1: "",
                thumbnail2: "",
                gallery: []
            },
            createdOn: this.convertTimestamp(data.createdOn),
            updatedOn: this.convertTimestamp(data.updatedOn),
        }
    }

    // Get all weddings (Uses cache unless forceRefresh is true)
    static async getAllWeddings(forceRefresh = false) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing weddings from Firestore...");
            const snapshot = await db.collection("weddings").orderBy("createdOn", "desc").get();
            this.weddings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached weddings. No Firestore read.");
        }
        return this.weddings;
    }

    // Add a new wedding with createdOn timestamp   
    static async addWedding(weddingData: any) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newWeddingRef = await db.collection("weddings").add({
                ...weddingData,
                status: weddingData.status || 'active',
                createdOn: timestamp,
            });

            consoleManager.log("New wedding added with ID:", newWeddingRef.id);

            // Force refresh the cache after adding a new wedding
            await this.getAllWeddings(true);

            return { id: newWeddingRef.id, ...weddingData, createdOn: timestamp };
        } catch (error) {
            consoleManager.error("Error adding wedding:", error);
            throw new Error("Failed to add wedding");
        }
    }

    // Get wedding by ID (fetches from cache first)
    static async getWeddingById(weddingId: string) {
        try {
            // Check if wedding exists in cache
            const cachedWedding = this.weddings.find((w: any) => w.id === weddingId);
            if (cachedWedding) {
                consoleManager.log("Wedding fetched from cache:", weddingId);
                return cachedWedding;
            }

            // Fetch from Firestore if not in cache
            const weddingRef = db.collection("weddings").doc(weddingId);
            const doc = await weddingRef.get();

            if (!doc.exists) {
                consoleManager.warn("Wedding not found:", weddingId);
                return null;
            }

            consoleManager.log("Wedding fetched from Firestore:", weddingId);
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            consoleManager.error("❌ Error fetching wedding by ID:", error);
            throw new Error("Failed to fetch wedding");
        }
    }

    // Update wedding with updatedOn timestamp
    static async updateWedding(weddingId: string, updatedData: any) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const weddingRef = db.collection("weddings").doc(weddingId);
            await weddingRef.update({
                ...updatedData,
                updatedOn: timestamp,
            });

            consoleManager.log("Wedding updated:", weddingId);

            // Force refresh the cache after updating a wedding
            await this.getAllWeddings(true);

            return { id: weddingId, ...updatedData, updatedOn: timestamp };
        } catch (error) {
            consoleManager.error("Error updating wedding:", error);
            throw new Error("Failed to update wedding");
        }
    }

    // Delete wedding
    static async deleteWedding(weddingId: string) {
        try {
            await db.collection("weddings").doc(weddingId).delete();
            consoleManager.log("Wedding deleted:", weddingId);

            // Force refresh the cache after deleting a wedding
            await this.getAllWeddings(true);

            return { success: true, message: "Wedding deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting wedding:", error);
            throw new Error("Failed to delete wedding");
        }
    }

    // Get all active weddings (Uses cache)
    static async getAllActiveWeddings(forceRefresh = true) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing active weddings from Firestore...");
            const snapshot = await db
                .collection("weddings")
                .where("status", "==", "active")
                .orderBy("createdOn", "desc")
                .get();
            const activeWeddings = snapshot.docs.map((doc: any) => {return this.convertToType(doc.id, doc.data())});
            return activeWeddings;
        } else {
            consoleManager.log("Returning cached active weddings. No Firestore read.");
            // Filter the main cache for active weddings
            return this.weddings.filter((wedding: any) => wedding.status === "active");
        }
    }
}

export default WeddingService;
