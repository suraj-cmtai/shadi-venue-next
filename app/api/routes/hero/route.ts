import { NextRequest, NextResponse } from "next/server";
import HeroService from "../../services/heroServices";

// GET: Fetch all hero slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    const heroSlides = await HeroService.getAllHeroSlides(forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: heroSlides,
      message: "Hero slides fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch hero slides"
    }, { status: 500 });
  }
}

// POST: Add a new hero slide
export async function POST(request: NextRequest) {
  try {
    const heroData = await request.json();
    
    // Validate required fields
    if (!heroData.heading || !heroData.image) {
      return NextResponse.json({
        success: false,
        message: "Heading and image are required"
      }, { status: 400 });
    }
    
    const newHeroSlide = await HeroService.addHeroSlide(heroData);
    
    return NextResponse.json({
      success: true,
      data: newHeroSlide,
      message: "Hero slide added successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to add hero slide"
    }, { status: 500 });
  }
}