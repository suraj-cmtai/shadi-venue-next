import { NextResponse } from "next/server";
import WeddingService from "../../../services/weddingServices";
import consoleManager from "../../../utils/consoleManager";

// Get all active weddings (GET)
export async function GET(req: Request) {
    try {
        // Fetch only active weddings
        const activeWeddings = await WeddingService.getAllActiveWeddings();
        consoleManager.log("Fetched active weddings:", activeWeddings.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Active weddings fetched successfully",
            data: activeWeddings,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("❌ Error in GET /api/wedding/active:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

