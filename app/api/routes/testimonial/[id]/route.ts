import { NextRequest, NextResponse } from "next/server";
import TestimonialService from "../../../services/testimonialServices";

// GET: Fetch testimonial by ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Testimonial ID is required"
      }, { status: 400 });
    }

    const testimonial = await TestimonialService.getTestimonialById(id);

    if (!testimonial) {
      return NextResponse.json({
        success: false,
        message: "Testimonial not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: "Testimonial fetched successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to fetch testimonial"
    }, { status: 500 });
  }
}

// PUT: Update testimonial by ID
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
        message: "Testimonial ID is required"
      }, { status: 400 });
    }

    // Check if testimonial exists first
    const existingTestimonial = await TestimonialService.getTestimonialById(id);
    if (!existingTestimonial) {
      return NextResponse.json({
        success: false,
        message: "Testimonial not found"
      }, { status: 404 });
    }

    const updatedTestimonial = await TestimonialService.updateTestimonial(id, updatedData);

    return NextResponse.json({
      success: true,
      data: updatedTestimonial,
      message: "Testimonial updated successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to update testimonial"
    }, { status: 500 });
  }
}

// DELETE: Delete testimonial by ID
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Testimonial ID is required"
      }, { status: 400 });
    }

    // Check if testimonial exists first
    const existingTestimonial = await TestimonialService.getTestimonialById(id);
    if (!existingTestimonial) {
      return NextResponse.json({
        success: false,
        message: "Testimonial not found"
      }, { status: 404 });
    }

    const result = await TestimonialService.deleteTestimonial(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Testimonial deleted successfully"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message || "Failed to delete testimonial"
    }, { status: 500 });
  }
}