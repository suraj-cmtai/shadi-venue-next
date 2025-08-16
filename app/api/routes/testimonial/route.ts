import { NextRequest, NextResponse } from "next/server";
import TestimonialService from "../../services/testimonialServices";

// GET: Fetch all testimonials
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('forceRefresh') === 'true';
    
    const testimonials = await TestimonialService.getAllTestimonials(forceRefresh);
    
    return NextResponse.json({
      success: true,
      data: testimonials,
      message: "Testimonials fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch testimonials"
    }, { status: 500 });
  }
}

// POST: Add a new testimonial
export async function POST(request: NextRequest) {
  try {
    const testimonialData = await request.json();
    
    // Validate required fields
    if (!testimonialData.name || !testimonialData.text) {
      return NextResponse.json({
        success: false,
        message: "Name and testimonial text are required"
      }, { status: 400 });
    }
    
    // Validate images array
    if (!testimonialData.images || !Array.isArray(testimonialData.images) || testimonialData.images.length === 0) {
      return NextResponse.json({
        success: false,
        message: "At least one image is required"
      }, { status: 400 });
    }
    
    const newTestimonial = await TestimonialService.addTestimonial(testimonialData);
    
    return NextResponse.json({
      success: true,
      data: newTestimonial,
      message: "Testimonial added successfully"
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to add testimonial"
    }, { status: 500 });
  }
}