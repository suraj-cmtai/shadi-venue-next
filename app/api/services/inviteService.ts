import { db } from "../config/firebase";
import admin from "firebase-admin";
import consoleManager from "../utils/consoleManager";
import { WeddingState } from "@/lib/redux/features/inviteSlice";

const getWeddingDocRef = (id: string) => db.collection("wedding").doc(id);

class WeddingService {
    static cache: Record<string, WeddingState | null> = {};

    // Get wedding data by ID
    static async getWeddingDataById(id: string, forceRefresh = false): Promise<WeddingState | null> {
        if (this.cache[id] && !forceRefresh) {
            consoleManager.log(`Returning cached wedding data for id: ${id}`);
            return this.cache[id];
        }

        const docRef = getWeddingDocRef(id);
        const docSnap = await docRef.get();
        if (!docSnap.exists) return null;

        const data = docSnap.data() as WeddingState;
        this.cache[id] = data;
        consoleManager.log(`Wedding data fetched from Firestore for id: ${id}`);
        return data;
    }

    // Create or overwrite wedding data by ID
    static async createWeddingDataById(id: string, data: WeddingState) {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        await getWeddingDocRef(id).set({
            ...data,
            weddingDay: {
                ...data.weddingDay,
                updatedOn: timestamp,
                createdOn: timestamp,
            },
        });

        consoleManager.log(`Wedding data created for id: ${id}`);
        return this.getWeddingDataById(id, true);
    }

    // Update partial wedding data by ID
    static async updateWeddingDataById(id: string, update: Partial<WeddingState>) {
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        await getWeddingDocRef(id).set(
            {
                ...update,
                weddingDay: {
                    ...(update.weddingDay || {}),
                    updatedOn: timestamp,
                },
            },
            { merge: true }
        );

        consoleManager.log(`Wedding data updated for id: ${id}`);
        return this.getWeddingDataById(id, true);
    }

    // Delete wedding data by ID
    static async deleteWeddingDataById(id: string) {
        await getWeddingDocRef(id).delete();
        delete this.cache[id];
        consoleManager.log(`Wedding data deleted for id: ${id}`);
        return { id };
    }

    // Defaults to static 'main' document
    static async getWeddingData(forceRefresh = false) {
        return this.getWeddingDataById("main", forceRefresh);
    }

    static async createWeddingData(data: WeddingState) {
        return this.createWeddingDataById("main", data);
    }

    static async updateWeddingData(update: Partial<WeddingState>) {
        return this.updateWeddingDataById("main", update);
    }

    static async deleteWeddingData() {
        return this.deleteWeddingDataById("main");
    }
}

export default WeddingService;
