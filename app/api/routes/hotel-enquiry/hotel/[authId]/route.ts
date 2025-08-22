import { NextResponse } from "next/server";
import HotelEnquiryService from "../../../../services/hotelEnquiryService";

// GET /api/routes/vendor-enquiry/vendor/[authId] - Get hotel enquiries for a specific premium hotel
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
          error: "authId is required"
        },
        { status: 400 }
      );
    }

    const enquiries = await HotelEnquiryService.getEnquiryByAuthId(authId);

    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Hotel enquiries fetched successfully for premium hotel"
    });
  } catch (error: any) {
    // Handle specific error cases
    if (error.message === "Hotel not found for the provided authId.") {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel not found"
        },
        { status: 404 }
      );
    }

    if (error.message === "Access denied: Hotel is not premium.") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied: Only premium hotels can access enquiries"
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch hotel enquiries"
      },
      { status: 500 }
    );
  }
}