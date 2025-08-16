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

    // Personal/Business Information
    firstName?: string;
    lastName?: string;
    companyName?: string;
    venueType?: string;
    position?: string;
    websiteLink?: string;

    // Wedding Package Information
    offerWeddingPackages?: 'Yes' | 'No';
    resortCategory?: string;
    weddingPackagePrice?: string;
    maxGuestCapacity?: string;
    numberOfRooms?: string;
    venueAvailability?: string;

    // Services and Amenities
    servicesOffered?: string | string[];
    allInclusivePackages?: string;
    staffAccommodation?: string;
    diningOptions?: string | string[];
    otherAmenities?: string | string[];

    // Business and Booking Information
    bookingLeadTime?: string;
    preferredContactMethod?: string;
    weddingDepositRequired?: string;
    refundPolicy?: string;
    referralSource?: string;
    partnershipInterest?: string;

    // File uploads (URLs)
    uploadResortPhotos?: string[];
    uploadMarriagePhotos?: string[];
    uploadWeddingBrochure?: string[];
    uploadCancelledCheque?: string[];

    // Legal and Agreement Fields
    agreeToTerms?: boolean;
    agreeToPrivacy?: boolean;
    signature?: string;
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

    // Helper method to safely handle array or string fields
    private static normalizeArrayOrString(value: any): string | string[] {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string') {
            // If it contains commas, treat as comma-separated list
            return value.includes(',') ? value.split(',').map(item => item.trim()) : value;
        }
        return value || [];
    }

    // Helper method to ensure arrays are properly stored
    private static ensureArray(value: any): string[] {
        if (Array.isArray(value)) {
            return value;
        }
        if (typeof value === 'string') {
            return value ? [value] : [];
        }
        return [];
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
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            rooms: Array.isArray(data.rooms) ? data.rooms : [],
            images: Array.isArray(data.images) ? data.images : [],
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

            // Personal/Business Information
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            companyName: data.companyName || "",
            venueType: data.venueType || "",
            position: data.position || "",
            websiteLink: data.websiteLink || "",

            // Wedding Package Information
            offerWeddingPackages: data.offerWeddingPackages || "No",
            resortCategory: data.resortCategory || "",
            weddingPackagePrice: data.weddingPackagePrice || "",
            maxGuestCapacity: data.maxGuestCapacity || "",
            numberOfRooms: data.numberOfRooms || "",
            venueAvailability: data.venueAvailability || "",

            // Services and Amenities (handle both string and array formats)
            servicesOffered: this.normalizeArrayOrString(data.servicesOffered),
            allInclusivePackages: data.allInclusivePackages || "",
            staffAccommodation: data.staffAccommodation || "",
            diningOptions: this.normalizeArrayOrString(data.diningOptions),
            otherAmenities: this.normalizeArrayOrString(data.otherAmenities),

            // Business and Booking Information
            bookingLeadTime: data.bookingLeadTime || "",
            preferredContactMethod: data.preferredContactMethod || "",
            weddingDepositRequired: data.weddingDepositRequired || "",
            refundPolicy: data.refundPolicy || "",
            referralSource: data.referralSource || "",
            partnershipInterest: data.partnershipInterest || "",

            // File uploads (URLs)
            uploadResortPhotos: Array.isArray(data.uploadResortPhotos) ? data.uploadResortPhotos : [],
            uploadMarriagePhotos: Array.isArray(data.uploadMarriagePhotos) ? data.uploadMarriagePhotos : [],
            uploadWeddingBrochure: Array.isArray(data.uploadWeddingBrochure) ? data.uploadWeddingBrochure : [],
            uploadCancelledCheque: Array.isArray(data.uploadCancelledCheque) ? data.uploadCancelledCheque : [],

            // Legal and Agreement Fields
            agreeToTerms: data.agreeToTerms || false,
            agreeToPrivacy: data.agreeToPrivacy || false,
            signature: data.signature || "",
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
            
            // Prepare data for storage, ensuring arrays are properly formatted and empty strings are handled
            const processedData = {
                // Basic hotel information
                name: hotelData.name || "",
                category: hotelData.category || "",
                description: hotelData.description || "",
                rating: Number(hotelData.rating || 0),
                status: hotelData.status || "draft",
                
                // Location
                location: {
                    address: hotelData.location?.address || "",
                    city: hotelData.location?.city || "",
                    state: hotelData.location?.state || "",
                    country: hotelData.location?.country || "",
                    zipCode: hotelData.location?.zipCode || "",
                },
                
                // Price Range
                priceRange: {
                    startingPrice: Number(hotelData.priceRange?.startingPrice || 0),
                    currency: hotelData.priceRange?.currency || "INR",
                },
                
                // Contact Info
                contactInfo: {
                    phone: hotelData.contactInfo?.phone || "",
                    email: hotelData.contactInfo?.email || "",
                    website: hotelData.contactInfo?.website || "",
                },
                
                // Policies
                policies: {
                    checkIn: hotelData.policies?.checkIn || "14:00",
                    checkOut: hotelData.policies?.checkOut || "11:00",
                    cancellation: hotelData.policies?.cancellation || "",
                },
                
                // Ensure arrays are stored as arrays
                amenities: Array.isArray(hotelData.amenities) ? hotelData.amenities : [],
                rooms: Array.isArray(hotelData.rooms) ? hotelData.rooms : [],
                images: Array.isArray(hotelData.images) ? hotelData.images : [],
                uploadResortPhotos: Array.isArray(hotelData.uploadResortPhotos) ? hotelData.uploadResortPhotos : [],
                uploadMarriagePhotos: Array.isArray(hotelData.uploadMarriagePhotos) ? hotelData.uploadMarriagePhotos : [],
                uploadWeddingBrochure: Array.isArray(hotelData.uploadWeddingBrochure) ? hotelData.uploadWeddingBrochure : [],
                uploadCancelledCheque: Array.isArray(hotelData.uploadCancelledCheque) ? hotelData.uploadCancelledCheque : [],
                
                // Personal/Business Information
                firstName: hotelData.firstName || "",
                lastName: hotelData.lastName || "",
                companyName: hotelData.companyName || "",
                venueType: hotelData.venueType || "",
                position: hotelData.position || "",
                websiteLink: hotelData.websiteLink || "",

                // Wedding Package Information
                offerWeddingPackages: hotelData.offerWeddingPackages || "No",
                resortCategory: hotelData.resortCategory || "",
                weddingPackagePrice: hotelData.weddingPackagePrice || "",
                maxGuestCapacity: hotelData.maxGuestCapacity || "",
                numberOfRooms: hotelData.numberOfRooms || "",
                venueAvailability: hotelData.venueAvailability || "",

                // Services and Amenities - ensure proper storage
                servicesOffered: this.normalizeArrayOrString(hotelData.servicesOffered),
                allInclusivePackages: hotelData.allInclusivePackages || "",
                staffAccommodation: hotelData.staffAccommodation || "",
                diningOptions: this.normalizeArrayOrString(hotelData.diningOptions),
                otherAmenities: this.normalizeArrayOrString(hotelData.otherAmenities),

                // Business and Booking Information
                bookingLeadTime: hotelData.bookingLeadTime || "",
                preferredContactMethod: hotelData.preferredContactMethod || "",
                weddingDepositRequired: hotelData.weddingDepositRequired || "",
                refundPolicy: hotelData.refundPolicy || "",
                referralSource: hotelData.referralSource || "",
                partnershipInterest: hotelData.partnershipInterest || "",

                // Legal and Agreement Fields
                agreeToTerms: Boolean(hotelData.agreeToTerms),
                agreeToPrivacy: Boolean(hotelData.agreeToPrivacy),
                signature: hotelData.signature || "",
                
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            const newHotelRef = await db.collection(this.collection).add(processedData);

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
            
            // Prepare update data, ensuring arrays are properly formatted and handle empty strings properly
            const processedUpdateData: any = {
                updatedAt: timestamp,
            };

            // Only update fields that are explicitly provided
            if (updateData.name !== undefined) processedUpdateData.name = updateData.name;
            if (updateData.category !== undefined) processedUpdateData.category = updateData.category;
            if (updateData.description !== undefined) processedUpdateData.description = updateData.description;
            if (updateData.rating !== undefined) processedUpdateData.rating = Number(updateData.rating);
            if (updateData.status !== undefined) processedUpdateData.status = updateData.status;

            // Handle nested objects carefully
            if (updateData.location) {
                processedUpdateData.location = updateData.location;
            }
            
            if (updateData.priceRange) {
                processedUpdateData.priceRange = {
                    startingPrice: Number(updateData.priceRange.startingPrice || 0),
                    currency: updateData.priceRange.currency || "INR",
                };
            }
            
            if (updateData.contactInfo) {
                processedUpdateData.contactInfo = updateData.contactInfo;
            }
            
            if (updateData.policies) {
                processedUpdateData.policies = updateData.policies;
            }

            // Handle arrays properly
            if (updateData.amenities !== undefined) {
                processedUpdateData.amenities = Array.isArray(updateData.amenities) ? updateData.amenities : [];
            }
            if (updateData.rooms !== undefined) {
                processedUpdateData.rooms = Array.isArray(updateData.rooms) ? updateData.rooms : [];
            }
            if (updateData.images !== undefined) {
                processedUpdateData.images = Array.isArray(updateData.images) ? updateData.images : [];
            }
            if (updateData.uploadResortPhotos !== undefined) {
                processedUpdateData.uploadResortPhotos = Array.isArray(updateData.uploadResortPhotos) ? updateData.uploadResortPhotos : [];
            }
            if (updateData.uploadMarriagePhotos !== undefined) {
                processedUpdateData.uploadMarriagePhotos = Array.isArray(updateData.uploadMarriagePhotos) ? updateData.uploadMarriagePhotos : [];
            }
            if (updateData.uploadWeddingBrochure !== undefined) {
                processedUpdateData.uploadWeddingBrochure = Array.isArray(updateData.uploadWeddingBrochure) ? updateData.uploadWeddingBrochure : [];
            }
            if (updateData.uploadCancelledCheque !== undefined) {
                processedUpdateData.uploadCancelledCheque = Array.isArray(updateData.uploadCancelledCheque) ? updateData.uploadCancelledCheque : [];
            }

            // Personal/Business Information - handle empty strings
            if (updateData.firstName !== undefined) processedUpdateData.firstName = updateData.firstName || "";
            if (updateData.lastName !== undefined) processedUpdateData.lastName = updateData.lastName || "";
            if (updateData.companyName !== undefined) processedUpdateData.companyName = updateData.companyName || "";
            if (updateData.venueType !== undefined) processedUpdateData.venueType = updateData.venueType || "";
            if (updateData.position !== undefined) processedUpdateData.position = updateData.position || "";
            if (updateData.websiteLink !== undefined) processedUpdateData.websiteLink = updateData.websiteLink || "";

            // Wedding Package Information
            if (updateData.offerWeddingPackages !== undefined) processedUpdateData.offerWeddingPackages = updateData.offerWeddingPackages;
            if (updateData.resortCategory !== undefined) processedUpdateData.resortCategory = updateData.resortCategory || "";
            if (updateData.weddingPackagePrice !== undefined) processedUpdateData.weddingPackagePrice = updateData.weddingPackagePrice || "";
            if (updateData.maxGuestCapacity !== undefined) processedUpdateData.maxGuestCapacity = updateData.maxGuestCapacity || "";
            if (updateData.numberOfRooms !== undefined) processedUpdateData.numberOfRooms = updateData.numberOfRooms || "";
            if (updateData.venueAvailability !== undefined) processedUpdateData.venueAvailability = updateData.venueAvailability || "";

            // Services and Amenities - handle both string and array formats
            if (updateData.servicesOffered !== undefined) {
                processedUpdateData.servicesOffered = this.normalizeArrayOrString(updateData.servicesOffered);
            }
            if (updateData.allInclusivePackages !== undefined) {
                processedUpdateData.allInclusivePackages = updateData.allInclusivePackages || "";
            }
            if (updateData.staffAccommodation !== undefined) {
                processedUpdateData.staffAccommodation = updateData.staffAccommodation || "";
            }
            if (updateData.diningOptions !== undefined) {
                processedUpdateData.diningOptions = this.normalizeArrayOrString(updateData.diningOptions);
            }
            if (updateData.otherAmenities !== undefined) {
                processedUpdateData.otherAmenities = this.normalizeArrayOrString(updateData.otherAmenities);
            }

            // Business and Booking Information
            if (updateData.bookingLeadTime !== undefined) processedUpdateData.bookingLeadTime = updateData.bookingLeadTime || "";
            if (updateData.preferredContactMethod !== undefined) processedUpdateData.preferredContactMethod = updateData.preferredContactMethod || "";
            if (updateData.weddingDepositRequired !== undefined) processedUpdateData.weddingDepositRequired = updateData.weddingDepositRequired || "";
            if (updateData.refundPolicy !== undefined) processedUpdateData.refundPolicy = updateData.refundPolicy || "";
            if (updateData.referralSource !== undefined) processedUpdateData.referralSource = updateData.referralSource || "";
            if (updateData.partnershipInterest !== undefined) processedUpdateData.partnershipInterest = updateData.partnershipInterest || "";

            // Legal and Agreement Fields
            if (updateData.agreeToTerms !== undefined) processedUpdateData.agreeToTerms = Boolean(updateData.agreeToTerms);
            if (updateData.agreeToPrivacy !== undefined) processedUpdateData.agreeToPrivacy = Boolean(updateData.agreeToPrivacy);
            if (updateData.signature !== undefined) processedUpdateData.signature = updateData.signature || "";

            // Preserve createdAt
            if (updateData.createdAt !== undefined) processedUpdateData.createdAt = updateData.createdAt;

            await db.collection(this.collection).doc(id).update(processedUpdateData);

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

    /**
     * Get hotels that offer wedding packages
     */
    static async getWeddingVenues(): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.offerWeddingPackages === 'Yes' && hotel.status === 'active'
        );
    }

    /**
     * Get hotels by venue type
     */
    static async getHotelsByVenueType(venueType: string): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.venueType?.toLowerCase().includes(venueType.toLowerCase()) && 
            hotel.status === 'active'
        );
    }

    /**
     * Get hotels within a price range
     */
    static async getHotelsByPriceRange(minPrice: number, maxPrice: number, currency: Currency = 'INR'): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.priceRange.currency === currency &&
            hotel.priceRange.startingPrice >= minPrice &&
            hotel.priceRange.startingPrice <= maxPrice &&
            hotel.status === 'active'
        );
    }

    /**
     * Get hotels by minimum rating
     */
    static async getHotelsByRating(minRating: number): Promise<Hotel[]> {
        return this.hotels.filter(hotel => 
            hotel.rating >= minRating && hotel.status === 'active'
        );
    }

    /**
     * Get a hotel by the contactInfo.email field.
     * @param email The email address to search for.
     * @returns The hotel object if found, otherwise null.
     */
    static async getHotelByContactEmail(email: string): Promise<Hotel | null> {
        try {
            // Try cache first
            const cached = this.hotels.find(
                (hotel) => hotel.contactInfo?.email?.toLowerCase() === email.toLowerCase()
            );
            if (cached) {
                consoleManager.log(`Hotel found in cache by email:`, email);
                return cached;
            }

            // Query Firestore
            const snapshot = await db
                .collection(this.collection)
                .where("contactInfo.email", "==", email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                consoleManager.log("No hotel found with contact email:", email);
                return null;
            }

            const doc = snapshot.docs[0];
            return this.convertToType(doc.id, doc.data());
        } catch (error) {
            consoleManager.error("Error fetching hotel by contact email:", error);
            throw error;
        }
    }

    /**
     * Get hotels by company name
     */
    static async getHotelsByCompany(companyName: string): Promise<Hotel[]> {
        try {
            // Try cache first
            const cached = this.hotels.filter(hotel => 
                hotel.companyName?.toLowerCase().includes(companyName.toLowerCase())
            );
            if (cached.length > 0) {
                consoleManager.log(`Hotels found in cache by company:`, companyName);
                return cached;
            }

            // Query Firestore
            const snapshot = await db
                .collection(this.collection)
                .where("companyName", ">=", companyName)
                .where("companyName", "<=", companyName + '\uf8ff')
                .get();

            return snapshot.docs.map(doc => this.convertToType(doc.id, doc.data()));
        } catch (error) {
            consoleManager.error("Error fetching hotels by company:", error);
            throw error;
        }
    }

    /**
     * Advanced search with multiple filters
     */
    static async advancedSearch(filters: {
        city?: string;
        category?: string;
        venueType?: string;
        offerWeddingPackages?: boolean;
        minRating?: number;
        maxPrice?: number;
        currency?: Currency;
        status?: HotelStatus;
    }): Promise<Hotel[]> {
        let filteredHotels = [...this.hotels];

        if (filters.city) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.location.city.toLowerCase() === filters.city!.toLowerCase()
            );
        }

        if (filters.category) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.category.toLowerCase().includes(filters.category!.toLowerCase())
            );
        }

        if (filters.venueType) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.venueType?.toLowerCase().includes(filters.venueType!.toLowerCase())
            );
        }

        if (filters.offerWeddingPackages !== undefined) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.offerWeddingPackages === (filters.offerWeddingPackages ? 'Yes' : 'No')
            );
        }

        if (filters.minRating) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.rating >= filters.minRating!
            );
        }

        if (filters.maxPrice && filters.currency) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.priceRange.currency === filters.currency &&
                hotel.priceRange.startingPrice <= filters.maxPrice!
            );
        }

        if (filters.status) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.status === filters.status
            );
        } else {
            // Default to active hotels if no status specified
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.status === 'active'
            );
        }

        return filteredHotels;
    }
}

export default HotelService;