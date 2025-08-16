import { NextRequest, NextResponse } from "next/server";
import HeroService from "../../../services/heroServices";

// GET: Fetch hero slide by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Hero slide ID is required"
      }, { status: 400 });
    }

    const heroSlide = await HeroService.getHeroSlideById(id);

    if (!heroSlide) {
      return NextResponse.json({
        success: false,
        message: "Hero slide not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: heroSlide,
      message: "Hero slide fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch hero slide"
    }, { status: 500 });
  }
}

// PUT: Update hero slide by ID
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
        message: "Hero slide ID is required"
      }, { status: 400 });
    }

    // Check if hero slide exists first
    const existingHero = await HeroService.getHeroSlideById(id);
    if (!existingHero) {
      return NextResponse.json({
        success: false,
        message: "Hero slide not found"
      }, { status: 404 });
    }

    const updatedHeroSlide = await HeroService.updateHeroSlide(id, updatedData);

    return NextResponse.json({
      success: true,
      data: updatedHeroSlide,
      message: "Hero slide updated successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update hero slide"
    }, { status: 500 });
  }
}

// DELETE: Delete hero slide by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Hero slide ID is required"
      }, { status: 400 });
    }

    // Check if hero slide exists first
    const existingHero = await HeroService.getHeroSlideById(id);
    if (!existingHero) {
      return NextResponse.json({
        success: false,
        message: "Hero slide not found"
      }, { status: 404 });
    }

    const result = await HeroService.deleteHeroSlide(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Hero slide deleted successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to delete hero slide"
    }, { status: 500 });
  }
}