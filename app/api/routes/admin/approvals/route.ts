import { NextResponse } from "next/server";
import AdminService from "../../../services/adminServices";
import consoleManager from "../../../utils/consoleManager";

// Get all approval requests
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") as 'pending' | 'approved' | 'rejected' | null;
        const entityType = searchParams.get("entityType") as 'hotel' | 'vendor' | 'user' | 'super-admin' | null;

        let approvalRequests = await AdminService.getAllApprovalRequests();

        // Apply filters if provided
        if (status) {
            approvalRequests = approvalRequests.filter(req => req.status === status);
        }
        if (entityType) {
            approvalRequests = approvalRequests.filter(req => req.entityType === entityType);
        }

        consoleManager.log("Fetched approval requests with filters:", approvalRequests.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Approval requests fetched successfully",
            data: approvalRequests,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/admin/approvals:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Process an approval request
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const requestId = formData.get("requestId");
        const approved = formData.get("approved");
        const notes = formData.get("notes");

        if (!requestId || approved === null) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Request ID and approval status are required",
            }, { status: 400 });
        }

        // Get the existing request
        const request = await AdminService.getApprovalRequestById(requestId.toString());
        if (!request) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Approval request not found",
            }, { status: 404 });
        }

        // Process the request
        const processedRequest = await AdminService.processApprovalRequest(
            requestId.toString(),
            approved === 'true',
            notes?.toString()
        );

        consoleManager.log(`Approval request ${requestId} processed:`, approved);

        return NextResponse.json({
            statusCode: 200,
            message: "Approval request processed successfully",
            data: processedRequest,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in POST /api/admin/approvals:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
