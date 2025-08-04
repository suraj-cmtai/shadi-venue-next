import { NextResponse } from "next/server";
import SubscriberService, { SubscriberStatus } from "../../../services/subscriberServices";
import consoleManager from "../../../utils/consoleManager";

// Get a specific subscriber (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const subscriber = await SubscriberService.getSubscriberById(id);

        if (!subscriber) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Subscriber not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched subscriber:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Subscriber fetched successfully",
            data: subscriber,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/subscribers/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a subscriber (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const formData = await req.formData();
        const email = formData.get("email");
        const status = formData.get("status");
        const source = formData.get("source");

        // Validate subscriber exists
        const existingSubscriber = await SubscriberService.getSubscriberById(id);
        if (!existingSubscriber) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Subscriber not found",
            }, { status: 404 });
        }

        // Update subscriber data
        const subscriberData: any = {};
        if (email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.toString())) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: "BAD_REQUEST",
                    errorMessage: "Invalid email format",
                }, { status: 400 });
            }
            subscriberData.email = email.toString();
        }
        if (status) subscriberData.status = status.toString() as SubscriberStatus;
        if (source) subscriberData.source = source.toString();

        const updatedSubscriber = await SubscriberService.updateSubscriber(id, subscriberData);

        consoleManager.log("Subscriber updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Subscriber updated successfully",
            data: updatedSubscriber,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/subscribers/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a subscriber (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        // Validate subscriber exists
        const existingSubscriber = await SubscriberService.getSubscriberById(id);
        if (!existingSubscriber) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Subscriber not found",
            }, { status: 404 });
        }

        await SubscriberService.deleteSubscriber(id);

        consoleManager.log("Subscriber deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Subscriber deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/subscribers/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}