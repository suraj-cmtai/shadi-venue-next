import { NextResponse } from "next/server";
import UserService from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";

// Update invite theme
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { theme } = await req.json();
        const { id } = await params;
        
        await UserService.updateInviteTheme(id, theme);
        const updatedUser = await UserService.getUserById(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Invite theme updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error updating invite theme:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}