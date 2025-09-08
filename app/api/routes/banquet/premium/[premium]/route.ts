import { NextResponse } from "next/server";
import HotelService from "../../../../services/hotelServices";
import consoleManager from "../../../../utils/consoleManager";

// Backward-compatible handler; ignores the dynamic segment and returns premium hotels
export async function GET(req: Request) {
    try {
        const hotels = await HotelService.getPremiumHotels();
        consoleManager.log("Fetched premium hotels (dynamic path - deprecated)");
        return NextResponse.json({
            statusCode: 200,
            message: "Hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/hotel/premium/[premium] (deprecated):", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
