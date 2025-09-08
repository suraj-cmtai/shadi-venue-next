import { NextResponse } from "next/server";
import BanquetEnquiryService from "../../services/banquetEnquiryServices";

// GET /api/routes/banquet-enquiry - Get all banquet enquiries
export async function GET() {
  try {
    const enquiries = await BanquetEnquiryService.getAllEnquiries();
    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Banquet enquiries fetched successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch banquet enquiries",
      },
      { status: 500 }
    );
  }
}

// POST /api/routes/banquet-enquiry - Create new banquet enquiry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, status, authId, message } = body;

    if (!name || !phoneNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields:  email, phoneNumber, are required",
        },
        { status: 400 }
      );
    }

    const enquiryData = {
      name,
      email : email || "", // Optional field
      phoneNumber,
      status,
      authId,
      message: message || ""
    };

    const newEnquiry = await BanquetEnquiryService.createEnquiry(enquiryData);
    return NextResponse.json(
      {
        success: true,
        data: newEnquiry,
        message: "Banquet enquiry created successfully"
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create banquet enquiry",
      },
      { status: 500 }
    );
  }
}