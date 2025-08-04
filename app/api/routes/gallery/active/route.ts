import { NextResponse } from "next/server";
import GalleryService from "../../../services/galleryServices";
import consoleManager from "../../../utils/consoleManager";

export async function GET() {
  try {
    const galleries = await GalleryService.getAllActiveGalleries();
    consoleManager.log("Fetched active galleries:", galleries.length);
    return NextResponse.json({
      statusCode: 200,
      message: "Active galleries fetched successfully",
      data: galleries,
      errorCode: "NO",
      errorMessage: "",
    }, { status: 200 });
  } catch (error: any) {
    consoleManager.error("Error in GET /api/routes/gallery/active:", error);
    return NextResponse.json({
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: error.message || "Internal Server Error",
    }, { status: 500 });
  }
} 