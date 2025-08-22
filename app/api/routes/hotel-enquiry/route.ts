import { NextResponse } from "next/server";
import HotelEnquiryService from "../../services/hotelEnquiryService";

// GET /api/routes/vendor-enquiry - Get all hotel enquiries
export async function GET() {
  try {
    const enquiries = await HotelEnquiryService.getAllEnquiries();
    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Hotel enquiries fetched successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch hotel enquiries"
      },
      { status: 500 }
    );
  }
}

// POST /api/routes/vendor-enquiry - Create a new hotel enquiry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hotelName, city, status, authId } = body;

    if (!authId) {
      return NextResponse.json(
        {
          success: false,
          error: "authId is required"
        },
        { status: 400 }
      );
    }

    if (!hotelName || !city) {
      return NextResponse.json(
        {
          success: false,
          error: "hotelName and city are required"
        },
        { status: 400 }
      );
    }

    const enquiryData = {
      hotelName,
      city,
      status: status || "Pending",
      authId
    };

    const newEnquiry = await HotelEnquiryService.createEnquiry(enquiryData);
    
    return NextResponse.json({
      success: true,
      data: newEnquiry,
      message: "Hotel enquiry created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create hotel enquiry"
      },
      { status: 500 }
    );
  }
}