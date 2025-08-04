import { NextResponse } from "next/server";
import HotelService from "../../../../services/hotelServices";
import consoleManager from "../../../../utils/consoleManager";

// Get hotels by category (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const { category } = await params;
        const hotels = await HotelService.getHotelsByCategory(category);

        consoleManager.log("Fetched hotels for category:", category);

        return NextResponse.json({
            statusCode: 200,
            message: "Hotels fetched successfully",
            data: hotels,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/hotel/category/[category]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
