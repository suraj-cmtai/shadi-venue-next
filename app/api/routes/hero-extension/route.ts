import { NextResponse } from "next/server";
import HeroExtensionService from "../../services/heroExtensionServices";

// GET: Fetch all hero extension images
export async function GET() {
  try {
    const images = await HeroExtensionService.getAllImages();

    return NextResponse.json({
      success: true,
      data: images,
      message: "Hero extension images fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch hero extension images"
    }, { status: 500 });
  }
}

// POST: Create new hero extension image
export async function POST(req: Request) {
  try {
    const imageData = await req.json();
    
    // Validate required fields
    if (!imageData.type || !imageData.imageUrl || !imageData.altText) {
      return NextResponse.json({
        success: false,
        message: "Type, image URL, and alt text are required"
      }, { status: 400 });
    }

    // Validate image type
    const validTypes = ['tall_left', 'main_center', 'bottom_left', 'center_bottom', 'top_right', 'far_right'];
    if (!validTypes.includes(imageData.type)) {
      return NextResponse.json({
        success: false,
        message: "Invalid image type"
      }, { status: 400 });
    }

    const newImage = await HeroExtensionService.createImage(imageData);

    return NextResponse.json({
      success: true,
      data: newImage,
      message: "Hero extension image created successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to create hero extension image"
    }, { status: 500 });
  }
}