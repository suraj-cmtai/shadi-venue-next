import { NextResponse } from "next/server";
import { ReplaceImage } from "../../../controller/imageController";
import CourseService, { CourseStatus } from "../../../services/courseServices";
import consoleManager from "../../../utils/consoleManager";

// Get a specific course (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const course = await CourseService.getCourseById(id);

        if (!course) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Course not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched course:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Course fetched successfully",
            data: {
                ...course,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/courses/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a course (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        
        const title = formData.get("title");
        const description = formData.get("description");
        const instructor = formData.get("instructor");
        const category = formData.get("category");
        const duration = formData.get("duration");
        const country = formData.get("country");
        const price = formData.get("price");
        const feeType = formData.get("feeType");
        const currency = formData.get("currency");
        const status = formData.get("status");
        const file = formData.get("image");
        const learningHours = formData.get("learningHours");
        const modeOfDelivery = formData.get("modeOfDelivery");
        const modeOfAssessment = formData.get("modeOfAssessment");
        const modules = formData.get("modules");
        const prerequisites = formData.get("prerequisites");
        const careerOpportunities = formData.get("careerOpportunities");
        // Validate course exists
        const existingCourse = await CourseService.getCourseById(id);
        if (!existingCourse) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Course not found",
            }, { status: 404 });
        }

        let imageUrl = existingCourse.image;
        
        // Upload new image if provided
        if (file && file instanceof File) {
            const uploadedUrl = await ReplaceImage(file, existingCourse.image as string, 1200, 800);
            imageUrl = uploadedUrl as string;
            consoleManager.log("Course image updated:", imageUrl);
        }

        // Update course data
        const courseData: any = {};
        if (title) courseData.title = title.toString();
        if (description) courseData.description = description.toString();
        if (instructor) courseData.instructor = instructor.toString();
        if (category) courseData.category = category.toString();
        if (duration) courseData.duration = duration.toString();
        if (country) courseData.country = country.toString().toLowerCase();
        if (price) courseData.price = Number(price);
        if (feeType) courseData.feeType = feeType.toString();
        if (currency) courseData.currency = currency.toString();
        if (status) courseData.status = status.toString();
        if (imageUrl) courseData.image = imageUrl;
        if (learningHours) courseData.learningHours = learningHours.toString();
        if (modeOfDelivery) courseData.modeOfDelivery = modeOfDelivery.toString();
        if (modeOfAssessment) courseData.modeOfAssessment = modeOfAssessment.toString();
        if (modules) courseData.modules = modules.toString().split('.');
        if (prerequisites) courseData.prerequisites = prerequisites.toString().split('.');
        if (careerOpportunities) courseData.careerOpportunities = careerOpportunities.toString().split('.');
        // Preserve createdAt and update updatedAt
        courseData.createdAt = existingCourse.createdAt; // Keep original creation date
        courseData.updatedAt = new Date(); // Set current date/time for update

        const updatedCourse = await CourseService.updateCourse(id, courseData);

        consoleManager.log("Course updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Course updated successfully",
            data: {
                ...updatedCourse,
                createdAt: updatedCourse.createdAt,
                updatedAt: updatedCourse.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/courses/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a course (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Validate course exists
        const existingCourse = await CourseService.getCourseById(id);
        if (!existingCourse) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Course not found",
            }, { status: 404 });
        }

        await CourseService.deleteCourse(id);

        consoleManager.log("Course deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Course deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/courses/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}