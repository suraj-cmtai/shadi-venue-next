import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export type HotelStatus = 'active' | 'draft' | 'archived';
export type Currency = 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';

export interface Room {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
}

export interface Hotel {
    id: string;
    name: string;
    category: string;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
    };
    priceRange: {
        startingPrice: number;
        currency: Currency;
    };
    rating: number;
    status: HotelStatus;
    description: string;
    amenities: string[];
    rooms: Room[];
    images: string[];
    contactInfo: {
        phone: string;
        email: string;
        website?: string;
    };
    policies: {
        checkIn: string;
        checkOut: string;
        cancellation: string;
    };
    createdAt: string;
    updatedAt: string;
}

class HotelService {
    private static collection = "hotels";
    static hotels: Hotel[] = [];
    static isInitialized = false;

    // Helper method to convert Firestore timestamp to Date
    private static convertTimestamp(timestamp: any): string {
        // Handle Firestore Timestamp objects
        if (timestamp && timestamp._seconds) {
            return new Date(timestamp._seconds * 1000).toISOString();
        }
        
        // Handle Firestore server timestamp
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        
        // Handle Date objects
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }
        
        // Handle string timestamps
        if (typeof timestamp === 'string') {
            return new Date(timestamp).toISOString();
        }
        
        // Handle number timestamps
        if (typeof timestamp === 'number') {
            return new Date(timestamp).toISOString();
        }
        
        // Default to current date
        return new Date().toISOString();
    }

    // Helper method to convert document data to Hotel type
    private static convertToType(id: string, data: any): Hotel {
        return {
            id,
            name: data.name || "",
            category: data.category || "",
            location: {
                address: data.location?.address || "",
                city: data.location?.city || "",
                state: data.location?.state || "",
                country: data.location?.country || "",
                zipCode: data.location?.zipCode || "",
            },
            priceRange: {
                startingPrice: Number(data.priceRange?.startingPrice || 0),
                currency: data.priceRange?.currency || "USD",
            },
            rating: Number(data.rating || 0),
            status: data.status || "draft",
            description: data.description || "",
            amenities: data.amenities || [],
            rooms: data.rooms || [],
            images: data.images || [],
            contactInfo: {
                phone: data.contactInfo?.phone || "",
                email: data.contactInfo?.email || "",
                website: data.contactInfo?.website,
            },
            policies: {
                checkIn: data.policies?.checkIn || "14:00",
                checkOut: data.policies?.checkOut || "11:00",
                cancellation: data.policies?.cancellation || "",
            },
            createdAt: this.convertTimestamp(data.createdAt),
            updatedAt: this.convertTimestamp(data.updatedAt),
        };
    }

    // Initialize Firestore real-time listener
    static initHotels() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for hotels...");
        const hotelsCollection = db.collection(this.collection);

        hotelsCollection.onSnapshot((snapshot: any) => {
            this.hotels = snapshot.docs.map((doc: any) => {
                return this.convertToType(doc.id, doc.data());
            });
            consoleManager.log(
                "Firestore Read: Hotels updated, count:",
                this.hotels.length
            );
        });

        this.isInitialized = true;
    }

    static async createHotel(hotelData: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Hotel> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newHotelRef = await db.collection(this.collection).add({
                ...hotelData,
                createdAt: timestamp,
                updatedAt: timestamp,
            });

            // Wait a moment for the server timestamp to be resolved
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Fetch the newly created hotel
            const newHotelDoc = await db.collection(this.collection).doc(newHotelRef.id).get();
            const newHotel = this.convertToType(newHotelDoc.id, newHotelDoc.data());
            
            // Update the cache
            await this.getAllHotels(true);
            
            consoleManager.log('Hotel created:', newHotelRef.id);
            return newHotel;
        } catch (error) {
            consoleManager.error('Error creating hotel:', error);
            throw error;
        }
    }

    static async getHotelById(id: string): Promise<Hotel | null> {
        try {
            const hotel = this.hotels.find((hotel) => hotel.id === id);
            if (hotel) {
                consoleManager.log(`Hotel found in cache:`, id);
                return hotel;
            }

            const hotelDoc = await db.collection(this.collection).doc(id).get();
            
            if (!hotelDoc.exists) {
                consoleManager.log('Hotel not found:', id);
                return null;
            }

            return this.convertToType(hotelDoc.id, hotelDoc.data());
        } catch (error) {
            consoleManager.error('Error fetching hotel:', error);
            throw error;
        }
    }

    static async getAllHotels(forceRefresh = true): Promise<Hotel[]> {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing hotels from Firestore...");
            const snapshot = await db.collection(this.collection)
                .orderBy("createdAt", "desc")
                .get();
            this.hotels = snapshot.docs.map(doc => this.convertToType(doc.id, doc.data()));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached hotels. No Firestore read.");
        }
        return this.hotels;
    }

    static async getAllActiveHotels(forceRefresh = true) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing active hotels from Firestore...");
            const snapshot = await db
                .collection(this.collection)
                .where("status", "==", "active")
                .orderBy("createdAt", "desc")
                .get();
            this.hotels = snapshot.docs.map((doc: any) => {
                return this.convertToType(doc.id, doc.data());
            });
        } else {
            consoleManager.log("Returning cached active hotels. No Firestore read.");
        }
        return this.hotels;
    }

    static async updateHotel(id: string, updateData: Partial<Hotel>): Promise<Hotel> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            await db.collection(this.collection).doc(id).update({
                ...updateData,
                updatedAt: timestamp,
            });

            // Wait a moment for the server timestamp to be resolved
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.getAllHotels(true);
            
            const updatedHotel = await this.getHotelById(id);
            if (!updatedHotel) throw new Error('Hotel not found after update');

            consoleManager.log('Hotel updated:', id);
            return updatedHotel;
        } catch (error) {
            consoleManager.error('Error updating hotel:', error);
            throw error;
        }
    }

    static async deleteHotel(id: string): Promise<{ id: string }> {
        try {
            const hotelRef = db.collection(this.collection).doc(id);
            await hotelRef.delete();

            consoleManager.log("Hotel deleted successfully:", id);
            await this.getAllHotels(true);
            return { id };
        } catch (error: any) {
            consoleManager.error("Error deleting hotel:", error);
            throw error;
        }
    }

    static async searchHotels(query: string): Promise<Hotel[]> {
        const searchTerm = query.toLowerCase();
        return this.hotels.filter(hotel => 
            hotel.name.toLowerCase().includes(searchTerm) ||
            hotel.description.toLowerCase().includes(searchTerm) ||
            hotel.location.city.toLowerCase().includes(searchTerm) ||
            hotel.category.toLowerCase().includes(searchTerm)
        );
    }

    static async getHotelsByCity(city: string): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.location.city === city && hotel.status === 'active'
        );
    }

    static async getHotelsByCategory(category: string): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.category === category && hotel.status === 'active'
        );
    }
}


export default HotelService;
