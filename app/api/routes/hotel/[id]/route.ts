import { NextResponse } from "next/server";
import { ReplaceImage } from "../../../controller/imageController";
import HotelService from "../../../services/hotelServices";
import consoleManager from "../../../utils/consoleManager";

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
        const files = formData.getAll("images");

        // Validate hotel exists
        const existingHotel = await HotelService.getHotelById(id);
        if (!existingHotel) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Hotel not found",
            }, { status: 404 });
        }

        let imageUrls = existingHotel.images;
        
        // Handle image uploads
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file, index) => {
                if (file instanceof File) {
                    const existingImage = imageUrls[index];
                    const uploadedUrl = await ReplaceImage(file, existingImage || "", 1200, 800);
                    return uploadedUrl as string;
                }
                return imageUrls[index];
            });
            imageUrls = await Promise.all(uploadPromises);
            consoleManager.log("Hotel images updated:", imageUrls);
        }

        // Update hotel data
        const hotelData: any = {};
        if (name) hotelData.name = name.toString();
        if (category) hotelData.category = category.toString();
        if (description) hotelData.description = description.toString();

        // Location
        if (address || city || state || country || zipCode) {
            hotelData.location = {
                address: address?.toString() || existingHotel.location.address,
                city: city?.toString() || existingHotel.location.city,
                state: state?.toString() || existingHotel.location.state,
                country: country?.toString() || existingHotel.location.country,
                zipCode: zipCode?.toString() || existingHotel.location.zipCode,
            };
        }

        // Price Range
        if (startingPrice || currency) {
            hotelData.priceRange = {
                startingPrice: startingPrice ? Number(startingPrice) : existingHotel.priceRange.startingPrice,
                currency: currency?.toString() || existingHotel.priceRange.currency,
            };
        }

        if (rating) hotelData.rating = Number(rating);
        if (status) hotelData.status = status.toString();
        if (amenities) hotelData.amenities = amenities.toString().split(',').map(item => item.trim());
        if (rooms) hotelData.rooms = JSON.parse(rooms.toString());

        // Contact Info
        if (phone || email || website) {
            hotelData.contactInfo = {
                phone: phone?.toString() || existingHotel.contactInfo.phone,
                email: email?.toString() || existingHotel.contactInfo.email,
                website: website?.toString() || existingHotel.contactInfo.website,
            };
        }

        // Policies
        if (checkIn || checkOut || cancellation) {
            hotelData.policies = {
                checkIn: checkIn?.toString() || existingHotel.policies.checkIn,
                checkOut: checkOut?.toString() || existingHotel.policies.checkOut,
                cancellation: cancellation?.toString() || existingHotel.policies.cancellation,
            };
        }

        if (imageUrls.length > 0) hotelData.images = imageUrls;

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
        
        // Validate hotel exists
        const existingHotel = await HotelService.getHotelById(id);
        if (!existingHotel) {
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
