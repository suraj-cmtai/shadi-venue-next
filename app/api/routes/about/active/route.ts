import { NextRequest, NextResponse } from "next/server";
import AboutService from "../../../services/aboutServices";


// Initialize the service
AboutService.init();

// GET: Fetch all active about content
export async function GET(request: NextRequest) {
  try {
    const activeAboutContent = await AboutService.getAllActiveAboutContent();
    
    return NextResponse.json({
      success: true,
      message: "Active about content retrieved successfully",
      data: activeAboutContent,
    });
  } catch (error: any) {
    console.error("Error fetching active about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch active about content",
        data: null,
      },
      { status: 500 }
    );
  }
}