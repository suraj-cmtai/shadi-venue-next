import { NextResponse } from "next/server";
import BanquetService from "../../../services/banquetServices";
import consoleManager from "../../../utils/consoleManager";

// Get all premium banquets (GET)
export async function GET(req: Request) {
    try {
        const banquets = await BanquetService.getPremiumBanquets();
        
        consoleManager.log("Fetched premium banquets, count:", banquets.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Premium banquets fetched successfully",
            data: banquets,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/banquet/premium:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}