import { NextResponse } from "next/server";
import HeroExtensionService from "../../../services/heroExtensionServices";

// GET: Fetch hero extension content
export async function GET() {
  try {
    const content = await HeroExtensionService.getContent();

    return NextResponse.json({
      success: true,
      data: content,
      message: "Hero extension content fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch hero extension content"
    }, { status: 500 });
  }
}

// POST: Create or update hero extension content
export async function POST(req: Request) {
  try {
    const contentData = await req.json();
    
    // Validate required fields
    if (!contentData.title || !contentData.subtitle) {
      return NextResponse.json({
        success: false,
        message: "Title and subtitle are required"
      }, { status: 400 });
    }

    const content = await HeroExtensionService.upsertContent(contentData);

    return NextResponse.json({
      success: true,
      data: content,
      message: "Hero extension content saved successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to save hero extension content"
    }, { status: 500 });
  }
}