import { NextResponse } from "next/server";
import HeroExtensionService from "../../../services/heroExtensionServices";

// GET: Fetch hero extension image by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image ID is required"
      }, { status: 400 });
    }

    const image = await HeroExtensionService.getImageById(id);

    if (!image) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: image,
      message: "Hero extension image fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch hero extension image"
    }, { status: 500 });
  }
}

// PUT: Update hero extension image by ID
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedData = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image ID is required"
      }, { status: 400 });
    }

    // Check if image exists first
    const existingImage = await HeroExtensionService.getImageById(id);
    if (!existingImage) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image not found"
      }, { status: 404 });
    }

    // Validate image type if provided
    if (updatedData.type) {
      const validTypes = ['tall_left', 'main_center', 'bottom_left', 'center_bottom', 'top_right', 'far_right'];
      if (!validTypes.includes(updatedData.type)) {
        return NextResponse.json({
          success: false,
          message: "Invalid image type"
        }, { status: 400 });
      }
    }

    const updatedImage = await HeroExtensionService.updateImage(id, updatedData);

    return NextResponse.json({
      success: true,
      data: updatedImage,
      message: "Hero extension image updated successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update hero extension image"
    }, { status: 500 });
  }
}

// DELETE: Delete hero extension image by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image ID is required"
      }, { status: 400 });
    }

    // Check if image exists first
    const existingImage = await HeroExtensionService.getImageById(id);
    if (!existingImage) {
      return NextResponse.json({
        success: false,
        message: "Hero extension image not found"
      }, { status: 404 });
    }

    const result = await HeroExtensionService.deleteImage(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Hero extension image deleted successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to delete hero extension image"
    }, { status: 500 });
  }
}