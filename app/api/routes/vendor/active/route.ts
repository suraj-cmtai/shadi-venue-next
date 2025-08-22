import { NextResponse } from "next/server";
import VendorService from "../../../services/vendorServices";
import consoleManager from "../../../utils/consoleManager";

// Get all active vendors (GET)
export async function GET(req: Request) {
    try {
        // Debug: Check total vendor count first
        const totalCount = await VendorService.getVendorCount();
        consoleManager.log(`Total vendors in database: ${totalCount}`);
        
        const vendors = await VendorService.getActiveVendors();
        
        consoleManager.log(`Fetched ${vendors.length} active vendors`);

        return NextResponse.json({
            statusCode: 200,
            message: "Active vendors fetched successfully",
            data: vendors,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/vendor/active:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
