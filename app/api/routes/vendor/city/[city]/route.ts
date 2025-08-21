import { NextResponse } from "next/server";
import HotelService from "../../../../services/hotelServices";
import consoleManager from "../../../../utils/consoleManager";

// Get hotels by city (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ city: string }> }
) {
    try {
        const { city } = await params;
        const hotels = await HotelService.getHotelsByCity(city);

        consoleManager.log("Fetched hotels for city:", city);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/hotel/city/[city]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
