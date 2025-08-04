import { NextRequest, NextResponse } from 'next/server';
import { UploadImage, ReplaceImage } from '../../../controller/imageController';
import BlogService from '../../../services/blogServices';
import consoleManager from '../../../utils/consoleManager';

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

// Get a single blog by ID (GET)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blog = await BlogService.getBlogById(id);
        
        if (!blog) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Blog not found',
            }, { status: 404 });
        }
        
        consoleManager.log('Fetched blog:', id);
        return NextResponse.json({
            statusCode: 200,
            message: 'Blog fetched successfully',
            data: blog,
            errorCode: 'NO',
            errorMessage: '',
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error('Error in GET /api/blogs/[id]:', error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            errorMessage: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}

// Update a blog by ID (PUT)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: 'BAD_REQUEST',
                errorMessage: 'Blog ID is required',
            }, { status: 400 });
        }

        // Check if blog exists
        const existingBlog = await BlogService.getBlogById(id);
        if (!existingBlog) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Blog not found',
            }, { status: 404 });
        }

        const formData = await req.formData();
        const title = formData.get("title");
        const content = formData.get("content");
        const author = formData.get("author");
        const category = formData.get("category");
        const tags = formData.get("tags");
        const excerpt = formData.get("excerpt");
        const status = formData.get("status");
        const customSlug = formData.get("slug");
        const imageUrl = formData.get("image");
        const file = formData.get("imageFile");
        const removeImage = formData.get("removeImage"); // Flag to remove existing image

        let updateData: any = {};

        // Handle title and slug updates
        if (title && title.toString() !== existingBlog.title) {
            updateData.title = title.toString();
            
            // Generate new slug if title changed or custom slug provided
            let newSlug: string;
            if (customSlug && typeof customSlug === "string" && customSlug.trim()) {
                newSlug = generateSlug(customSlug.trim());
            } else {
                newSlug = generateSlug(title.toString());
            }
            
            // Ensure slug is unique (excluding current blog)
            updateData.slug = await ensureUniqueSlug(newSlug, id);
        } else if (customSlug && typeof customSlug === "string" && customSlug.trim()) {
            // Custom slug provided without title change
            const newSlug = generateSlug(customSlug.trim());
            if (newSlug !== existingBlog.slug) {
                updateData.slug = await ensureUniqueSlug(newSlug, id);
            }
        }

        // Handle other fields
        if (content) updateData.content = content.toString();
        if (author) updateData.author = author.toString();
        if (category !== undefined) updateData.category = category?.toString() || null;
        if (excerpt !== undefined) updateData.excerpt = excerpt?.toString() || null;
        if (status) {
            const statusValue = status.toString();
            if (!['draft', 'published', 'archived'].includes(statusValue)) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: 'BAD_REQUEST',
                    errorMessage: 'Invalid status value',
                }, { status: 400 });
            }
            updateData.status = statusValue as 'draft' | 'published' | 'archived';
        }

        // Handle tags
        if (tags !== undefined) {
            if (tags && typeof tags === "string") {
                updateData.tags = tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else {
                updateData.tags = [];
            }
        }

        // Handle image updates
        if (removeImage === "true") {
            // Remove existing image
            updateData.image = null;
            consoleManager.log("Image will be removed from blog");
        } else if (file && file instanceof File) {            // Replace existing image with new one
            const newImageUrl = await ReplaceImage(file, existingBlog.image || '', 1200, 800);
            updateData.image = newImageUrl;
            consoleManager.log("Blog image replaced:", newImageUrl);
        }
        else if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
            // Use provided image URL
            updateData.image = imageUrl.trim();
        } else {
            // Keep existing image if no new image provided
            updateData.image = existingBlog.image;
        }

        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: 'BAD_REQUEST',
                errorMessage: 'No fields to update',
            }, { status: 400 });
        }

        const updatedBlog = await BlogService.updateBlog(id, updateData);
        const fullUpdatedBlog = await BlogService.getBlogById(id); // Fetch full updated blog data
        if (!fullUpdatedBlog) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Blog not found',
            }, { status: 404 });
            }
        
        consoleManager.log('Blog updated:', updatedBlog);
        return NextResponse.json({
            statusCode: 200,
            message: 'Blog updated successfully',
            data: fullUpdatedBlog,
            errorCode: 'NO',
            errorMessage: '',
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error('Error in PUT /api/blogs/[id]:', error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            errorMessage: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}

// Delete a blog by ID (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: 'BAD_REQUEST',
                errorMessage: 'Blog ID is required',
            }, { status: 400 });
        }

        const existingBlog = await BlogService.getBlogById(id);
        if (!existingBlog) {
            return NextResponse.json({  
                statusCode: 404,
                errorCode: 'NOT_FOUND',
                errorMessage: 'Blog not found',
            }, { status: 404 });
        }

        // Delete the blog (image cleanup can be handled in the service if needed)
        await BlogService.deleteBlog(id);
        
        consoleManager.log('Blog deleted:', id);
        return NextResponse.json({
            statusCode: 200,
            message: 'Blog deleted successfully',
            data: { id },
            errorCode: 'NO',
            errorMessage: '',
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error('Error in DELETE /api/blogs/[id]:', error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            errorMessage: error.message || 'Internal Server Error',
        }, { status: 500 });
    }
}