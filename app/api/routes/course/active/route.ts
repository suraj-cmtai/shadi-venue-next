import { NextResponse } from "next/server";
import CourseService from "../../../services/courseServices";
import consoleManager from "../../../utils/consoleManager";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  try {
    const courses = await CourseService.getAllActiveCourses();
    consoleManager.log("Fetched active courses:", courses.length);
    return NextResponse.json({
      statusCode: 200,
      message: "Active courses fetched successfully",
      data: courses,
      errorCode: "NO",
      errorMessage: "",
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    consoleManager.error("Error in GET /api/routes/course/active:", error);
    return NextResponse.json({
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: error.message || "Internal Server Error",
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
} 