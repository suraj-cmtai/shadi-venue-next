import VendorEnquiryService from "@/app/api/services/vendorEnqiuryService";
import { NextResponse } from "next/server";

// GET /api/routes/vendor-enquiry/vendor/[authId] - Get vendor enquiries by authId (premium vendors only)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ authId: string }> }
) {
  try {
    const { authId } = await params;

    if (!authId) {
      return NextResponse.json(
        {
          success: false,
          error: "AuthId is required",
        },
        { status: 400 }
      );
    }

    const enquiries = await VendorEnquiryService.getEnquiryByAuthId(authId);
    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Vendor enquiries fetched successfully for premium vendor"
    });
  } catch (error: any) {
    // Handle specific error cases
    if (error.message === "Vendor not found for the provided authId.") {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor not found",
        },
        { status: 404 }
      );
    }

    if (error.message === "Access denied: Vendor is not premium.") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied: Premium subscription required to access enquiries",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch vendor enquiries",
      },
      { status: 500 }
    );
  }
}