import { NextResponse } from "next/server";
import WeddingService from "../../../services/weddingServices";
import consoleManager from "../../../utils/consoleManager";
import { UploadImage } from "@/app/api/controller/imageController";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const wedding = await WeddingService.getWeddingById(id);
        return NextResponse.json({
            statusCode: 200,
            message: "Wedding fetched successfully",
            data: wedding,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in GET /api/wedding/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await req.formData();
    const coupleNames = formData.get("coupleNames");
    const location = formData.get("location");
    const photoCount = formData.get("photoCount");
    const weddingDate = formData.get("weddingDate");
    const theme = formData.get("theme");
    const description = formData.get("description");
    const status = formData.get("status");
    
    // Image files
    const mainImage = formData.get("mainImage");
    const thumbnail1 = formData.get("thumbnail1");
    const thumbnail2 = formData.get("thumbnail2");
    const galleryImages = formData.getAll("galleryImages");

    if (!coupleNames) {
        return NextResponse.json({
            statusCode: 400,
            errorCode: "BAD_REQUEST",
            errorMessage: "Couple names are required",
        }, { status: 400 });
    }

    // Get existing wedding data to preserve images if not updated
    const existingWedding = await WeddingService.getWeddingById(id);
    if (!existingWedding) {
        return NextResponse.json({
            statusCode: 404,
            errorCode: "NOT_FOUND",
            errorMessage: "Wedding not found",
        }, { status: 404 });
    }

    let mainImageUrl = existingWedding.images?.main || "";
    let thumbnail1Url = existingWedding.images?.thumbnail1 || "";
    let thumbnail2Url = existingWedding.images?.thumbnail2 || "";
    let galleryUrls: string[] = existingWedding.images?.gallery || [];

    // Handle image uploads - only update if new files are provided
    if (mainImage instanceof File) {
        mainImageUrl = await UploadImage(mainImage, 800, 600) as string;
        consoleManager.log("✅ Wedding main image uploaded:", mainImageUrl);
    }

    if (thumbnail1 instanceof File) {
        thumbnail1Url = await UploadImage(thumbnail1, 400, 300) as string;
    }

    if (thumbnail2 instanceof File) {
        thumbnail2Url = await UploadImage(thumbnail2, 400, 300) as string;
    }

    // Handle gallery images - append new ones to existing gallery
    for (const galleryImage of galleryImages) {
        if (galleryImage instanceof File) {
            const galleryUrl = await UploadImage(galleryImage, 600, 400) as string;
            galleryUrls.push(galleryUrl);
        }
    }

    try {
        const updatedWedding = await WeddingService.updateWedding(id, {
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
        return NextResponse.json({
            statusCode: 200,
            message: "Wedding updated successfully",
            data: updatedWedding,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in PUT /api/wedding/[id]:", error);
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
        await WeddingService.deleteWedding(id);
        return NextResponse.json({
            statusCode: 200,
            message: "Wedding deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in DELETE /api/wedding/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
