import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import BanquetService from "../../services/banquetServices";
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

// Normalize any multi-value field from FormData into a string[]
function getStringArray(formData: FormData, key: string): string[] {
    const values = formData.getAll(key);
    if (values.length > 0) {
        const result: string[] = [];
        for (const v of values) {
            if (v instanceof File) continue;
            const s = (v ?? '').toString();
            if (!s) continue;
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) {
                    result.push(...parsed.map(x => String(x)).filter(Boolean));
                    continue;
                }
            } catch {}
            if (s.includes(',')) {
                result.push(...s.split(',').map(x => x.trim()).filter(Boolean));
            } else {
                result.push(s);
            }
        }
        return result;
    }
    // Also support bracketed keys like key[0], key[1]
    const collected: string[] = [];
    // @ts-ignore - FormData entries() exists in the runtime
    for (const [k, v] of (formData as any).entries()) {
        if (k === key || k.startsWith(`${key}[`)) {
            if (v instanceof File) continue;
            const s = (v ?? '').toString();
            if (s) collected.push(s);
        }
    }
    return collected;
}

// Collect strings and upload files for array fields; supports bracketed keys
async function collectUrlsFromMixedField(formData: FormData, baseKey: string, width = 1200, height = 800): Promise<string[]> {
    const urls: string[] = [];
    const files: FormDataEntryValue[] = [];
    // @ts-ignore - FormData entries() exists in the runtime
    for (const [k, v] of (formData as any).entries()) {
        if (k === baseKey || k.startsWith(`${baseKey}[`)) {
            if (v instanceof File) {
                files.push(v);
            } else {
                const s = (v ?? '').toString();
                if (s) urls.push(s);
            }
        }
    }
    if (files.length) {
        const uploaded = await uploadFiles(files, width, height);
        urls.push(...uploaded);
    }
    return urls;
}


// Get all banquets (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const city = searchParams.get('city');
        const category = searchParams.get('category');
        const venueType = searchParams.get('venueType');
        const minCapacity = searchParams.get('minCapacity');
        const maxCapacity = searchParams.get('maxCapacity');

        let banquets;

        // If any filters are provided, use advanced search
        if (city || category || venueType || minCapacity || maxCapacity) {
            const filters: any = {};
            
            if (city) filters.city = city;
            if (category) filters.category = category;
            if (venueType) filters.venueType = venueType;
            if (minCapacity) filters.minCapacity = parseInt(minCapacity);
            if (maxCapacity) filters.maxCapacity = parseInt(maxCapacity);
            
            banquets = await BanquetService.advancedSearch(filters);
        } else {
            banquets = await BanquetService.getAllBanquets();
        }
        
        consoleManager.log("Fetched banquets with filters:", { city, category, venueType, count: banquets.length });

        return NextResponse.json({
            statusCode: 200,
            message: "Banquets fetched successfully",
            data: banquets,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/banquet:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Create a new banquet (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Basic strings
        const companyName = formData.get("companyName")?.toString() || "";
        const category = formData.get("category")?.toString() || "";
        const description = formData.get("description")?.toString() || "";
        const status = formData.get("status")?.toString() || "";
        const rating = Number(formData.get("rating")?.toString() || 0);

        // Location (prefer nested fields; fallback to flat)
        const location = {
            address: formData.get("location[address]")?.toString() || formData.get("address")?.toString() || "",
            city: formData.get("location[city]")?.toString() || formData.get("city")?.toString() || "",
            state: formData.get("location[state]")?.toString() || formData.get("state")?.toString() || "",
            country: formData.get("location[country]")?.toString() || formData.get("country")?.toString() || "",
            zipCode: formData.get("location[zipCode]")?.toString() || formData.get("postalCode")?.toString() || "",
        };

        // Price range
        const priceRange = {
            startingPrice: Number(formData.get("priceRange[startingPrice]")?.toString() || 0),
            currency: formData.get("priceRange[currency]")?.toString() || "INR",
        };

        // Contact info
        const contactInfo = {
            phone: formData.get("contactInfo[phone]")?.toString() || "",
            email: formData.get("contactInfo[email]")?.toString() || "",
            website: formData.get("contactInfo[website]")?.toString() || "",
        };

        // Policies
        const policies = {
            checkIn: formData.get("policies[checkIn]")?.toString() || "",
            checkOut: formData.get("policies[checkOut]")?.toString() || "",
            cancellation: formData.get("policies[cancellation]")?.toString() || "",
        };

        // Venue details
        const venueName = formData.get("venueName")?.toString() || "";
        const capacity = Number(formData.get("capacity")?.toString() || 0);
        const area = formData.get("area")?.toString() || "";
        const venueType = (formData.get("venueType")?.toString() as "Indoor" | "Outdoor" | "Both") || "Indoor";

        // Arrays & multi-selects
        const amenities = getStringArray(formData, "amenities");
        const facilities = getStringArray(formData, "facilities");
        const servicesOffered = getStringArray(formData, "servicesOffered");
        const diningOptions = getStringArray(formData, "diningOptions");
        const otherAmenities = getStringArray(formData, "otherAmenities");

        // Pricing & packages
        const pricingRange = formData.get("pricingRange")?.toString() || "";
        const packages = formData.get("packages")?.toString() || "";
        const rentalOptions = formData.get("rentalOptions")?.toString() || "";

        // Flags & misc
        const googleLocation = formData.get("googleLocation")?.toString() || "";
        const isPremium = String(formData.get("isPremium") || "").toLowerCase() === "true";
        const isFeatured = String(formData.get("isFeatured") || "").toLowerCase() === "true";
        const firstName = formData.get("firstName")?.toString() || "";
        const lastName = formData.get("lastName")?.toString() || "";
        const position = formData.get("position")?.toString() || "";
        const websiteLink = formData.get("websiteLink")?.toString() || "";
        const offerWeddingPackages = formData.get("offerWeddingPackages")?.toString() || "";
        const resortCategory = formData.get("resortCategory")?.toString() || "";
        const maxGuestCapacity = formData.get("maxGuestCapacity")?.toString() || "";
        const totalRooms = formData.get("totalRooms")?.toString() || "";
        const venueAvailability = formData.get("venueAvailability")?.toString() || "";
        const preferredContactMethod = getStringArray(formData, "preferredContactMethod");
        const allInclusivePackages = getStringArray(formData, "allInclusivePackages");
        const staffAccommodation = formData.get("staffAccommodation")?.toString() || "";
        const bookingLeadTime = formData.get("bookingLeadTime")?.toString() || "";
        const weddingDepositRequired = formData.get("weddingDepositRequired")?.toString() || "";
        const refundPolicy = formData.get("refundPolicy")?.toString() || "";
        const referralSource = formData.get("referralSource")?.toString() || "";
        const partnershipInterest = formData.get("partnershipInterest")?.toString() || "";
        const agreeToTerms = String(formData.get("agreeToTerms") || "").toLowerCase() === "true";
        const agreeToPrivacy = String(formData.get("agreeToPrivacy") || "").toLowerCase() === "true";
        const signature = formData.get("signature")?.toString() || "";

        // Media arrays (accept both URLs and File uploads)
        const images = await collectUrlsFromMixedField(formData, "images", 1200, 800);
        const uploadResortPhotos = await collectUrlsFromMixedField(formData, "uploadResortPhotos", 1200, 800);
        const uploadMarriagePhotos = await collectUrlsFromMixedField(formData, "uploadMarriagePhotos", 1200, 800);
        const uploadWeddingBrochure = getStringArray(formData, "uploadWeddingBrochure");
        const uploadCancelledCheque = getStringArray(formData, "uploadCancelledCheque");

        // Build data to match service interface
        const banquetData: any = {
            companyName,
            category,
            location,
            priceRange,
            rating,
            status,
            description,
            amenities,
            venueName,
            capacity,
            area,
            venueType,
            facilities,
            pricingRange,
            packages,
            rentalOptions,
            images,
            contactInfo,
            policies,
            googleLocation,
            isPremium,
            isFeatured,
            firstName,
            lastName,
            position,
            websiteLink,
            offerWeddingPackages,
            resortCategory,
            maxGuestCapacity,
            totalRooms,
            venueAvailability,
            servicesOffered,
            diningOptions,
            otherAmenities,
            preferredContactMethod,
            allInclusivePackages,
            staffAccommodation,
            bookingLeadTime,
            weddingDepositRequired,
            refundPolicy,
            referralSource,
            partnershipInterest,
            uploadResortPhotos,
            uploadMarriagePhotos,
            uploadWeddingBrochure,
            uploadCancelledCheque,
            agreeToTerms,
            agreeToPrivacy,
            signature,
        };

        const newBanquet = await BanquetService.createBanquet(banquetData);

        consoleManager.log("Created new banquet:", newBanquet.id);

        return NextResponse.json({
            statusCode: 201,
            message: "Banquet created successfully",
            data: newBanquet,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });
    } catch (error: any) {
        consoleManager.error("Error in POST /api/banquet:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}