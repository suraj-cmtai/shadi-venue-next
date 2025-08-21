import { NextResponse } from "next/server";
import HotelService from "../../../services/hotelServices";
import consoleManager from "../../../utils/consoleManager";

// GET /api/routes/hotel/premium
export async function GET() {
    try {
        const hotels = await HotelService.getPremiumHotels();
        consoleManager.log("Fetched premium hotels (flat route)");
        return NextResponse.json({
            statusCode: 200,
            message: "Premium hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/hotel/premium:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}


