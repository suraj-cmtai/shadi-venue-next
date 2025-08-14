import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import HotelService, { Currency, HotelStatus } from "../../services/hotelServices";
import consoleManager from "../../utils/consoleManager";

// Get all hotels (GET)
export async function GET(req: Request) {
    try {
        const hotels = await HotelService.getAllHotels();
        
        consoleManager.log("Fetched all hotels");

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

        // Basic hotel info
        const name = formData.get("name");
        const category = formData.get("category");
        const description = formData.get("description");
        const address = formData.get("address");
        const city = formData.get("city");
        const state = formData.get("state");
        const country = formData.get("country");
        const zipCode = formData.get("zipCode");
        const startingPrice = formData.get("startingPrice");
        const currency = formData.get("currency");
        const rating = formData.get("rating");
        const status = formData.get("status");
        const amenities = formData.get("amenities");
        const rooms = formData.get("rooms");
        const phone = formData.get("phone");
        const email = formData.get("email");
        const website = formData.get("website");
        const checkIn = formData.get("checkIn");
        const checkOut = formData.get("checkOut");
        const cancellation = formData.get("cancellation");

        // Additional fields
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const companyName = formData.get("companyName");
        const venueType = formData.get("venueType");
        const position = formData.get("position");
        const websiteLink = formData.get("websiteLink");
        const offerWeddingPackages = formData.get("offerWeddingPackages");
        const resortCategory = formData.get("resortCategory");
        const weddingPackagePrice = formData.get("weddingPackagePrice");
        const servicesOffered = formData.get("servicesOffered");
        const maxGuestCapacity = formData.get("maxGuestCapacity");
        const numberOfRooms = formData.get("numberOfRooms");
        const venueAvailability = formData.get("venueAvailability");
        const allInclusivePackages = formData.get("allInclusivePackages");
        const staffAccommodation = formData.get("staffAccommodation");
        const diningOptions = formData.get("diningOptions");
        const otherAmenities = formData.get("otherAmenities");
        const bookingLeadTime = formData.get("bookingLeadTime");
        const preferredContactMethod = formData.get("preferredContactMethod");
        const weddingDepositRequired = formData.get("weddingDepositRequired");
        const refundPolicy = formData.get("refundPolicy");
        const referralSource = formData.get("referralSource");
        const partnershipInterest = formData.get("partnershipInterest");
        const agreeToTerms = formData.get("agreeToTerms") === "true";
        const agreeToPrivacy = formData.get("agreeToPrivacy") === "true";
        const signature = formData.get("signature");

        // Image files
        const imageFiles = formData.getAll("images");
        const resortPhotoFiles = formData.getAll("uploadResortPhotos");
        const marriagePhotoFiles = formData.getAll("uploadMarriagePhotos");
        const weddingBrochureFiles = formData.getAll("uploadWeddingBrochure");
        const cancelledChequeFiles = formData.getAll("uploadCancelledCheque");

        // Validate required fields
        if (!name || !category || !description || !address || !city || !state || 
            !country || !startingPrice || !currency || !rooms || !phone || !email) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Missing required fields",
            }, { status: 400 });
        }

        // Upload all image types
        const uploadFiles = async (files: FormDataEntryValue[], width: number, height: number): Promise<string[]> => {
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
        };

        // Upload different types of images
        const imageUrls = await uploadFiles(imageFiles, 1200, 800);
        const resortPhotoUrls = await uploadFiles(resortPhotoFiles, 1200, 800);
        const marriagePhotoUrls = await uploadFiles(marriagePhotoFiles, 1200, 800);
        const weddingBrochureUrls = await uploadFiles(weddingBrochureFiles, 1200, 1600);
        const cancelledChequeUrls = await uploadFiles(cancelledChequeFiles, 1200, 800);

        // Create hotel data
        const hotelData = {
            name: name?.toString() || "",
            category: category?.toString() || "",
            description: description?.toString() || "",
            location: {
                address: address?.toString() || "",
                city: city?.toString() || "",
                state: state?.toString() || "",
                country: country?.toString() || "",
                zipCode: zipCode?.toString() || "",
            },
            priceRange: {
                startingPrice: Number(startingPrice) || 0,
                currency: (currency?.toString() || "USD") as Currency,
            },
            rating: rating ? Number(rating) : 0,
            status: (status?.toString() || "draft") as HotelStatus,
            amenities: amenities ? amenities.toString().split(',').map(item => item.trim()) : [],
            rooms: rooms ? JSON.parse(rooms.toString()) : [],

            // Additional fields
            firstName: firstName?.toString(),
            lastName: lastName?.toString(),
            companyName: companyName?.toString(),
            venueType: venueType?.toString(),
            position: position?.toString(),
            websiteLink: websiteLink?.toString(),
            offerWeddingPackages: offerWeddingPackages?.toString() as 'Yes' | 'No' | undefined,
            resortCategory: resortCategory?.toString(),
            weddingPackagePrice: weddingPackagePrice?.toString(),
            servicesOffered: servicesOffered ? servicesOffered.toString().split(',').map(item => item.trim()) : [],
            maxGuestCapacity: maxGuestCapacity?.toString(),
            numberOfRooms: numberOfRooms?.toString(),
            venueAvailability: venueAvailability?.toString(),
            allInclusivePackages: allInclusivePackages ? allInclusivePackages.toString().split(',') as ('Yes' | 'No' | 'Partially')[] : [],
            staffAccommodation: staffAccommodation ? staffAccommodation.toString().split(',') as ('Yes' | 'No' | 'Limited')[] : [],
            diningOptions: diningOptions ? diningOptions.toString().split(',').map(item => item.trim()) : [],
            otherAmenities: otherAmenities ? otherAmenities.toString().split(',').map(item => item.trim()) : [],
            bookingLeadTime: bookingLeadTime?.toString(),
            preferredContactMethod: preferredContactMethod ? preferredContactMethod.toString().split(',').map(item => item.trim()) : [],
            weddingDepositRequired: weddingDepositRequired?.toString(),
            refundPolicy: refundPolicy?.toString(),
            referralSource: referralSource?.toString(),
            partnershipInterest: partnershipInterest?.toString(),
            uploadResortPhotos: resortPhotoUrls,
            uploadMarriagePhotos: marriagePhotoUrls,
            uploadWeddingBrochure: weddingBrochureUrls,
            uploadCancelledCheque: cancelledChequeUrls,
            agreeToTerms,
            agreeToPrivacy,
            signature: signature?.toString(),
            images: imageUrls,
            contactInfo: {
                phone: phone.toString(),
                email: email.toString(),
                website: website?.toString(),
            },
            policies: {
                checkIn: checkIn?.toString() || "14:00",
                checkOut: checkOut?.toString() || "11:00",
                cancellation: cancellation?.toString() || "24 hours before check-in",
            },
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
