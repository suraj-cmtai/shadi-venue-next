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
// Update a hotel (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Validate hotel exists
        const existingHotel = await HotelService.getHotelById(id);
        if (!existingHotel) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Hotel not found",
            }, { status: 404 });
        }

        // Handle all image uploads
        const imageUrls = await uploadFiles(imageFiles, 1200, 800, existingHotel.images);
        const resortPhotoUrls = await uploadFiles(resortPhotoFiles, 1200, 800, existingHotel.uploadResortPhotos || []);
        const marriagePhotoUrls = await uploadFiles(marriagePhotoFiles, 1200, 800, existingHotel.uploadMarriagePhotos || []);
        const weddingBrochureUrls = await uploadFiles(weddingBrochureFiles, 1200, 1600, existingHotel.uploadWeddingBrochure || []);
        const cancelledChequeUrls = await uploadFiles(cancelledChequeFiles, 1200, 800, existingHotel.uploadCancelledCheque || []);

        // Update hotel data
        const hotelData: any = {
            // Images
            images: imageUrls,
            uploadResortPhotos: resortPhotoUrls,
            uploadMarriagePhotos: marriagePhotoUrls,
            uploadWeddingBrochure: weddingBrochureUrls,
            uploadCancelledCheque: cancelledChequeUrls
        };

        // Basic hotel information
        if (name) hotelData.name = name.toString();
        if (category) hotelData.category = category.toString();
        if (description) hotelData.description = description.toString();
        if (rating) hotelData.rating = Number(rating);
        if (status) hotelData.status = status.toString();
        if (amenities) hotelData.amenities = amenities.toString().split(',').map(item => item.trim());
        if (rooms) hotelData.rooms = JSON.parse(rooms.toString());

        // Location
        if (address || city || state || country || zipCode) {
            hotelData.location = {
                address: address?.toString() || existingHotel.location?.address || "",
                city: city?.toString() || existingHotel.location?.city || "",
                state: state?.toString() || existingHotel.location?.state || "",
                country: country?.toString() || existingHotel.location?.country || "",
                zipCode: zipCode?.toString() || existingHotel.location?.zipCode || "",
            };
        }

        // Price Range
        if (startingPrice || currency) {
            hotelData.priceRange = {
                startingPrice: startingPrice ? Number(startingPrice) : existingHotel.priceRange?.startingPrice || 0,
                currency: (currency?.toString()) || existingHotel.priceRange?.currency || "INR",
            };
        }

        // Contact Info
        if (phone || email || website) {
            hotelData.contactInfo = {
                phone: phone?.toString() || existingHotel.contactInfo?.phone || "",
                email: email?.toString() || existingHotel.contactInfo?.email || "",
                website: website?.toString() || existingHotel.contactInfo?.website || "",
            };
        }

        // Policies
        if (checkIn || checkOut || cancellation) {
            hotelData.policies = {
                checkIn: checkIn?.toString() || existingHotel.policies?.checkIn || "",
                checkOut: checkOut?.toString() || existingHotel.policies?.checkOut || "",
                cancellation: cancellation?.toString() || existingHotel.policies?.cancellation || "",
            };
        }

        // Owner/Manager Information
        if (firstName) hotelData.firstName = firstName.toString();
        if (lastName) hotelData.lastName = lastName.toString();
        if (companyName) hotelData.companyName = companyName.toString();
        if (position) hotelData.position = position.toString();

        // Venue Information
        if (venueType) hotelData.venueType = venueType.toString();
        if (websiteLink) hotelData.websiteLink = websiteLink.toString();
        if (resortCategory) hotelData.resortCategory = resortCategory.toString();
        if (maxGuestCapacity) hotelData.maxGuestCapacity = Number(maxGuestCapacity);
        if (numberOfRooms) hotelData.numberOfRooms = Number(numberOfRooms);

        // Wedding-specific Information
        if (offerWeddingPackages) hotelData.offerWeddingPackages = offerWeddingPackages.toString() === "true";
        if (weddingPackagePrice) hotelData.weddingPackagePrice = Number(weddingPackagePrice);
        if (servicesOffered) {
            // Handle as array or comma-separated string
            try {
                hotelData.servicesOffered = JSON.parse(servicesOffered.toString());
            } catch {
                hotelData.servicesOffered = servicesOffered.toString().split(',').map(item => item.trim());
            }
        }
        if (venueAvailability) {
            // Handle as array or comma-separated string
            try {
                hotelData.venueAvailability = JSON.parse(venueAvailability.toString());
            } catch {
                hotelData.venueAvailability = venueAvailability.toString().split(',').map(item => item.trim());
            }
        }

        // Additional Services and Amenities
        if (allInclusivePackages) hotelData.allInclusivePackages = allInclusivePackages.toString() === "true";
        if (staffAccommodation) hotelData.staffAccommodation = staffAccommodation.toString() === "true";
        if (diningOptions) {
            try {
                hotelData.diningOptions = JSON.parse(diningOptions.toString());
            } catch {
                hotelData.diningOptions = diningOptions.toString().split(',').map(item => item.trim());
            }
        }
        if (otherAmenities) {
            try {
                hotelData.otherAmenities = JSON.parse(otherAmenities.toString());
            } catch {
                hotelData.otherAmenities = otherAmenities.toString().split(',').map(item => item.trim());
            }
        }

        // Booking and Business Information
        if (bookingLeadTime) hotelData.bookingLeadTime = bookingLeadTime.toString();
        if (preferredContactMethod) hotelData.preferredContactMethod = preferredContactMethod.toString();
        if (weddingDepositRequired) hotelData.weddingDepositRequired = Number(weddingDepositRequired);
        if (refundPolicy) hotelData.refundPolicy = refundPolicy.toString();
        if (referralSource) hotelData.referralSource = referralSource.toString();
        if (partnershipInterest) hotelData.partnershipInterest = partnershipInterest.toString();

        // Legal and Agreement Fields
        hotelData.agreeToTerms = agreeToTerms;
        hotelData.agreeToPrivacy = agreeToPrivacy;
        if (signature) hotelData.signature = signature.toString();

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
