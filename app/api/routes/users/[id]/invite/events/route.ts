import { NextResponse } from "next/server";
import UserService, { WeddingEvent } from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";
import { UploadImage } from "@/app/api/controller/imageController";

// Update wedding events
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const formData = await req.formData();
        const { id } = await params;
        const eventIndex = formData.get("eventIndex") ? parseInt(formData.get("eventIndex") as string) : undefined;

        // Process event data
        const eventImage = formData.get("image");
        let imageUrl: string | null = null;

        // Upload image if provided
        if (eventImage && eventImage instanceof File) {
            const uploadedUrl = await UploadImage(eventImage, 1200, 800);
            if (typeof uploadedUrl === 'string') {
                imageUrl = uploadedUrl;
                consoleManager.log("Event image uploaded:", imageUrl);
            }
        } else {
            imageUrl = formData.get("imageUrl")?.toString() || null;
        }

        const eventData: WeddingEvent = {
            title: formData.get("title")?.toString() || "",
            date: formData.get("date")?.toString() || new Date().toISOString(),
            time: formData.get("time")?.toString() || "",
            venue: formData.get("venue")?.toString() || "",
            description: formData.get("description")?.toString() || "",
            image: imageUrl
        };
        
        await UserService.updateWeddingEvent(id, eventData, eventIndex);
        const updatedUser = await UserService.getUserById(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Wedding event updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error updating wedding event:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete wedding event
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; index: string }> }
) {
    try {
        const { id, index } = await params;
        
        await UserService.deleteWeddingEvent(id, parseInt(index));
        const updatedUser = await UserService.getUserById(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Wedding event deleted successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error deleting wedding event:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}