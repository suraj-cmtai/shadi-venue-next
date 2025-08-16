import { NextRequest, NextResponse } from "next/server";
import TestimonialService from "../../../services/testimonialServices";

// GET: Fetch all active testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') !== 'false'; // Default to true
    
    const activeTestimonials = await TestimonialService.getAllActiveTestimonials(forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: activeTestimonials,
      message: "Active testimonials fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch active testimonials"
    }, { status: 500 });
  }
}