import { NextRequest, NextResponse } from "next/server";
import TestimonialService from "../../../services/testimonialServices";

// PUT: Update testimonial order
export async function PUT(request: NextRequest) {
  try {
    const { testimonialId, newOrder } = await request.json();
    
    if (!testimonialId || newOrder === undefined) {
      return NextResponse.json({
        success: false,
        message: "Testimonial ID and new order are required"
      }, { status: 400 });
    }
    
    if (typeof newOrder !== 'number' || newOrder < 0) {
      return NextResponse.json({
        success: false,
        message: "Order must be a non-negative number"
      }, { status: 400 });
    }
    
    const result = await TestimonialService.updateTestimonialOrder(testimonialId, newOrder);
    
    return NextResponse.json({
      success: true,
      data: result,
      message: "Testimonial order updated successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update testimonial order"
    }, { status: 500 });
  }
}