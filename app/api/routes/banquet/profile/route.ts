import { NextResponse } from "next/server";
import HotelService, { Hotel } from "../../../services/hotelServices";
import { UploadImage } from "../../../controller/imageController";
import consoleManager from "../../../utils/consoleManager";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const hotel = await HotelService.getHotelById(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotel profile fetched successfully",
            data: hotel,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/hotel/profile:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const formData = await req.formData();
        const { id } = await params;

        // Extract basic info
        const name = formData.get("name")?.toString();
        const description = formData.get("description")?.toString();
        const address = formData.get("address")?.toString();
        const city = formData.get("city")?.toString();
        const state = formData.get("state")?.toString();
        const country = formData.get("country")?.toString() || "India";
        const zipCode = formData.get("zipCode")?.toString();
        const phone = formData.get("phone")?.toString();
        const email = formData.get("email")?.toString();
        const website = formData.get("website")?.toString();
        const file = formData.get("images");

        let imageUrl: string | null = null;
        if (file && file instanceof File) {
            const uploadedUrl = await UploadImage(file, 800, 600); // Using standard dimensions for hotel images
            if (typeof uploadedUrl === 'string') {
                imageUrl = uploadedUrl;
            }
        }

        const updateData: Partial<Hotel> = {};

        if (name) updateData.name = name;
        if (description) updateData.description = description;

        // Update location if any location field is provided
        if (address || city || state || country || zipCode) {
            updateData.location = {
                address: address || "",
                city: city || "",
                state: state || "",
                country: country || "India",
                zipCode: zipCode || ""
            };
        }

        // Update contact info if any contact field is provided
        if (phone || email || website) {
            updateData.contactInfo = {
                phone: phone || "",
                email: email || "",
                ...(website && { website })
            };
        }

        // Update images if new image is uploaded
        if (imageUrl) {
            updateData.images = updateData.images ? [...updateData.images, imageUrl] : [imageUrl];
        }

        const updatedHotel = await HotelService.updateHotel(id, updateData);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotel profile updated successfully",
            data: updatedHotel,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PATCH /api/routes/hotel/profile:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}