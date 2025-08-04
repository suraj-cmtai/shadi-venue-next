import { NextResponse } from "next/server";
import SubscriberService, { SubscriberStatus } from "../../services/subscriberServices";
import consoleManager from "../../utils/consoleManager";

// Get all subscribers (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let subscribers = await SubscriberService.getAllSubscribers();

        // Apply filters if provided
        if (status) {
            subscribers = subscribers.filter((subscriber) => subscriber.status === status);
        }

        consoleManager.log("Fetched subscribers with filters:", subscribers.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Subscribers fetched successfully",
            data: subscribers,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/subscribers:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new subscriber (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const email = formData.get("email");
        const status = formData.get("status") || "Active";
        const source = formData.get("source") || "Website";

        // Validate required fields
        if (!email) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Email is required",
            }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.toString())) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Invalid email format",
            }, { status: 400 });
        }

        const subscriberData = {
            email: email.toString(),
            status: status.toString() as SubscriberStatus,
            source: source.toString(),
        };

        const newSubscriber = await SubscriberService.addSubscriber(subscriberData);

        consoleManager.log("Subscriber created successfully:", newSubscriber);

        return NextResponse.json({
            statusCode: 201,
            message: "Subscriber added successfully",
            data: newSubscriber,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/subscribers:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}