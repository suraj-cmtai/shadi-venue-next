import { NextResponse } from "next/server";
import GalleryService from "../../../services/galleryServices";
import consoleManager from "../../../utils/consoleManager";
import { UploadImage } from "@/app/api/controller/imageController";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const gallery = await GalleryService.getGalleryById(id);
        return NextResponse.json({
            statusCode: 200,
            message: "Gallery fetched successfully",
            data: gallery,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in GET /api/gallery/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;    const formData = await req.formData();
    const title = formData.get("title");
    const image = formData.get("image");
    const category = formData.get("category");
    const description = formData.get("description");
    const status = formData.get("status");

    if (!title || !image) {
        return NextResponse.json({
            statusCode: 400,
            errorCode: "BAD_REQUEST",
            errorMessage: "Title and image are required",
        }, { status: 400 });
    }
     let imageUrlLink = "";

if (image instanceof File) {
    imageUrlLink = await UploadImage(image, 800, 600) as string; // Upload image to Firebase Storage (800x600 for galleries)
    consoleManager.log("✅ Gallery image uploaded:", imageUrlLink);
} else {
    imageUrlLink = image as string; // If image is not a File, assume it's a URL
}

    try {
        const updatedGallery = await GalleryService.updateGallery(id, {
            title,
            image: imageUrlLink,
            category,
            description,
            status
        });
        return NextResponse.json({
            statusCode: 200,
            message: "Gallery updated successfully",
            data: updatedGallery,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in PUT /api/gallery/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        await GalleryService.deleteGallery(id);
        return NextResponse.json({
            statusCode: 200,
            message: "Gallery deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in DELETE /api/gallery/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}   