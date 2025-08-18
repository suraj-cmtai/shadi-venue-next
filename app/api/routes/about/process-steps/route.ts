import { NextRequest, NextResponse } from "next/server";
import AboutService from "../../../services/aboutServices";

// Initialize the service
AboutService.init();

// GET: Fetch all process steps
export async function GET(request: NextRequest) {
  try {
    const processSteps = await AboutService.getAllProcessSteps();
    
    return NextResponse.json({
      success: true,
      message: "Process steps retrieved successfully",
      data: processSteps,
    });
  } catch (error: any) {
    console.error("Error fetching process steps:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch process steps",
        data: null,
      },
      { status: 500 }
    );
  }
}

// POST: Create new process step
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, description, icon, order } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const newProcessStep = await AboutService.addProcessStep({
      title,
      description,
      icon: icon || "",
      bgColor: body.bgColor || "bg-white border border-[#212d47] text-black",
      titleColor: body.titleColor || "text-[#212d47]",
      order: order || 1,
      status: body.status || "active",
    });

    return NextResponse.json({
      success: true,
      message: "Process step created successfully",
      data: newProcessStep,
    });
  } catch (error: any) {
    console.error("Error creating process step:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create process step",
        data: null,
      },
      { status: 500 }
    );
  }
}