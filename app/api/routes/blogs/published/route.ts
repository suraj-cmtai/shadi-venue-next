import BlogService from "@/app/api/services/blogServices";
import consoleManager from "@/app/api/utils/consoleManager";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        // Fetch all published blogs
        const blogs = await BlogService.getAllPublishedBlogs();

        if (!blogs || blogs.length === 0) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "No published blogs found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched published blogs:", blogs.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Published blogs fetched successfully",
            data: blogs,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: any) {
        consoleManager.error("Error in GET /api/blogs/published:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}