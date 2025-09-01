import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import HotelService, { Currency, HotelStatus } from "../../services/hotelServices";
import consoleManager from "../../utils/consoleManager";

// Helper function to handle file uploads
async function uploadFiles(files: FormDataEntryValue[], width: number, height: number): Promise<string[]> {
    const uploadedUrls: string[] = [];
    if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
            if (file instanceof File) {
                const uploadedUrl = await UploadImage(file, width, height);
                if (typeof uploadedUrl === 'string') {
                    consoleManager.log("Image uploaded successfully:", uploadedUrl);
                    return uploadedUrl;
                }
            }
            return null;
        });
        const urls = await Promise.all(uploadPromises);
        uploadedUrls.push(...urls.filter(Boolean) as string[]);
    }
    return uploadedUrls;
}

// Helper function to safely parse string values as arrays or return as strings
function parseStringOrArray(value: string | undefined, fallback: any = []): any {
    if (!value) return fallback;
    try {
        // Try to parse as JSON array
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
    } catch {
        // If parsing fails, treat as comma-separated string
        return value.includes(',') ? value.split(',').map(item => item.trim()) : value;
    }
}

// Helper function to safely convert string to number
function safeParseNumber(value: string | undefined, fallback: number = 0): number {
    if (!value) return fallback;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

// Helper function to safely convert string to boolean
function safeParseBoolean(value: string | undefined): boolean {
    return value === "true";
}

// Helper function to parse string or array for preferredContactMethod
function parsePreferredContactMethod(value: string | undefined): string[] | undefined {
    if (!value) return undefined;
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
    } catch {
        // If not JSON, treat as comma-separated string
        if (value.includes(",")) {
            return value.split(",").map((v) => v.trim()).filter(Boolean);
        }
        if (value.trim().length > 0) {
            return [value.trim()];
        }
    }
    return undefined;
}

// Get all hotels (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const category = searchParams.get('category');
        const weddingPackages = searchParams.get('weddingPackages');
        const minRating = searchParams.get('minRating');
        const maxPrice = searchParams.get('maxPrice');
        const currency = searchParams.get('currency');
        const isPremium = searchParams.get('isPremium');

        let hotels;

        // If any filters are provided, use advanced search
        if (status || city || category || weddingPackages || minRating || maxPrice || isPremium) {
            const filters: any = {};
            
            if (status) filters.status = status as HotelStatus;
            if (city) filters.city = city;
            if (category) filters.category = category;
            if (weddingPackages) filters.offerWeddingPackages = weddingPackages === 'true';
            if (minRating) filters.minRating = parseFloat(minRating);
            if (maxPrice) {
                filters.maxPrice = parseFloat(maxPrice);
                filters.currency = (currency as Currency) || 'INR';
            }
            if (isPremium) filters.isPremium = isPremium === 'true';    
            hotels = await HotelService.advancedSearch(filters);
        } else {
            if (isPremium) {
                hotels = await HotelService.getPremiumHotels();
            } else {
                hotels = await HotelService.getAllHotels();
            }
        }
        
        consoleManager.log("Fetched hotels with filters:", { status, city, category, count: hotels.length });

        return NextResponse.json({
            statusCode: 200,
            message: "Hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/hotel:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Create a new hotel (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Extract basic hotel information
        const name = formData.get("name")?.toString();
        const category = formData.get("category")?.toString();
        const description = formData.get("description")?.toString();
        const rating = formData.get("rating")?.toString();
        const status = formData.get("status")?.toString();
        // Amenities: accept JSON array, comma-separated string, or repeated fields
        let amenities: string[] = [];
        if (formData.has("amenities")) {
            const all = formData.getAll("amenities").map(v => v?.toString() || "").filter(Boolean);
            if (all.length > 1) {
                amenities = all;
            } else if (all.length === 1) {
                const single = all[0];
                try {
                    const parsed = JSON.parse(single);
                    if (Array.isArray(parsed)) {
                        amenities = parsed.map(x => String(x)).filter(Boolean);
                    } else if (typeof parsed === 'string') {
                        amenities = parsed.split(',').map(s => s.trim()).filter(Boolean);
                    } else {
                        amenities = single.split(',').map(s => s.trim()).filter(Boolean);
                    }
                } catch {
                    amenities = single.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
        }
        const rooms = formData.get("weddingPackages")?.toString();
    
        // Extract location information
        const address = formData.get("address")?.toString();
        const city = formData.get("city")?.toString();
        const state = formData.get("state")?.toString();
        const country = formData.get("country")?.toString();
        const zipCode = formData.get("zipCode")?.toString();

        // Extract pricing information
        const startingPrice = formData.get("startingPrice")?.toString();
        const currency = formData.get("currency")?.toString();

        // Extract contact information
        const phone = formData.get("phone")?.toString();
        const email = formData.get("email")?.toString();
        const website = formData.get("website")?.toString();

        // Extract policy information
        const checkIn = formData.get("checkIn")?.toString();
        const checkOut = formData.get("checkOut")?.toString();
        const cancellation = formData.get("cancellation")?.toString();

        // Extract personal/business information
        const firstName = formData.get("firstName")?.toString();
        const lastName = formData.get("lastName")?.toString();
        const companyName = formData.get("companyName")?.toString();
        const venueType = formData.get("venueType")?.toString();
        const position = formData.get("position")?.toString();
        const websiteLink = formData.get("websiteLink")?.toString();

        // Extract wedding package information
        const offerWeddingPackages = formData.get("offerWeddingPackages")?.toString();
        const resortCategory = formData.get("resortCategory")?.toString();
        const weddingPackages = formData.get("weddingPackages")?.toString();
        const maxGuestCapacity = formData.get("maxGuestCapacity")?.toString();
        const totalRooms = formData.get("totalRooms")?.toString();
        const venueAvailability = formData.get("venueAvailability")?.toString();

        // Extract services and amenities
        const servicesOffered = formData.get("servicesOffered")?.toString();
        const allInclusivePackages = formData.get("allInclusivePackages")?.toString();
        const staffAccommodation = formData.get("staffAccommodation")?.toString();
        const diningOptions = formData.get("diningOptions")?.toString();
        const otherAmenities = formData.get("otherAmenities")?.toString();

        // Extract business information
        const bookingLeadTime = formData.get("bookingLeadTime")?.toString();
        const preferredContactMethod = formData.get("preferredContactMethod")?.toString();
        const weddingDepositRequired = formData.get("weddingDepositRequired")?.toString();
        const refundPolicy = formData.get("refundPolicy")?.toString();
        const referralSource = formData.get("referralSource")?.toString();
        const partnershipInterest = formData.get("partnershipInterest")?.toString();

        // Extract legal information
        const agreeToTerms = formData.get("agreeToTerms");
        const agreeToPrivacy = formData.get("agreeToPrivacy");
        const signature = formData.get("signature")?.toString();
        // Premium flag
        const isPremium = formData.get("isPremium")?.toString();
        const isFeatured = formData.get("isFeatured")?.toString();  
        // Extract file uploads
        const imageFiles = formData.getAll("images");
        const resortPhotoFiles = formData.getAll("uploadResortPhotos");
        const marriagePhotoFiles = formData.getAll("uploadMarriagePhotos");
        const weddingBrochureFiles = formData.getAll("uploadWeddingBrochure");
        const cancelledChequeFiles = formData.getAll("uploadCancelledCheque");

        // Validate required fields
        if (!name || !category || !description || !address || !city || !country) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Missing required fields: name, category, description, address, city, and country are required",
            }, { status: 400 });
        }

        // Upload all image types
        const imageUrls = await uploadFiles(imageFiles, 1200, 800);
        const resortPhotoUrls = await uploadFiles(resortPhotoFiles, 1200, 800);
        const marriagePhotoUrls = await uploadFiles(marriagePhotoFiles, 1200, 800);
        const weddingBrochureUrls = await uploadFiles(weddingBrochureFiles, 1200, 1600);
        const cancelledChequeUrls = await uploadFiles(cancelledChequeFiles, 1200, 800);

        // Create hotel data object
        const hotelData = {
            // Basic hotel information
            name: name || "",
            category: category || "",
            description: description || "",
            rating: safeParseNumber(rating),
            status: (status as HotelStatus) || "draft",
            amenities,
            images: imageUrls,

            // Location information
            location: {
                address: address || "",
                city: city || "",
                state: state || "",
                country: country || "",
                zipCode: zipCode || "",
            },

            // Pricing information
            priceRange: {
                startingPrice: safeParseNumber(startingPrice),
                currency: (currency as Currency) || "INR",
            },

            // Contact information
            contactInfo: {
                phone: phone || "",
                email: email || "",
                website: website || "",
            },

            // Policy information
            policies: {
                checkIn: checkIn || "14:00",
                checkOut: checkOut || "11:00",
                cancellation: cancellation || "Free cancellation up to 24 hours before check-in",
            },

            // Personal/Business information
            firstName: firstName || "",
            lastName: lastName || "",
            companyName: companyName || "",
            venueType: venueType || "",
            position: position || "",
            websiteLink: websiteLink || "",

            // Wedding package information
            offerWeddingPackages: offerWeddingPackages as 'Yes' | 'No' | undefined,
            resortCategory: resortCategory || "",
            weddingPackages: weddingPackages ? (() => {
                try {
                    return JSON.parse(weddingPackages);
                } catch {
                    consoleManager.warn("Failed to parse weddingPackages JSON, using empty array");
                    return [];
                }
            })() : [],
            maxGuestCapacity: maxGuestCapacity || "",
            totalRooms: safeParseNumber(totalRooms),
            venueAvailability: venueAvailability || "",

            // Services and amenities (handle as flexible string or array)
            servicesOffered: parseStringOrArray(servicesOffered, []),
            allInclusivePackages: allInclusivePackages || "",
            staffAccommodation: staffAccommodation || "",
            diningOptions: parseStringOrArray(diningOptions, []),
            otherAmenities: parseStringOrArray(otherAmenities, []),

            // Business and booking information
            bookingLeadTime: bookingLeadTime || "",
            preferredContactMethod: parsePreferredContactMethod(preferredContactMethod),
            weddingDepositRequired: weddingDepositRequired || "",
            refundPolicy: refundPolicy || "",
            referralSource: referralSource || "",
            partnershipInterest: partnershipInterest || "",

            // File uploads
            uploadResortPhotos: resortPhotoUrls,
            uploadMarriagePhotos: marriagePhotoUrls,
            uploadWeddingBrochure: weddingBrochureUrls,
            uploadCancelledCheque: cancelledChequeUrls,

            // Legal information
            agreeToTerms: safeParseBoolean(agreeToTerms?.toString()),
            agreeToPrivacy: safeParseBoolean(agreeToPrivacy?.toString()),
            signature: signature || "",
            isPremium: isPremium === 'true',
            isFeatured: isFeatured === 'true',
        };

        const newHotel = await HotelService.createHotel(hotelData);

        consoleManager.log("Created new hotel:", newHotel.id);

        return NextResponse.json({
            statusCode: 201,
            message: "Hotel created successfully",
            data: newHotel,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });
    } catch (error: any) {
        consoleManager.error("Error in POST /api/hotel:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}