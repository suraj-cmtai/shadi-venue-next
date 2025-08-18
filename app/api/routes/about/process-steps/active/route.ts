import AboutService from "@/app/api/services/aboutServices";
import { NextRequest, NextResponse } from "next/server";

// Initialize the service
AboutService.init();

// GET: Fetch all active process steps
export async function GET(request: NextRequest) {
  try {
    const activeProcessSteps = await AboutService.getAllActiveProcessSteps();
    
    return NextResponse.json({
      success: true,
      message: "Active process steps retrieved successfully",
      data: activeProcessSteps,
    });
  } catch (error: any) {
    console.error("Error fetching active process steps:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch active process steps",
        data: null,
      },
      { status: 500 }
    );
  }
}