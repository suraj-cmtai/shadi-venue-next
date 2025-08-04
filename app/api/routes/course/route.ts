import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import CourseService, { CourseStatus } from "../../services/courseServices";
import consoleManager from "../../utils/consoleManager";

// Get all courses (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const instructor = searchParams.get("instructor");
        const country = searchParams.get("country");

        let courses = await CourseService.getAllCourses();

        // Apply filters if provided
        if (status) {
            courses = courses.filter((course: any) => course.status === status);
        }
        if (category) {
            courses = courses.filter((course: any) => course.category === category);
        }
        if (instructor) {
            courses = courses.filter((course: any) => course.instructor === instructor);
        }
        if (country) {
            courses = courses.filter((course: any) => course.country === country.toLowerCase());
        }

        consoleManager.log("Fetched courses with filters:", courses.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Courses fetched successfully",
            data: courses,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/courses:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new course (POST)
export async function POST(req: Request) {
    try {
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
        const status = formData.get("status") || "draft";
        const file = formData.get("image");
        const learningHours = formData.get("learningHours");
        const modeOfDelivery = formData.get("modeOfDelivery");
        const modeOfAssessment = formData.get("modeOfAssessment");
        const modules = formData.get("modules");
        const prerequisites = formData.get("prerequisites");
        const careerOpportunities = formData.get("careerOpportunities");

        // Validate required fields
        if (!title || !description || !instructor || !duration || !country || !price || !feeType || !currency) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Title, description, instructor, duration, country, price, feeType, and currency are required",
            }, { status: 400 });
        }

        // Validate price is a number
        const priceNumber = Number(price);
        if (isNaN(priceNumber)) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Price must be a valid number",
            }, { status: 400 });
        }

        // Validate currency
        const validCurrencies = ['EUR', 'CAD', 'AUD', 'GBP', 'USD', 'INR'];
        if (!validCurrencies.includes(currency.toString())) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Currency must be one of: EUR, CAD, AUD, GBP, USD, INR",
            }, { status: 400 });
        }

        let imageUrl = null;

        // Upload image if provided
        if (file && file instanceof File) {
            imageUrl = await UploadImage(file, 1200, 800);
            consoleManager.log("Course image uploaded:", imageUrl);
        }

        // Save course data in Firestore
        const courseData = {
            title: title.toString(),
            description: description.toString(),
            instructor: instructor.toString(),
            category: category?.toString() || "",
            duration: duration.toString(),
            country: country.toString().toLowerCase(),
            price: priceNumber,
            feeType: feeType?.toString() || "",
            currency: currency.toString() as 'EUR' | 'CAD' | 'AUD' | 'GBP' | 'USD' | 'INR',
            status: (status?.toString() || "draft") as CourseStatus,
            image: imageUrl as string | null,
            enrollmentCount: 0, // Initialize with 0 enrollments
            learningHours: learningHours?.toString() || "",
            modeOfDelivery: modeOfDelivery?.toString() || "",
            modeOfAssessment: modeOfAssessment?.toString() || "",
            modules: modules?.toString().split('.') || [],
            prerequisites: prerequisites?.toString().split('.') || [],
            careerOpportunities: careerOpportunities?.toString().split('.') || [],
        };

        const newCourse = await CourseService.addCourse(courseData);

        consoleManager.log("Course created successfully:", newCourse);

        return NextResponse.json({
            statusCode: 201,
            message: "Course added successfully",
            data: newCourse,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/courses:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}