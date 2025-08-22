import { NextResponse } from "next/server";
import vendorService from "../../../services/vendorServices";
import consoleManager from "../../../utils/consoleManager";

// Get all active hotels (GET)
export async function GET(req: Request) {
    try {
        const hotels = await vendorService.getActiveVendors();
        
        consoleManager.log("Fetched active hotels");

        return NextResponse.json({
            statusCode: 200,
            message: "Active hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/hotel/active:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
