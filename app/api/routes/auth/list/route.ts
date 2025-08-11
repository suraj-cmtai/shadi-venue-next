import { NextResponse } from "next/server";

import AuthService from "@/app/api/services/authManager";
import consoleManager from "@/app/api/utils/consoleManager";

// Get all auth entries (GET)
export async function GET(req: Request) {
    try {
        const authList = await AuthService.getAllAuth();

        return NextResponse.json({
            statusCode: 200,
            message: "Auth list fetched successfully",
            data: authList,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/auth/list:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
