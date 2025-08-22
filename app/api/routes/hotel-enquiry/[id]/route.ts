import { NextResponse } from "next/server";
import HotelEnquiryService from "../../../services/hotelEnquiryService";

// GET /api/routes/vendor-enquiry/[id] - Get a specific hotel enquiry by ID
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
          error: "Enquiry ID is required"
        },
        { status: 400 }
      );
    }

    const enquiry = await HotelEnquiryService.getEnquiryById(id);

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          error: "Hotel enquiry not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enquiry,
      message: "Hotel enquiry fetched successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch hotel enquiry"
      },
      { status: 500 }
    );
  }
}

// PUT /api/routes/vendor-enquiry/[id] - Update a specific hotel enquiry
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
          error: "Enquiry ID is required"
        },
        { status: 400 }
      );
    }

    // Extract allowed update fields (excluding id, createdAt, authId)
    const { hotelName, city, status } = body;
    const updateData: any = {};

    if (hotelName !== undefined) updateData.hotelName = hotelName;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) {
      if (!["Pending", "Contacted", "Closed"].includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid status. Must be 'Pending', 'Contacted', or 'Closed'"
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid fields to update"
        },
        { status: 400 }
      );
    }

    const updatedEnquiry = await HotelEnquiryService.updateEnquiry(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedEnquiry,
      message: "Hotel enquiry updated successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update hotel enquiry"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/vendor-enquiry/[id] - Delete a specific hotel enquiry
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
          error: "Enquiry ID is required"
        },
        { status: 400 }
      );
    }

    const result = await HotelEnquiryService.deleteEnquiry(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Hotel enquiry deleted successfully"
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete hotel enquiry"
      },
      { status: 500 }
    );
  }
}