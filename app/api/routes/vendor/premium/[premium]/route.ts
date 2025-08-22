import { NextResponse } from "next/server";
import VendorService from "../../../../services/vendorServices";
import consoleManager from "../../../../utils/consoleManager";

// Backward-compatible handler; ignores the dynamic segment and returns premium vendors
export async function GET(req: Request) {
    try {
        const vendors = await VendorService.getPremiumVendors();
        consoleManager.log("Fetched premium vendors (dynamic path - deprecated)");
        return NextResponse.json({
            statusCode: 200,
            message: "Vendors fetched successfully",
            data: vendors,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/vendor/premium/[premium] (deprecated):", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
