import VendorEnquiryService from "@/app/api/services/vendorEnqiuryService";
import { NextResponse } from "next/server";

// GET /api/routes/vendor-enquiry/[id] - Get vendor enquiry by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Enquiry ID is required",
        },
        { status: 400 }
      );
    }

    const enquiry = await VendorEnquiryService.getEnquiryById(id);

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          error: "Vendor enquiry not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
      message: "Vendor enquiry fetched successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch vendor enquiry",
      },
      { status: 500 }
    );
  }
}

// PUT /api/routes/vendor-enquiry/[id] - Update vendor enquiry by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Enquiry ID is required",
        },
        { status: 400 }
      );
    }

    const { name, email, phoneNumber, status } = body;
    const updateData = { name, email, phoneNumber, status };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one field (name, email, phoneNumber, status) is required for update",
        },
        { status: 400 }
      );
    }

    const updatedEnquiry = await VendorEnquiryService.updateEnquiry(id, updateData);
    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
      message: "Vendor enquiry updated successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update vendor enquiry",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/vendor-enquiry/[id] - Delete vendor enquiry by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Enquiry ID is required",
        },
        { status: 400 }
      );
    }

    const result = await VendorEnquiryService.deleteEnquiry(id);
    return NextResponse.json({
      success: true,
      data: result,
      message: "Vendor enquiry deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete vendor enquiry",
      },
      { status: 500 }
    );
  }
}