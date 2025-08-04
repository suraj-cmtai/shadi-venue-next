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

        // Validate required fields
        if (!name || !category || !description || !address || !city || !state || 
            !country || !startingPrice || !currency || !rooms || !phone || !email) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Missing required fields",
            }, { status: 400 });
        }

        // Upload images
        const imageUrls: string[] = [];
        if (files && files.length > 0) {
            const uploadPromises = files.map(async (file) => {
                if (file instanceof File) {
                    const uploadedUrl = await UploadImage(file, 1200, 800);
                    return uploadedUrl as string;
                }
                return null;
            });
            const urls = await Promise.all(uploadPromises);
            imageUrls.push(...urls.filter(Boolean) as string[]);
        }

        // Create hotel data
        const hotelData = {
            name: name.toString(),
            category: category.toString(),
            description: description.toString(),
            location: {
                address: address.toString(),
                city: city.toString(),
                state: state.toString(),
                country: country.toString(),
                zipCode: zipCode?.toString() || "",
            },
            priceRange: {
                startingPrice: Number(startingPrice),
                currency: currency.toString() as Currency,
            },
            rating: rating ? Number(rating) : 0,
            status: (status?.toString() || "draft") as HotelStatus,
            amenities: amenities ? amenities.toString().split(',').map(item => item.trim()) : [],
            rooms: JSON.parse(rooms.toString()),
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
