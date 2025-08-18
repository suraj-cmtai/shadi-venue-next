import AboutService from "@/app/api/services/aboutServices";
import { NextRequest, NextResponse } from "next/server";


// Initialize the service
AboutService.init();

// GET: Fetch about content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "About content ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const aboutContent = await AboutService.getAboutContentById(id);
    
    if (!aboutContent) {
      return NextResponse.json(
        {
          success: false,
          message: "About content not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "About content retrieved successfully",
      data: aboutContent,
    });
  } catch (error: any) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch about content",
        data: null,
      },
      { status: 500 }
    );
  }
}

// PUT: Update about content by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "About content ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if about content exists
    const existingAboutContent = await AboutService.getAboutContentById(id);
    if (!existingAboutContent) {
      return NextResponse.json(
        {
          success: false,
          message: "About content not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const updatedAboutContent = await AboutService.updateAboutContent(id, body);

    return NextResponse.json({
      success: true,
      message: "About content updated successfully",
      data: updatedAboutContent,
    });
  } catch (error: any) {
    console.error("Error updating about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update about content",
        data: null,
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete about content by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "About content ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if about content exists
    const existingAboutContent = await AboutService.getAboutContentById(id);
    if (!existingAboutContent) {
      return NextResponse.json(
        {
          success: false,
          message: "About content not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const result = await AboutService.deleteAboutContent(id);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    console.error("Error deleting about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete about content",
        data: null,
      },
      { status: 500 }
    );
  }
}