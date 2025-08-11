import { NextResponse } from "next/server";
import AuthService from "../../../services/authManager";
import consoleManager from "../../../utils/consoleManager";

// Get a specific auth entry (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const auth = await AuthService.getAuthById(id);

        if (!auth) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Auth entry not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            statusCode: 200,
            message: "Auth entry fetched successfully",
            data: auth,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update auth status (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const status = formData.get("status")?.toString();

        if (!status) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Status is required",
            }, { status: 400 });
        }

        const updatedAuth = await AuthService.updateAuthStatus(id, status as "active" | "inactive");

        return NextResponse.json({
            statusCode: 200,
            message: "Auth status updated successfully",
            data: updatedAuth,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete auth entry (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await AuthService.deleteAuth(id);

        return NextResponse.json({
            statusCode: 200,
            message: "Auth entry deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
