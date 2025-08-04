import { NextResponse } from "next/server";
import AdminService from "../../../../services/adminServices";
import consoleManager from "../../../../utils/consoleManager";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const request = await AdminService.getApprovalRequestById(id);
    if (!request) {
      return NextResponse.json({
        statusCode: 404,
        errorCode: "NOT_FOUND",
        errorMessage: "Approval request not found",
      }, { status: 404 });
    }

    consoleManager.log("Fetched approval request:", id);

    return NextResponse.json({
      statusCode: 200,
      message: "Approval request fetched successfully",
      data: request,
      errorCode: "NO",
      errorMessage: "",
    }, { status: 200 });
  } catch (error: any) {
    consoleManager.error(`Error in GET /api/admin/approvals/[id]:`, error);
    return NextResponse.json({
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { approved, notes } = await req.json();

    if (approved === undefined) {
      return NextResponse.json({
        statusCode: 400,
        errorCode: "BAD_REQUEST",
        errorMessage: "Approval status is required",
      }, { status: 400 });
    }

    const request = await AdminService.processApprovalRequest(
      id,
      approved,
      notes
    );

    consoleManager.log(`Approval request ${id} processed:`, approved);

    return NextResponse.json({
      statusCode: 200,
      message: "Approval request processed successfully",
      data: request,
      errorCode: "NO",
      errorMessage: "",
    }, { status: 200 });
  } catch (error: any) {
    consoleManager.error(`Error in PUT /api/admin/approvals/[id]:`, error);
    return NextResponse.json({
      statusCode: 500,
      errorCode: "INTERNAL_ERROR",
      errorMessage: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}
