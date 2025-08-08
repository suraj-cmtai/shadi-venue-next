import { NextResponse } from "next/server";
import UserService from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";

// Update invite data
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const inviteData = await req.json();
        const { id } = await params;
        
        const updatedUser = await UserService.updateInvite(id, inviteData);

        return NextResponse.json({
            statusCode: 200,
            message: "Invite updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error updating invite:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}