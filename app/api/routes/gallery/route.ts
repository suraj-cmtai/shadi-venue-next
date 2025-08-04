import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import GalleryService from "../../services/galleryServices";
import consoleManager from "../../utils/consoleManager";

// Get all packages (GET)
export async function GET(req: Request) {
    try {

        // Fetch packages based on status filter
        const galleries = await GalleryService.getAllGalleries();
        consoleManager.log("Fetched all galleries:", galleries.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Galleries fetched successfully",
            data: galleries,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in GET /api/gallery:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new package (POST)
export async function POST(req: Request) {    try {
        const formData = await req.formData();
        const title = formData.get("title");
        const file = formData.get("image");
        const category = formData.get("category");
        const description = formData.get("description");
        const status = formData.get("status") || "active";

        if (!title || !file) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Title and image are required",
            }, { status: 400 });
        }

        // Upload image to Firebase Storage (800x600 for galleries)
        const imageUrl = await UploadImage(file, 800, 600);
        consoleManager.log("✅ Gallery image uploaded:", imageUrl);        // Save gallery data in Firestore
        const newGallery = await GalleryService.addGallery({
            title,
            image: imageUrl,
            category,
            description,
            status,
        });

        consoleManager.log("✅ Gallery created successfully:", newGallery);

        return NextResponse.json({
            statusCode: 201,
            message: "Gallery added successfully",
            data: newGallery,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("❌ Error in POST /api/gallery:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
