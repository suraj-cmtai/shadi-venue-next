import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import BlogService from "@/app/api/services/blogServices";
import consoleManager from "@/app/api/utils/consoleManager";

type RouteContext = {
    params: Promise<{
        slug: string;
    }>;
};

// Get blog by slug
export async function GET(
    req: Request,
    context: RouteContext
): Promise<Response> {
    try {
        // Await the params promise in Next.js 15
        const { slug } = await context.params;
        const blog = await BlogService.getBlogBySlug(slug);
        
        if (!blog) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Blog not found',
            }, { status: 404 });
        }
        
        consoleManager.log('Fetched blog by slug:', slug);
        return NextResponse.json({
            statusCode: 200,
            message: 'Blog fetched successfully',
            data: blog,
            errorCode: 'NO',
            errorMessage: '',
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error('Error in GET /api/blogs/slug/[slug]:', error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            errorMessage: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}