import { NextResponse } from "next/server";
import AdminService from "../../../services/adminServices";
import consoleManager from "../../../utils/consoleManager";

export async function GET(req: Request) {
    try {
        const stats = await AdminService.getDashboardStats();
        consoleManager.log("Admin dashboard stats fetched");

        return NextResponse.json({
            statusCode: 200,
            message: "Dashboard stats fetched successfully",
            data: stats,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/admin/stats:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
