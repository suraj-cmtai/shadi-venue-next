import { NextResponse } from "next/server";
import HeroExtensionService from "../../../services/heroExtensionServices";

// GET: Fetch all active hero extension images
export async function GET() {
  try {
    const activeImages = await HeroExtensionService.getActiveImages();

    return NextResponse.json({
      success: true,
      data: activeImages,
      message: "Active hero extension images fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch active hero extension images"
    }, { status: 500 });
  }
}