import { NextRequest, NextResponse } from "next/server";
import HeroService from "../../../services/heroServices";

// GET: Fetch all active hero slides
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') !== 'false'; // Default to true
    
    const activeHeroSlides = await HeroService.getAllActiveHeroSlides(forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: activeHeroSlides,
      message: "Active hero slides fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch active hero slides"
    }, { status: 500 });
  }
}