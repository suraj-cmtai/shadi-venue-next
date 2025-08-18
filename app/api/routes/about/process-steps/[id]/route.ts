import AboutService from "@/app/api/services/aboutServices";
import { NextRequest, NextResponse } from "next/server";

// Initialize the service
AboutService.init();

// GET: Fetch process step by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    const processStep = await AboutService.getProcessStepById(id);

    if (!processStep) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step not found",
          data: null,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Process step retrieved successfully",
      data: processStep,
    });
  } catch (error: any) {
    console.error("Error fetching process step:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch process step",
        data: null,
      },
      { status: 500 }
    );
  }
}

// PUT: Update process step by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if process step exists
    const existingProcessStep = await AboutService.getProcessStepById(id);
    if (!existingProcessStep) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const updatedProcessStep = await AboutService.updateProcessStep(id, body);

    return NextResponse.json({
      success: true,
      message: "Process step updated successfully",
      data: updatedProcessStep,
    });
  } catch (error: any) {
    console.error("Error updating process step:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update process step",
        data: null,
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete process step by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step ID is required",
          data: null,
        },
        { status: 400 }
      );
    }

    // Check if process step exists
    const existingProcessStep = await AboutService.getProcessStepById(id);
    if (!existingProcessStep) {
      return NextResponse.json(
        {
          success: false,
          message: "Process step not found",
          data: null,
        },
        { status: 404 }
      );
    }

    const result = await AboutService.deleteProcessStep(id);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: null,
    });
  } catch (error: any) {
    console.error("Error deleting process step:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete process step",
        data: null,
      },
      { status: 500 }
    );
  }
}