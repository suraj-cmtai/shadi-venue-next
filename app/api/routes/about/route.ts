import { NextRequest, NextResponse } from "next/server";
import AboutService from "../../services/aboutServices";

// Initialize the service
AboutService.init();

// GET: Fetch all about content
export async function GET(request: NextRequest) {
  try {
    const aboutContent = await AboutService.getAllAboutContent();
    
    return NextResponse.json({
      success: true,
      message: "About content retrieved successfully",
      data: aboutContent,
    });
  } catch (error: any) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch about content",
        data: null,
      },
      { status: 500 }
    );
  }
}

// POST: Create new about content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { title, subtitle, description, image, buttonText, buttonLink } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Title and description are required",
          data: null,
        },
        { status: 400 }
      );
    }

    const newAboutContent = await AboutService.addAboutContent({
      title,
      subtitle: subtitle || "",
      description,
      image: image || "",
      buttonText: buttonText || "Learn More",
      buttonLink: buttonLink || "#",
      status: body.status || "active",
    });

    return NextResponse.json({
      success: true,
      message: "About content created successfully",
      data: newAboutContent,
    });
  } catch (error: any) {
    console.error("Error creating about content:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create about content",
        data: null,
      },
      { status: 500 }
    );
  }
}