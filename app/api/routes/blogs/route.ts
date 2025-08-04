import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import BlogService from "../../services/blogServices";
import consoleManager from "../../utils/consoleManager";

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
        const existingBlog = await BlogService.getBlogBySlug(slug);
        if (!existingBlog || (excludeId && existingBlog.id === excludeId)) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

// Get all blogs (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const author = searchParams.get("author");

        let blogs = await BlogService.getAllBlogs();

        // Apply filters if provided
        if (status) {
            blogs = blogs.filter((blog: any) => blog.status === status);
        }
        if (category) {
            blogs = blogs.filter((blog: any) => blog.category === category);
        }
        if (author) {
            blogs = blogs.filter((blog: any) => blog.author === author);
        }

        consoleManager.log("Fetched blogs with filters:", blogs.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Blogs fetched successfully",
            data: blogs,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/blogs:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new blog (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const title = formData.get("title");
        const content = formData.get("content");
        const author = formData.get("author");
        const category = formData.get("category");
        const tags = formData.get("tags");
        const excerpt = formData.get("excerpt");        const rawStatus = formData.get("status") || "draft";
        const statusValue = rawStatus.toString();
        // Validate status value
        if (!['draft', 'published', 'archived'].includes(statusValue)) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Invalid status value. Must be 'draft', 'published', or 'archived'",
            }, { status: 400 });
        }
        const status = statusValue as 'draft' | 'published' | 'archived';
        const customSlug = formData.get("slug");
        const file = formData.get("imageFile");

        // Validate required fields
        if (!title || !content || !author) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Title, content, and author are required",
            }, { status: 400 });
        }

        // Generate or use custom slug
        let slug: string;
        if (customSlug && typeof customSlug === "string" && customSlug.trim()) {
            slug = generateSlug(customSlug.trim());
        } else {
            slug = generateSlug(title.toString());
        }

        // Ensure slug is unique
        slug = await ensureUniqueSlug(slug);

        let imageUrl: string | null = null;

        // Upload image if provided
        if (file && file instanceof File) {
            const uploadedUrl = await UploadImage(file, 1200, 800);
            if (typeof uploadedUrl === 'string') {
                imageUrl = uploadedUrl;
                consoleManager.log("Blog image uploaded:", imageUrl);
            }
        }

        // Parse tags if provided (assuming comma-separated string)
        let parsedTags: string[] = [];
        if (tags && typeof tags === "string") {
            parsedTags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Save blog data in Firestore
        const blogData = {
            title: title.toString(),
            slug: slug,
            content: content.toString(),
            author: author.toString(),
            category: category?.toString() || null,
            tags: parsedTags,
            excerpt: excerpt?.toString() || "",
            status,
            image: imageUrl,
        } as const;

        const newBlog = await BlogService.addBlog(blogData);

        consoleManager.log("Blog created successfully:", newBlog);

        return NextResponse.json({
            statusCode: 201,
            message: "Blog added successfully",
            data: newBlog,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/blogs:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}