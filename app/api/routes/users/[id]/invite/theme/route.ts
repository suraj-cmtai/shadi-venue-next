import { NextResponse } from "next/server";
import UserService from "@/app/api/services/userServices";
import consoleManager from "@/app/api/utils/consoleManager";

// PATCH /api/routes/users/[id]/invite/theme
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // The thunk expects: { theme }
        const { theme } = body;

        // Update the invite theme for the user
        await UserService.updateInviteTheme(id, theme);

        // Fetch the updated user
        const updatedUser = await UserService.getUserById(id);

        // The thunk expects statusCode 200 and data
        return NextResponse.json(
            {
                statusCode: 200,
                data: updatedUser,
            },
            { status: 200 }
        );
    } catch (error: any) {
        consoleManager.error("Error updating invite theme:", error);
        return NextResponse.json(
            {
                statusCode: 500,
                errorMessage: error.message || "Failed to update invite theme",
            },
            { status: 500 }
        );
    }
}