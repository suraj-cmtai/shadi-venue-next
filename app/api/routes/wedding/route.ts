import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import WeddingService from "../../services/weddingServices";
import consoleManager from "../../utils/consoleManager";

// Get all weddings (GET)
export async function GET(req: Request) {
    try {
        // Fetch weddings based on status filter
        const weddings = await WeddingService.getAllWeddings();
        consoleManager.log("Fetched all weddings:", weddings.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Weddings fetched successfully",
            data: weddings,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in GET /api/wedding:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new wedding (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const coupleNames = formData.get("coupleNames");
        const location = formData.get("location");
        const photoCount = formData.get("photoCount");
        const weddingDate = formData.get("weddingDate");
        const theme = formData.get("theme");
        const description = formData.get("description");
        const status = formData.get("status") || "active";
        
        // Image files
        const mainImage = formData.get("mainImage");
        const thumbnail1 = formData.get("thumbnail1");
        const thumbnail2 = formData.get("thumbnail2");
        const galleryImages = formData.getAll("galleryImages");

        if (!coupleNames || !mainImage) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Couple names and main image are required",
            }, { status: 400 });
        }

        // Upload images to Firebase Storage
        const mainImageUrl = await UploadImage(mainImage, 800, 600);
        const thumbnail1Url = thumbnail1 ? await UploadImage(thumbnail1, 400, 300) : "";
        const thumbnail2Url = thumbnail2 ? await UploadImage(thumbnail2, 400, 300) : "";
        
        // Upload gallery images
        const galleryUrls = [];
        for (const galleryImage of galleryImages) {
            if (galleryImage instanceof File) {
                const galleryUrl = await UploadImage(galleryImage, 600, 400);
                galleryUrls.push(galleryUrl);
            }
        }

        consoleManager.log("✅ Wedding images uploaded:", {
            main: mainImageUrl,
            thumbnail1: thumbnail1Url,
            thumbnail2: thumbnail2Url,
            gallery: galleryUrls
        });

        // Save wedding data in Firestore
        const newWedding = await WeddingService.addWedding({
            coupleNames,
            location,
            photoCount: parseInt(photoCount as string) || 0,
            weddingDate,
            theme,
            description,
            status,
            images: {
                main: mainImageUrl,
                thumbnail1: thumbnail1Url,
                thumbnail2: thumbnail2Url,
                gallery: galleryUrls
            }
        });

        consoleManager.log("✅ Wedding created successfully:", newWedding);

        return NextResponse.json({
            statusCode: 201,
            message: "Wedding added successfully",
            data: newWedding,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("❌ Error in POST /api/wedding:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

