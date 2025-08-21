import { NextResponse } from "next/server";
import { ReplaceImage } from "../../../controller/imageController";
import HotelService, { Currency, HotelStatus } from "../../../services/hotelServices";
import consoleManager from "../../../utils/consoleManager";

// Helper function to handle file uploads
async function uploadFiles(files: FormDataEntryValue[], width: number, height: number, oldUrls: string[] = []): Promise<string[]> {
    const uploadedUrls: string[] = [...oldUrls];
    
    if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
            if (file instanceof File) {
                const uploadedUrl = await ReplaceImage(file, oldUrls[0] || '', width, height);
                if (typeof uploadedUrl === 'string') {
                    consoleManager.log("Image uploaded successfully:", uploadedUrl);
                    return uploadedUrl;
                }
            }
            return null;
        });
        const newUrls = await Promise.all(uploadPromises);
        const validUrls = newUrls.filter(Boolean) as string[];
        if (validUrls.length > 0) {
            uploadedUrls.length = 0; // Clear old URLs
            uploadedUrls.push(...validUrls);
        }
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

// Get a specific hotel (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const hotel = await HotelService.getHotelById(id);

        if (!hotel) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Hotel not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched hotel:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotel fetched successfully",
            data: {
                ...hotel,
                createdAt: hotel.createdAt,
                updatedAt: hotel.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/hotel/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a hotel (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        
        // Validate hotel exists
        const existingHotel = await HotelService.getHotelById(id);
        if (!existingHotel) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Hotel not found",
            }, { status: 404 });
        }

        // Extract and handle file uploads first
        const imageFiles = formData.getAll("images");
        const resortPhotoFiles = formData.getAll("uploadResortPhotos");
        const marriagePhotoFiles = formData.getAll("uploadMarriagePhotos");
        const weddingBrochureFiles = formData.getAll("uploadWeddingBrochure");
        const cancelledChequeFiles = formData.getAll("uploadCancelledCheque");

        // Handle all image uploads
        const imageUrls = await uploadFiles(imageFiles, 1200, 800, existingHotel.images || []);
        const resortPhotoUrls = await uploadFiles(resortPhotoFiles, 1200, 800, existingHotel.uploadResortPhotos || []);
        const marriagePhotoUrls = await uploadFiles(marriagePhotoFiles, 1200, 800, existingHotel.uploadMarriagePhotos || []);
        const weddingBrochureUrls = await uploadFiles(weddingBrochureFiles, 1200, 1600, existingHotel.uploadWeddingBrochure || []);
        const cancelledChequeUrls = await uploadFiles(cancelledChequeFiles, 1200, 800, existingHotel.uploadCancelledCheque || []);

        // Build update data object
        const hotelData: any = {
            // Always update images
            images: imageUrls,
            uploadResortPhotos: resortPhotoUrls,
            uploadMarriagePhotos: marriagePhotoUrls,
            uploadWeddingBrochure: weddingBrochureUrls,
            uploadCancelledCheque: cancelledChequeUrls
        };

        // Basic hotel information
        const name = formData.get("name")?.toString();
        const category = formData.get("category")?.toString();
        const description = formData.get("description")?.toString();
        const rating = formData.get("rating")?.toString();
        const status = formData.get("status")?.toString();

        // Amenities: always expect as array, fallback to [] if not present
        let amenities: string[] = [];
        if (formData.has("amenities")) {
            // If amenities is sent as multiple fields (array)
            const amenitiesRaw = formData.getAll("amenities");
            if (amenitiesRaw.length > 1) {
                amenities = amenitiesRaw.map(a => a.toString().trim()).filter(Boolean);
            } else if (amenitiesRaw.length === 1) {
                // If sent as a single comma-separated string
                const val = amenitiesRaw[0]?.toString();
                if (val && val.includes(",")) {
                    amenities = val.split(",").map(a => a.trim()).filter(Boolean);
                } else if (val) {
                    amenities = [val.trim()];
                }
            }
        }
        // If not present, keep existing amenities
        if (amenities.length > 0) {
            hotelData.amenities = amenities;
        }

        const rooms = formData.get("rooms")?.toString();

        if (name) hotelData.name = name;
        if (category) hotelData.category = category;
        if (description) hotelData.description = description;
        if (rating) hotelData.rating = safeParseNumber(rating);
        if (status) hotelData.status = status as HotelStatus;
        if (rooms) {
            try {
                hotelData.rooms = JSON.parse(rooms);
            } catch {
                consoleManager.warn("Failed to parse rooms JSON, keeping existing rooms");
            }
        }

        // Location information - check for nested field names
        const address = formData.get("location[address]")?.toString() || formData.get("address")?.toString();
        const city = formData.get("location[city]")?.toString() || formData.get("city")?.toString();
        const state = formData.get("location[state]")?.toString() || formData.get("state")?.toString();
        const country = formData.get("location[country]")?.toString() || formData.get("country")?.toString();
        const zipCode = formData.get("location[zipCode]")?.toString() || formData.get("zipCode")?.toString();
        // Google location field
        const googleLocation = formData.get("googleLocation")?.toString(); 

        if (address || city || state || country || zipCode || googleLocation) {
            hotelData.location = {
                address: address || existingHotel.location?.address || "",
                city: city || existingHotel.location?.city || "",
                state: state || existingHotel.location?.state || "",
                country: country || existingHotel.location?.country || "",
                zipCode: zipCode || existingHotel.location?.zipCode || "",
            };
        }
        if(googleLocation) hotelData.googleLocation = googleLocation || "";

        // Price Range - check for nested field names
        const startingPrice = formData.get("priceRange[startingPrice]")?.toString() || formData.get("startingPrice")?.toString();
        const currency = formData.get("priceRange[currency]")?.toString() || formData.get("currency")?.toString();

        if (startingPrice || currency) {
            hotelData.priceRange = {
                startingPrice: startingPrice ? safeParseNumber(startingPrice) : existingHotel.priceRange?.startingPrice || 0,
                currency: (currency as Currency) || existingHotel.priceRange?.currency || "INR",
            };
        }

        // Contact Info - check for nested field names
        const phone = formData.get("contactInfo[phone]")?.toString() || formData.get("phone")?.toString();
        const email = formData.get("contactInfo[email]")?.toString() || formData.get("email")?.toString();
        const website = formData.get("contactInfo[website]")?.toString() || formData.get("website")?.toString();

        if (phone || email || website) {
            hotelData.contactInfo = {
                phone: phone || existingHotel.contactInfo?.phone || "",
                email: email || existingHotel.contactInfo?.email || "",
                website: website || existingHotel.contactInfo?.website || "",
            };
        }

        // Policies - check for nested field names
        const checkIn = formData.get("policies[checkIn]")?.toString() || formData.get("checkIn")?.toString();
        const checkOut = formData.get("policies[checkOut]")?.toString() || formData.get("checkOut")?.toString();
        const cancellation = formData.get("policies[cancellation]")?.toString() || formData.get("cancellation")?.toString();

        if (checkIn || checkOut || cancellation) {
            hotelData.policies = {
                checkIn: checkIn || existingHotel.policies?.checkIn || "",
                checkOut: checkOut || existingHotel.policies?.checkOut || "",
                cancellation: cancellation || existingHotel.policies?.cancellation || "",
            };
        }

        // Personal/Business Information
        const firstName = formData.get("firstName")?.toString();
        const lastName = formData.get("lastName")?.toString();
        const companyName = formData.get("companyName")?.toString();
        const venueType = formData.get("venueType")?.toString();
        const position = formData.get("position")?.toString();
        const websiteLink = formData.get("websiteLink")?.toString();

        if (firstName !== undefined) hotelData.firstName = firstName;
        if (lastName !== undefined) hotelData.lastName = lastName;
        if (companyName !== undefined) hotelData.companyName = companyName;
        if (venueType !== undefined) hotelData.venueType = venueType;
        if (position !== undefined) hotelData.position = position;
        if (websiteLink !== undefined) hotelData.websiteLink = websiteLink;

        // Wedding and Venue Information
        const offerWeddingPackages = formData.get("offerWeddingPackages")?.toString();
        const resortCategory = formData.get("resortCategory")?.toString();
        const weddingPackagePrice = formData.get("weddingPackagePrice")?.toString();
        const maxGuestCapacity = formData.get("maxGuestCapacity")?.toString();
        const numberOfRooms = formData.get("numberOfRooms")?.toString();
        const venueAvailability = formData.get("venueAvailability")?.toString();

        if (offerWeddingPackages !== undefined) hotelData.offerWeddingPackages = offerWeddingPackages as 'Yes' | 'No';
        if (resortCategory !== undefined) hotelData.resortCategory = resortCategory;
        if (weddingPackagePrice !== undefined) hotelData.weddingPackagePrice = weddingPackagePrice;
        if (maxGuestCapacity !== undefined) hotelData.maxGuestCapacity = maxGuestCapacity;
        if (numberOfRooms !== undefined) hotelData.numberOfRooms = numberOfRooms;
        if (venueAvailability !== undefined) hotelData.venueAvailability = venueAvailability;

        // Services and Amenities (handle as arrays or strings)
        const servicesOffered = formData.get("servicesOffered")?.toString();
        const diningOptions = formData.get("diningOptions")?.toString();
        const otherAmenities = formData.get("otherAmenities")?.toString();
        const allInclusivePackages = formData.get("allInclusivePackages")?.toString();
        const staffAccommodation = formData.get("staffAccommodation")?.toString();

        if (servicesOffered !== undefined) hotelData.servicesOffered = parseStringOrArray(servicesOffered, []);
        if (diningOptions !== undefined) hotelData.diningOptions = parseStringOrArray(diningOptions, []);
        if (otherAmenities !== undefined) hotelData.otherAmenities = parseStringOrArray(otherAmenities, []);
        if (allInclusivePackages !== undefined) hotelData.allInclusivePackages = allInclusivePackages;
        if (staffAccommodation !== undefined) hotelData.staffAccommodation = staffAccommodation;

        // Business and Booking Information
        const bookingLeadTime = formData.get("bookingLeadTime")?.toString();
        const preferredContactMethod = formData.get("preferredContactMethod")?.toString();
        const weddingDepositRequired = formData.get("weddingDepositRequired")?.toString();
        const refundPolicy = formData.get("refundPolicy")?.toString();
        const referralSource = formData.get("referralSource")?.toString();
        const partnershipInterest = formData.get("partnershipInterest")?.toString();

        if (bookingLeadTime !== undefined) hotelData.bookingLeadTime = bookingLeadTime;
        if (preferredContactMethod !== undefined) hotelData.preferredContactMethod = preferredContactMethod;
        if (weddingDepositRequired !== undefined) hotelData.weddingDepositRequired = weddingDepositRequired;
        if (refundPolicy !== undefined) hotelData.refundPolicy = refundPolicy;
        if (referralSource !== undefined) hotelData.referralSource = referralSource;
        if (partnershipInterest !== undefined) hotelData.partnershipInterest = partnershipInterest;

        // Legal and Agreement Fields
        const agreeToTerms = formData.get("agreeToTerms")?.toString();
        const agreeToPrivacy = formData.get("agreeToPrivacy")?.toString();
        const signature = formData.get("signature")?.toString();

        if (agreeToTerms !== undefined) hotelData.agreeToTerms = safeParseBoolean(agreeToTerms);
        if (agreeToPrivacy !== undefined) hotelData.agreeToPrivacy = safeParseBoolean(agreeToPrivacy);
        if (signature !== undefined) hotelData.signature = signature;

        // Extract image URLs that are sent as individual indexed entries
        const imageUrlsFromForm: string[] = [];
        const resortPhotoUrlsFromForm: string[] = [];
        const marriagePhotoUrlsFromForm: string[] = [];
        const weddingBrochureUrlsFromForm: string[] = [];
        const cancelledChequeUrlsFromForm: string[] = [];

        // Check for indexed image URLs
        let index = 0;
        while (formData.get(`images[${index}]`)) {
            const url = formData.get(`images[${index}]`)?.toString();
            if (url) imageUrlsFromForm.push(url);
            index++;
        }

        index = 0;
        while (formData.get(`uploadResortPhotos[${index}]`)) {
            const url = formData.get(`uploadResortPhotos[${index}]`)?.toString();
            if (url) resortPhotoUrlsFromForm.push(url);
            index++;
        }

        index = 0;
        while (formData.get(`uploadMarriagePhotos[${index}]`)) {
            const url = formData.get(`uploadMarriagePhotos[${index}]`)?.toString();
            if (url) marriagePhotoUrlsFromForm.push(url);
            index++;
        }

        index = 0;
        while (formData.get(`uploadWeddingBrochure[${index}]`)) {
            const url = formData.get(`uploadWeddingBrochure[${index}]`)?.toString();
            if (url) weddingBrochureUrlsFromForm.push(url);
            index++;
        }

        index = 0;
        while (formData.get(`uploadCancelledCheque[${index}]`)) {
            const url = formData.get(`uploadCancelledCheque[${index}]`)?.toString();
            if (url) cancelledChequeUrlsFromForm.push(url);
            index++;
        }

        // Merge existing URLs with any URLs sent from the form (if no new files uploaded)
        if (imageFiles.length === 0 && imageUrlsFromForm.length > 0) {
            hotelData.images = imageUrlsFromForm;
        }
        if (resortPhotoFiles.length === 0 && resortPhotoUrlsFromForm.length > 0) {
            hotelData.uploadResortPhotos = resortPhotoUrlsFromForm;
        }
        if (marriagePhotoFiles.length === 0 && marriagePhotoUrlsFromForm.length > 0) {
            hotelData.uploadMarriagePhotos = marriagePhotoUrlsFromForm;
        }
        if (weddingBrochureFiles.length === 0 && weddingBrochureUrlsFromForm.length > 0) {
            hotelData.uploadWeddingBrochure = weddingBrochureUrlsFromForm;
        }
        if (cancelledChequeFiles.length === 0 && cancelledChequeUrlsFromForm.length > 0) {
            hotelData.uploadCancelledCheque = cancelledChequeUrlsFromForm;
        }

        // Preserve createdAt and update updatedAt
        hotelData.createdAt = existingHotel.createdAt;
        hotelData.updatedAt = new Date();

        const updatedHotel = await HotelService.updateHotel(id, hotelData);

        consoleManager.log("Hotel updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotel updated successfully",
            data: {
                ...updatedHotel,
                createdAt: updatedHotel.createdAt,
                updatedAt: updatedHotel.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/hotel/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a hotel (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const hotel = await HotelService.getHotelById(id);
        if (!hotel) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Hotel not found",
            }, { status: 404 });
        }

        await HotelService.deleteHotel(id);

        consoleManager.log("Hotel deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotel deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/hotel/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}