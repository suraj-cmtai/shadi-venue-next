import { NextResponse } from "next/server";
import { UploadImage } from "../../../controller/imageController";
import BanquetService, { BanquetStatus } from "../../../services/banquetServices";
import consoleManager from "../../../utils/consoleManager";

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

// Get a specific banquet by ID (GET)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Banquet ID is required",
            }, { status: 400 });
        }

        const banquet = await BanquetService.getBanquetById(id);
        
        if (!banquet) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Banquet not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched banquet:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Banquet fetched successfully",
            data: banquet,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/banquet/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a specific banquet by ID (PUT)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Banquet ID is required",
            }, { status: 400 });
        }

        const formData = await req.formData();

        // Extract basic banquet information
        const name = formData.get("companyName")?.toString();
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
        
        // Premium flags
        const isPremium = formData.get("isPremium")?.toString();
        const isFeatured = formData.get("isFeatured")?.toString();

        // Extract file uploads
        const imageFiles = formData.getAll("images");
        const resortPhotoFiles = formData.getAll("uploadResortPhotos");
        const marriagePhotoFiles = formData.getAll("uploadMarriagePhotos");
        const weddingBrochureFiles = formData.getAll("uploadWeddingBrochure");
        const cancelledChequeFiles = formData.getAll("uploadCancelledCheque");

        // Upload all image types
        const imageUrls = await uploadFiles(imageFiles, 1200, 800);
        const resortPhotoUrls = await uploadFiles(resortPhotoFiles, 1200, 800);
        const marriagePhotoUrls = await uploadFiles(marriagePhotoFiles, 1200, 800);
        const weddingBrochureUrls = await uploadFiles(weddingBrochureFiles, 1200, 1600);
        const cancelledChequeUrls = await uploadFiles(cancelledChequeFiles, 1200, 800);

        // Create update data object
        const updateData: any = {};

        // Only include fields that are provided
        if (name !== undefined) updateData.venueName = name;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (rating !== undefined) updateData.rating = safeParseNumber(rating);
        if (status !== undefined) updateData.status = status as BanquetStatus;
        if (amenities.length > 0) updateData.amenities = amenities;
        if (imageUrls.length > 0) updateData.images = imageUrls;

        // Location information
        if (address !== undefined || city !== undefined || state !== undefined || country !== undefined || zipCode !== undefined) {
            updateData.location = {
                address: address || "",
                city: city || "",
                state: state || "",
                country: country || "",
                zipCode: zipCode || "",
            };
        }

        // Pricing information
        if (startingPrice !== undefined || currency !== undefined) {
            updateData.priceRange = {
                startingPrice: safeParseNumber(startingPrice),
                currency: currency || "INR",
            };
        }

        // Contact information
        if (phone !== undefined || email !== undefined || website !== undefined) {
            updateData.contactInfo = {
                phone: phone || "",
                email: email || "",
                website: website || "",
            };
        }

        // Policy information
        if (checkIn !== undefined || checkOut !== undefined || cancellation !== undefined) {
            updateData.policies = {
                checkIn: checkIn || "14:00",
                checkOut: checkOut || "11:00",
                cancellation: cancellation || "",
            };
        }

        // Personal/Business information
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (companyName !== undefined) updateData.companyName = companyName;
        if (venueType !== undefined) updateData.venueType = venueType;
        if (position !== undefined) updateData.position = position;
        if (websiteLink !== undefined) updateData.websiteLink = websiteLink;

        // Wedding package information
        if (offerWeddingPackages !== undefined) updateData.offerWeddingPackages = offerWeddingPackages as 'Yes' | 'No';
        if (resortCategory !== undefined) updateData.resortCategory = resortCategory;
        if (weddingPackages !== undefined) {
            try {
                updateData.weddingPackages = JSON.parse(weddingPackages);
            } catch {
                updateData.weddingPackages = [];
            }
        }
        if (maxGuestCapacity !== undefined) updateData.maxGuestCapacity = maxGuestCapacity;
        if (totalRooms !== undefined) updateData.totalRooms = safeParseNumber(totalRooms);
        if (venueAvailability !== undefined) updateData.venueAvailability = venueAvailability;

        // Services and amenities
        if (servicesOffered !== undefined) updateData.servicesOffered = parseStringOrArray(servicesOffered, []);
        if (allInclusivePackages !== undefined) updateData.allInclusivePackages = allInclusivePackages;
        if (staffAccommodation !== undefined) updateData.staffAccommodation = staffAccommodation;
        if (diningOptions !== undefined) updateData.diningOptions = parseStringOrArray(diningOptions, []);
        if (otherAmenities !== undefined) updateData.otherAmenities = parseStringOrArray(otherAmenities, []);

        // Business and booking information
        if (bookingLeadTime !== undefined) updateData.bookingLeadTime = bookingLeadTime;
        if (preferredContactMethod !== undefined) updateData.preferredContactMethod = parsePreferredContactMethod(preferredContactMethod);
        if (weddingDepositRequired !== undefined) updateData.weddingDepositRequired = weddingDepositRequired;
        if (refundPolicy !== undefined) updateData.refundPolicy = refundPolicy;
        if (referralSource !== undefined) updateData.referralSource = referralSource;
        if (partnershipInterest !== undefined) updateData.partnershipInterest = partnershipInterest;

        // File uploads
        if (resortPhotoUrls.length > 0) updateData.uploadResortPhotos = resortPhotoUrls;
        if (marriagePhotoUrls.length > 0) updateData.uploadMarriagePhotos = marriagePhotoUrls;
        if (weddingBrochureUrls.length > 0) updateData.uploadWeddingBrochure = weddingBrochureUrls;
        if (cancelledChequeUrls.length > 0) updateData.uploadCancelledCheque = cancelledChequeUrls;

        // Legal information
        if (agreeToTerms !== undefined) updateData.agreeToTerms = safeParseBoolean(agreeToTerms?.toString());
        if (agreeToPrivacy !== undefined) updateData.agreeToPrivacy = safeParseBoolean(agreeToPrivacy?.toString());
        if (signature !== undefined) updateData.signature = signature;
        if (isPremium !== undefined) updateData.isPremium = isPremium === 'true';
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true';

        const updatedBanquet = await BanquetService.updateBanquet(id, updateData);

        consoleManager.log("Updated banquet:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Banquet updated successfully",
            data: updatedBanquet,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/banquet/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a specific banquet by ID (DELETE)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Banquet ID is required",
            }, { status: 400 });
        }

        // Check if banquet exists
        const existingBanquet = await BanquetService.getBanquetById(id);
        if (!existingBanquet) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Banquet not found",
            }, { status: 404 });
        }

        await BanquetService.deleteBanquet(id);

        consoleManager.log("Deleted banquet:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Banquet deleted successfully",
            data: { id },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/banquet/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}