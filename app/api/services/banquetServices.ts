import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

export type BanquetStatus = 'active' | 'draft' | 'archived';
export type Currency = 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR';

export interface Room {
    type: string;
    capacity: number;
    pricePerNight: number;
    available: number;
}

export interface Banquet {
    // Basic Details
    id: string;
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
        currency: string;
    };
    rating: number;
    status: "draft" | "active" | "archived";
    description: string;
    amenities: string[];

    // Venue Details
    venueName: string;
    capacity: number;
    area: string;
    venueType: "Indoor" | "Outdoor" | "Both";
    facilities: string[]; // Array of selected facilities

    // Pricing & Packages
    pricingRange: string;
    packages?: string;
    rentalOptions: string;

    // Photos & Media
    images: string[];
    contactInfo: {
        phone: string;
        email: string;
        website: string;
    };
    policies: {
        checkIn: string;
        checkOut: string;
        cancellation: string;
    };
    googleLocation: string;
    createdAt: string;
    updatedAt: string;
    isPremium: boolean;
    isFeatured: boolean;
    firstName: string;
    lastName: string;
    companyName: string;
    position: string;
    websiteLink: string;

    // Wedding Package Information
    offerWeddingPackages: string;
    resortCategory: string;
    maxGuestCapacity: string;
    totalRooms: string;
    venueAvailability: string;

    // Arrays for multi-select fields
    servicesOffered: string[];
    diningOptions: string[];
    otherAmenities: string[];
    preferredContactMethod: string[];

    // Strings for boolean-like fields
    allInclusivePackages: string[];
    staffAccommodation: string;

    // Business and Booking Information
    bookingLeadTime: string;
    weddingDepositRequired: string;
    refundPolicy: string;
    referralSource: string;
    partnershipInterest: string;

    // File uploads
    uploadResortPhotos: string[];
    uploadMarriagePhotos: string[];
    uploadWeddingBrochure: string[];
    uploadCancelledCheque: string[];

    // Agreement fields
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
    signature: string;
}

class BanquetService {
    private static collection = "banquets";
    static banquets: Banquet[] = [];
    static isInitialized = false;

    private static convertTimestamp(timestamp: any): string {
        if (timestamp && timestamp._seconds) {
            return new Date(timestamp._seconds * 1000).toISOString();
        }
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }
        if (typeof timestamp === 'string') {
            return new Date(timestamp).toISOString();
        }
        if (typeof timestamp === 'number') {
            return new Date(timestamp).toISOString();
        }
        return new Date().toISOString();
    }

    private static normalizeArrayOrString(value: any): string[] {
        if (Array.isArray(value)) {
            return value.filter(item => item && typeof item === 'string');
        }
        if (typeof value === 'string' && value.trim()) {
            return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
        }
        return [];
    }

    private static convertToType(id: string, data: any): Banquet {
        return {
            id,
            category: data.category || "",
            location: {
                address: data.location?.address || "",
                city: data.location?.city || "",
                state: data.location?.state || "",
                country: data.location?.country || "",
                zipCode: data.location?.zipCode || "",
            },
            priceRange: {
                startingPrice: typeof data.priceRange?.startingPrice === "number" ? data.priceRange.startingPrice : Number(data.priceRange?.startingPrice || 0),
                currency: data.priceRange?.currency || "INR",
            },
            rating: typeof data.rating === "number" ? data.rating : Number(data.rating || 0),
            status: data.status || "draft",
            description: data.description || "",
            amenities: this.normalizeArrayOrString(data.amenities),
            venueName: data.venueName || "",
            capacity: typeof data.capacity === "number" ? data.capacity : Number(data.capacity || 0),
            area: data.area || "",
            venueType: data.venueType || "Indoor",
            facilities: this.normalizeArrayOrString(data.facilities),
            pricingRange: data.pricingRange || "",
            packages: data.packages || "",
            rentalOptions: data.rentalOptions || "",
            images: this.normalizeArrayOrString(data.images),
            contactInfo: {
                phone: data.contactInfo?.phone || "",
                email: data.contactInfo?.email || "",
                website: data.contactInfo?.website || "",
            },
            policies: {
                checkIn: data.policies?.checkIn || "",
                checkOut: data.policies?.checkOut || "",
                cancellation: data.policies?.cancellation || "",
            },
            googleLocation: data.googleLocation || "",
            createdAt: this.convertTimestamp(data.createdAt),
            updatedAt: this.convertTimestamp(data.updatedAt),
            isPremium: !!data.isPremium,
            isFeatured: !!data.isFeatured,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            companyName: data.companyName || "",
            position: data.position || "",
            websiteLink: data.websiteLink || "",
            offerWeddingPackages: data.offerWeddingPackages || "",
            resortCategory: data.resortCategory || "",
            maxGuestCapacity: data.maxGuestCapacity || "",
            totalRooms: data.totalRooms || "",
            venueAvailability: data.venueAvailability || "",
            servicesOffered: this.normalizeArrayOrString(data.servicesOffered),
            diningOptions: this.normalizeArrayOrString(data.diningOptions),
            otherAmenities: this.normalizeArrayOrString(data.otherAmenities),
            preferredContactMethod: this.normalizeArrayOrString(data.preferredContactMethod),
            allInclusivePackages: this.normalizeArrayOrString(data.allInclusivePackages),
            staffAccommodation: data.staffAccommodation || "",
            bookingLeadTime: data.bookingLeadTime || "",
            weddingDepositRequired: data.weddingDepositRequired || "",
            refundPolicy: data.refundPolicy || "",
            referralSource: data.referralSource || "",
            partnershipInterest: data.partnershipInterest || "",
            uploadResortPhotos: this.normalizeArrayOrString(data.uploadResortPhotos),
            uploadMarriagePhotos: this.normalizeArrayOrString(data.uploadMarriagePhotos),
            uploadWeddingBrochure: this.normalizeArrayOrString(data.uploadWeddingBrochure),
            uploadCancelledCheque: this.normalizeArrayOrString(data.uploadCancelledCheque),
            agreeToTerms: !!data.agreeToTerms,
            agreeToPrivacy: !!data.agreeToPrivacy,
            signature: data.signature || "",
        };
    }

    static initBanquets() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for banquets...");
        const banquetsCollection = db.collection(this.collection);

        banquetsCollection.onSnapshot((snapshot: any) => {
            this.banquets = snapshot.docs.map((doc: any) => {
                return this.convertToType(doc.id, doc.data());
            });
            consoleManager.log(
                "Firestore Read: Banquets updated, count:",
                this.banquets.length
            );
        });

        this.isInitialized = true;
    }

    static async createBanquet(banquetData: Omit<Banquet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banquet> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const processedData: any = {
                companyName: banquetData.companyName || "",
                category: banquetData.category || "",
                location: {
                    address: banquetData.location?.address || "",
                    city: banquetData.location?.city || "",
                    state: banquetData.location?.state || "",
                    country: banquetData.location?.country || "",
                    zipCode: banquetData.location?.zipCode || "",
                },
                priceRange: {
                    startingPrice: typeof banquetData.priceRange?.startingPrice === "number" ? banquetData.priceRange.startingPrice : Number(banquetData.priceRange?.startingPrice || 0),
                    currency: banquetData.priceRange?.currency || "INR",
                },
                rating: typeof banquetData.rating === "number" ? banquetData.rating : Number(banquetData.rating || 0),
                status: banquetData.status || "draft",
                description: banquetData.description || "",
                amenities: Array.isArray(banquetData.amenities) ? banquetData.amenities : [],
                venueName: banquetData.venueName || "",
                capacity: typeof banquetData.capacity === "number" ? banquetData.capacity : Number(banquetData.capacity || 0),
                area: banquetData.area || "",
                venueType: banquetData.venueType || "Indoor",
                facilities: Array.isArray(banquetData.facilities) ? banquetData.facilities : [],
                pricingRange: banquetData.pricingRange || "",
                packages: banquetData.packages || "",
                rentalOptions: banquetData.rentalOptions || "",
                images: Array.isArray(banquetData.images) ? banquetData.images : [],
                contactInfo: {
                    phone: banquetData.contactInfo?.phone || "",
                    email: banquetData.contactInfo?.email || "",
                    website: banquetData.contactInfo?.website || "",
                },
                policies: {
                    checkIn: banquetData.policies?.checkIn || "",
                    checkOut: banquetData.policies?.checkOut || "",
                    cancellation: banquetData.policies?.cancellation || "",
                },
                googleLocation: banquetData.googleLocation || "",
                isPremium: !!banquetData.isPremium,
                isFeatured: !!banquetData.isFeatured,
                firstName: banquetData.firstName || "",
                lastName: banquetData.lastName || "",
                position: banquetData.position || "",
                websiteLink: banquetData.websiteLink || "",
                offerWeddingPackages: banquetData.offerWeddingPackages || "",
                resortCategory: banquetData.resortCategory || "",
                maxGuestCapacity: banquetData.maxGuestCapacity || "",
                totalRooms: banquetData.totalRooms || "",
                venueAvailability: banquetData.venueAvailability || "",
                servicesOffered: Array.isArray(banquetData.servicesOffered) ? banquetData.servicesOffered : [],
                diningOptions: Array.isArray(banquetData.diningOptions) ? banquetData.diningOptions : [],
                otherAmenities: Array.isArray(banquetData.otherAmenities) ? banquetData.otherAmenities : [],
                preferredContactMethod: Array.isArray(banquetData.preferredContactMethod) ? banquetData.preferredContactMethod : [],
                allInclusivePackages: Array.isArray(banquetData.allInclusivePackages) ? banquetData.allInclusivePackages : [],
                staffAccommodation: banquetData.staffAccommodation || "",
                bookingLeadTime: banquetData.bookingLeadTime || "",
                weddingDepositRequired: banquetData.weddingDepositRequired || "",
                refundPolicy: banquetData.refundPolicy || "",
                referralSource: banquetData.referralSource || "",
                partnershipInterest: banquetData.partnershipInterest || "",
                uploadResortPhotos: Array.isArray(banquetData.uploadResortPhotos) ? banquetData.uploadResortPhotos : [],
                uploadMarriagePhotos: Array.isArray(banquetData.uploadMarriagePhotos) ? banquetData.uploadMarriagePhotos : [],
                uploadWeddingBrochure: Array.isArray(banquetData.uploadWeddingBrochure) ? banquetData.uploadWeddingBrochure : [],
                uploadCancelledCheque: Array.isArray(banquetData.uploadCancelledCheque) ? banquetData.uploadCancelledCheque : [],
                agreeToTerms: !!banquetData.agreeToTerms,
                agreeToPrivacy: !!banquetData.agreeToPrivacy,
                signature: banquetData.signature || "",
                createdAt: timestamp,
                updatedAt: timestamp,
            };

            const newBanquetRef = await db.collection(this.collection).add(processedData);

            await new Promise(resolve => setTimeout(resolve, 100));

            const newBanquetDoc = await db.collection(this.collection).doc(newBanquetRef.id).get();
            const newBanquet = this.convertToType(newBanquetDoc.id, newBanquetDoc.data());

            await this.getAllBanquets(true);

            consoleManager.log('Banquet created:', newBanquetRef.id);
            return newBanquet;
        } catch (error) {
            consoleManager.error('Error creating banquet:', error);
            throw error;
        }
    }

    static async getBanquetById(id: string): Promise<Banquet | null> {
        try {
            const banquet = this.banquets.find((banquet) => banquet.id === id);
            if (banquet) {
                consoleManager.log(`Banquet found in cache:`, id);
                return banquet;
            }

            const banquetDoc = await db.collection(this.collection).doc(id).get();

            if (!banquetDoc.exists) {
                consoleManager.log('Banquet not found:', id);
                return null;
            }

            return this.convertToType(banquetDoc.id, banquetDoc.data());
        } catch (error) {
            consoleManager.error('Error fetching banquet:', error);
            throw error;
        }
    }

    static async getAllBanquets(forceRefresh = true): Promise<Banquet[]> {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing banquets from Firestore...");
            const snapshot = await db.collection(this.collection)
                .orderBy("createdAt", "desc")
                .get();
            this.banquets = snapshot.docs.map(doc => this.convertToType(doc.id, doc.data()));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached banquets. No Firestore read.");
        }
        return this.banquets;
    }

    static async getAllActiveBanquets(forceRefresh = true) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing active banquets from Firestore...");
            const snapshot = await db
                .collection(this.collection)
                .where("status", "==", "active")
                .orderBy("createdAt", "desc")
                .get();
            this.banquets = snapshot.docs.map((doc: any) => {
                return this.convertToType(doc.id, doc.data());
            });
        } else {
            consoleManager.log("Returning cached active banquets. No Firestore read.");
        }
        return this.banquets;
    }

    static async getPremiumBanquets(forceRefresh = true, status: BanquetStatus = 'active') {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing premium banquets from Firestore...");
            const snapshot = await db
                .collection(this.collection)
                .where("isPremium", "==", true)
                .where("isFeatured", "==", true)
                .where("status", "==", status)
                .orderBy("createdAt", "desc")
                .get();
            this.banquets = snapshot.docs.map((doc: any) => this.convertToType(doc.id, doc.data()));
        } else {
            consoleManager.log("Returning cached premium banquets. No Firestore read.");
        }
        return this.banquets;
    }

    static async updateBanquet(id: string, updateData: Partial<Banquet>): Promise<Banquet> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const processedUpdateData: any = {
                updatedAt: timestamp,
            };

            if (updateData.companyName !== undefined) processedUpdateData.companyName = updateData.companyName || "";
            if (updateData.category !== undefined) processedUpdateData.category = updateData.category || "";
            if (updateData.location !== undefined) {
                processedUpdateData.location = {
                    address: updateData.location?.address || "",
                    city: updateData.location?.city || "",
                    state: updateData.location?.state || "",
                    country: updateData.location?.country || "",
                    zipCode: updateData.location?.zipCode || "",
                };
            }
            if (updateData.priceRange !== undefined) {
                processedUpdateData.priceRange = {
                    startingPrice: typeof updateData.priceRange?.startingPrice === "number" ? updateData.priceRange.startingPrice : Number(updateData.priceRange?.startingPrice || 0),
                    currency: updateData.priceRange?.currency || "INR",
                };
            }
            if (updateData.rating !== undefined) processedUpdateData.rating = typeof updateData.rating === "number" ? updateData.rating : Number(updateData.rating || 0);
            if (updateData.status !== undefined) processedUpdateData.status = updateData.status || "draft";
            if (updateData.description !== undefined) processedUpdateData.description = updateData.description || "";
            if (updateData.amenities !== undefined) processedUpdateData.amenities = Array.isArray(updateData.amenities) ? updateData.amenities : [];
            if (updateData.venueName !== undefined) processedUpdateData.venueName = updateData.venueName || "";
            if (updateData.capacity !== undefined) processedUpdateData.capacity = typeof updateData.capacity === "number" ? updateData.capacity : Number(updateData.capacity || 0);
            if (updateData.area !== undefined) processedUpdateData.area = updateData.area || "";
            if (updateData.venueType !== undefined) processedUpdateData.venueType = updateData.venueType || "Indoor";
            if (updateData.facilities !== undefined) processedUpdateData.facilities = Array.isArray(updateData.facilities) ? updateData.facilities : [];
            if (updateData.pricingRange !== undefined) processedUpdateData.pricingRange = updateData.pricingRange || "";
            if (updateData.packages !== undefined) processedUpdateData.packages = updateData.packages || "";
            if (updateData.rentalOptions !== undefined) processedUpdateData.rentalOptions = updateData.rentalOptions || "";
            if (updateData.images !== undefined) processedUpdateData.images = Array.isArray(updateData.images) ? updateData.images : [];
            if (updateData.contactInfo !== undefined) {
                processedUpdateData.contactInfo = {
                    phone: updateData.contactInfo?.phone || "",
                    email: updateData.contactInfo?.email || "",
                    website: updateData.contactInfo?.website || "",
                };
            }
            if (updateData.policies !== undefined) {
                processedUpdateData.policies = {
                    checkIn: updateData.policies?.checkIn || "",
                    checkOut: updateData.policies?.checkOut || "",
                    cancellation: updateData.policies?.cancellation || "",
                };
            }
            if (updateData.googleLocation !== undefined) processedUpdateData.googleLocation = updateData.googleLocation || "";
            if (updateData.isPremium !== undefined) processedUpdateData.isPremium = !!updateData.isPremium;
            if (updateData.isFeatured !== undefined) processedUpdateData.isFeatured = !!updateData.isFeatured;
            if (updateData.firstName !== undefined) processedUpdateData.firstName = updateData.firstName || "";
            if (updateData.lastName !== undefined) processedUpdateData.lastName = updateData.lastName || "";
            if (updateData.position !== undefined) processedUpdateData.position = updateData.position || "";
            if (updateData.websiteLink !== undefined) processedUpdateData.websiteLink = updateData.websiteLink || "";
            if (updateData.offerWeddingPackages !== undefined) processedUpdateData.offerWeddingPackages = updateData.offerWeddingPackages || "";
            if (updateData.resortCategory !== undefined) processedUpdateData.resortCategory = updateData.resortCategory || "";
            if (updateData.maxGuestCapacity !== undefined) processedUpdateData.maxGuestCapacity = updateData.maxGuestCapacity || "";
            if (updateData.totalRooms !== undefined) processedUpdateData.totalRooms = updateData.totalRooms || "";
            if (updateData.venueAvailability !== undefined) processedUpdateData.venueAvailability = updateData.venueAvailability || "";
            if (updateData.servicesOffered !== undefined) processedUpdateData.servicesOffered = Array.isArray(updateData.servicesOffered) ? updateData.servicesOffered : [];
            if (updateData.diningOptions !== undefined) processedUpdateData.diningOptions = Array.isArray(updateData.diningOptions) ? updateData.diningOptions : [];
            if (updateData.otherAmenities !== undefined) processedUpdateData.otherAmenities = Array.isArray(updateData.otherAmenities) ? updateData.otherAmenities : [];
            if (updateData.preferredContactMethod !== undefined) processedUpdateData.preferredContactMethod = Array.isArray(updateData.preferredContactMethod) ? updateData.preferredContactMethod : [];
            if (updateData.allInclusivePackages !== undefined) processedUpdateData.allInclusivePackages = Array.isArray(updateData.allInclusivePackages) ? updateData.allInclusivePackages : [];
            if (updateData.staffAccommodation !== undefined) processedUpdateData.staffAccommodation = updateData.staffAccommodation || "";
            if (updateData.bookingLeadTime !== undefined) processedUpdateData.bookingLeadTime = updateData.bookingLeadTime || "";
            if (updateData.weddingDepositRequired !== undefined) processedUpdateData.weddingDepositRequired = updateData.weddingDepositRequired || "";
            if (updateData.refundPolicy !== undefined) processedUpdateData.refundPolicy = updateData.refundPolicy || "";
            if (updateData.referralSource !== undefined) processedUpdateData.referralSource = updateData.referralSource || "";
            if (updateData.partnershipInterest !== undefined) processedUpdateData.partnershipInterest = updateData.partnershipInterest || "";
            if (updateData.uploadResortPhotos !== undefined) processedUpdateData.uploadResortPhotos = Array.isArray(updateData.uploadResortPhotos) ? updateData.uploadResortPhotos : [];
            if (updateData.uploadMarriagePhotos !== undefined) processedUpdateData.uploadMarriagePhotos = Array.isArray(updateData.uploadMarriagePhotos) ? updateData.uploadMarriagePhotos : [];
            if (updateData.uploadWeddingBrochure !== undefined) processedUpdateData.uploadWeddingBrochure = Array.isArray(updateData.uploadWeddingBrochure) ? updateData.uploadWeddingBrochure : [];
            if (updateData.uploadCancelledCheque !== undefined) processedUpdateData.uploadCancelledCheque = Array.isArray(updateData.uploadCancelledCheque) ? updateData.uploadCancelledCheque : [];
            if (updateData.agreeToTerms !== undefined) processedUpdateData.agreeToTerms = !!updateData.agreeToTerms;
            if (updateData.agreeToPrivacy !== undefined) processedUpdateData.agreeToPrivacy = !!updateData.agreeToPrivacy;
            if (updateData.signature !== undefined) processedUpdateData.signature = updateData.signature || "";

            await db.collection(this.collection).doc(id).update(processedUpdateData);

            await new Promise(resolve => setTimeout(resolve, 100));

            await this.getAllBanquets(true);

            const updatedBanquet = await this.getBanquetById(id);
            if (!updatedBanquet) throw new Error('Banquet not found after update');

            consoleManager.log('Banquet updated:', id);
            return updatedBanquet;
        } catch (error) {
            consoleManager.error('Error updating banquet:', error);
            throw error;
        }
    }

    static async deleteBanquet(id: string): Promise<{ id: string }> {
        try {
            const banquetRef = db.collection(this.collection).doc(id);
            await banquetRef.delete();

            consoleManager.log("Banquet deleted successfully:", id);
            await this.getAllBanquets(true);
            return { id };
        } catch (error: any) {
            consoleManager.error("Error deleting banquet:", error);
            throw error;
        }
    }

    static async searchBanquets(query: string): Promise<Banquet[]> {
        const searchTerm = query.toLowerCase();
        return this.banquets.filter(banquet =>
            banquet.venueName.toLowerCase().includes(searchTerm) ||
            banquet.companyName.toLowerCase().includes(searchTerm) ||
            banquet.location.city.toLowerCase().includes(searchTerm) ||
            banquet.area.toLowerCase().includes(searchTerm) ||
            banquet.location.address.toLowerCase().includes(searchTerm)
        );
    }

    static async getBanquetsByCity(city: string): Promise<Banquet[]> {
        return this.banquets.filter(banquet =>
            banquet.location.city === city
        );
    }

    static async getBanquetsByCategory(category: string): Promise<Banquet[]> {
        return this.banquets.filter(banquet =>
            banquet.category === category
        );
    }

    static async getWeddingVenues(): Promise<Banquet[]> {
        return this.banquets.filter(banquet =>
            banquet.venueType === 'Indoor' || banquet.venueType === 'Both'
        );
    }

    static async getBanquetsByVenueType(venueType: string): Promise<Banquet[]> {
        return this.banquets.filter(banquet =>
            banquet.venueType.toLowerCase().includes(venueType.toLowerCase())
        );
    }

    static async getBanquetsByPriceRange(minPrice: number, maxPrice: number, currency: Currency = 'INR'): Promise<Banquet[]> {
        return this.banquets.filter(banquet => {
            const price = banquet.priceRange.startingPrice;
            const curr = banquet.priceRange.currency || "INR";
            return curr === currency && price >= minPrice && price <= maxPrice;
        });
    }

    static async getBanquetsByRating(minRating: number): Promise<Banquet[]> {
        return this.banquets.filter(banquet =>
            banquet.rating >= minRating
        );
    }

    static async getBanquetByContactEmail(email: string): Promise<Banquet | null> {
        try {
            const cached = this.banquets.find(
                (banquet) => banquet.contactInfo.email.toLowerCase() === email.toLowerCase()
            );
            if (cached) {
                consoleManager.log(`Banquet found in cache by email:`, email);
                return cached;
            }

            const snapshot = await db
                .collection(this.collection)
                .where("contactInfo.email", "==", email)
                .limit(1)
                .get();

            if (snapshot.empty) {
                consoleManager.log("No banquet found with contact email:", email);
                return null;
            }

            const doc = snapshot.docs[0];
            return this.convertToType(doc.id, doc.data());
        } catch (error) {
            consoleManager.error("Error fetching banquet by contact email:", error);
            throw error;
        }
    }

    static async getBanquetsByCompany(companyName: string): Promise<Banquet[]> {
        try {
            const cached = this.banquets.filter(banquet =>
                banquet.companyName.toLowerCase().includes(companyName.toLowerCase())
            );
            if (cached.length > 0) {
                consoleManager.log(`Banquets found in cache by company:`, companyName);
                return cached;
            }

            const snapshot = await db
                .collection(this.collection)
                .where("companyName", ">=", companyName)
                .where("companyName", "<=", companyName + '\uf8ff')
                .get();

            return snapshot.docs.map(doc => this.convertToType(doc.id, doc.data()));
        } catch (error) {
            consoleManager.error("Error fetching banquets by company:", error);
            throw error;
        }
    }

    static async advancedSearch(filters: {
        city?: string;
        category?: string;
        venueType?: string;
        minCapacity?: number;
        maxCapacity?: number;
    }): Promise<Banquet[]> {
        let filteredBanquets = [...this.banquets];

        if (filters.city) {
            filteredBanquets = filteredBanquets.filter(banquet =>
                banquet.location.city.toLowerCase() === filters.city!.toLowerCase()
            );
        }

        if (filters.category) {
            filteredBanquets = filteredBanquets.filter(banquet =>
                banquet.category.toLowerCase().includes(filters.category!.toLowerCase())
            );
        }

        if (filters.venueType) {
            filteredBanquets = filteredBanquets.filter(banquet =>
                banquet.venueType.toLowerCase().includes(filters.venueType!.toLowerCase())
            );
        }

        if (filters.minCapacity) {
            filteredBanquets = filteredBanquets.filter(banquet =>
                banquet.capacity >= filters.minCapacity!
            );
        }

        if (filters.maxCapacity) {
            filteredBanquets = filteredBanquets.filter(banquet =>
                banquet.capacity <= filters.maxCapacity!
            );
        }

        return filteredBanquets;
    }
}

export default BanquetService;