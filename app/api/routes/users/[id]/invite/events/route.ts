import { NextResponse } from "next/server";
import UserService from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";

// Update wedding events
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { eventData, eventIndex } = await req.json();
        const { id } = await params;
        
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