import BanquetEnquiryService from "@/app/api/services/banquetEnquiryServices";
import { NextResponse } from "next/server";

// GET /api/routes/banquet-enquiry/banquet/[authId] - Get banquet enquiries by authId (premium banquets only)
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

    const enquiries = await BanquetEnquiryService.getEnquiryByAuthId(authId);
    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Banquet enquiries fetched successfully for premium banquet"
    });
  } catch (error: any) {
    // Handle specific error cases
    if (error.message === "Banquet not found for the provided authId.") {
      return NextResponse.json(
        {
          success: false,
          error: "Banquet not found",
        },
        { status: 404 }
      );
    }

    if (error.message === "Access denied: Banquet is not premium.") {
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
        error: error.message || "Failed to fetch banquet enquiries",
      },
      { status: 500 }
    );
  }
}