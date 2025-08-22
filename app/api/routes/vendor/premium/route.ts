import { NextResponse } from "next/server";
import VendorService from "../../../services/vendorServices";
import consoleManager from "../../../utils/consoleManager";

// GET /api/routes/hotel/premium
export async function GET() {
    try {
        const vendors = await VendorService.getPremiumVendors();
        consoleManager.log("Fetched premium vendors (flat route)");
        return NextResponse.json({
            statusCode: 200,
            message: "Premium vendors fetched successfully",
            data: vendors,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/vendor/premium:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}


