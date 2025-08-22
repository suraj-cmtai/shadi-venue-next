import { NextResponse } from "next/server";
import VendorEnquiryService from "../../services/vendorEnqiuryService";

// GET /api/routes/vendor-enquiry - Get all vendor enquiries
export async function GET() {
  try {
    const enquiries = await VendorEnquiryService.getAllEnquiries();
    return NextResponse.json({
      success: true,
      data: enquiries,
      message: "Vendor enquiries fetched successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch vendor enquiries",
      },
      { status: 500 }
    );
  }
}

// POST /api/routes/vendor-enquiry - Create new vendor enquiry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phoneNumber, status, authId } = body;

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
    };

    const newEnquiry = await VendorEnquiryService.createEnquiry(enquiryData);
    return NextResponse.json(
      {
        success: true,
        data: newEnquiry,
        message: "Vendor enquiry created successfully"
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create vendor enquiry",
      },
      { status: 500 }
    );
  }
}