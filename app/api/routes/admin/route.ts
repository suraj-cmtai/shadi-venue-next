import { NextResponse } from "next/server";
import { UploadImage, ReplaceImage } from "../../controller/imageController";
import AdminService, { Admin } from "../../services/adminServices";
import consoleManager from "../../utils/consoleManager";

// Get all admins (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const query = searchParams.get("query");
        const role = searchParams.get("role");

        if (id) {
            const admin = await AdminService.getAdminById(id);
            if (!admin) {
                return NextResponse.json({
                    statusCode: 404,
                    errorCode: "NOT_FOUND",
                    errorMessage: "Admin not found",
                }, { status: 404 });
            }
            return NextResponse.json({
                statusCode: 200,
                message: "Admin fetched successfully",
                data: admin,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200 });
        }

        if (query) {
            const admins = await AdminService.searchAdmins(query);
            return NextResponse.json({
                statusCode: 200,
                message: "Admins fetched successfully",
                data: admins,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200 });
        }

        let admins = await AdminService.getAllAdmins();
        
        // Filter by role if provided
        if (role) {
            admins = admins.filter(admin => admin.role === role);
        }

        consoleManager.log("Fetched admins with filters:", admins.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Admins fetched successfully",
            data: admins,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/admin:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const role = formData.get("role");
        const phoneNumber = formData.get("phoneNumber");
        const file = formData.get("avatar");

        // Validate required fields
        if (!name || !email || !role) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Name, email, and role are required",
            }, { status: 400 });
        }

        // Validate role
        if (!['admin', 'superadmin'].includes(role.toString())) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Role must be either 'admin' or 'superadmin'",
            }, { status: 400 });
        }

        let avatarUrl = null;

        // Upload avatar if provided
        if (file && file instanceof File) {
            const uploadedUrl = await UploadImage(file, 400, 400);
            avatarUrl = uploadedUrl ? String(uploadedUrl) : undefined;
            consoleManager.log("Admin avatar uploaded:", avatarUrl);
        }

        // Save admin data
        const adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'> = {
            name: name.toString(),
            email: email.toString(),
            role: role.toString() as 'admin' | 'superadmin',
            phoneNumber: phoneNumber?.toString() || "",
            avatar: avatarUrl ? String(avatarUrl) : undefined,
            actions: [],
            lastLogin: undefined
        };

        const newAdmin = await AdminService.addAdmin(adminData);
        await AdminService.logAdminAction(newAdmin.id, 'create', `admin:${newAdmin.id}`);
        consoleManager.log("Admin created successfully:", newAdmin);

        return NextResponse.json({
            statusCode: 201,
            message: "Admin added successfully",
            data: newAdmin,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });
    } catch (error: any) {
        consoleManager.error("Error in POST /api/admin:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update an admin (PUT)
export async function PUT(req: Request) {
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");
        const email = formData.get("email");
        const role = formData.get("role");
        const phoneNumber = formData.get("phoneNumber");
        const file = formData.get("avatar");

        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Admin ID is required",
            }, { status: 400 });
        }

        // Verify admin exists
        const existingAdmin = await AdminService.getAdminById(id.toString());
        if (!existingAdmin) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Admin not found",
            }, { status: 404 });
        }

        let avatarUrl = existingAdmin.avatar;

        // Upload new avatar if provided
        if (file && file instanceof File) {
            const uploadedUrl = await UploadImage(file, 400, 400);
            avatarUrl = uploadedUrl ? String(uploadedUrl) : existingAdmin.avatar;
            consoleManager.log("Admin avatar updated:", avatarUrl);
        }

        // Update admin data
        const adminData: any = {};
        if (name) adminData.name = name.toString();
        if (email) adminData.email = email.toString();
        if (role) {
            if (!['admin', 'superadmin'].includes(role.toString())) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: "BAD_REQUEST",
                    errorMessage: "Role must be either 'admin' or 'superadmin'",
                }, { status: 400 });
            }
            adminData.role = role.toString();
        }
        if (phoneNumber) adminData.phoneNumber = phoneNumber.toString();
        if (avatarUrl) adminData.avatar = avatarUrl;

        const updatedAdmin = await AdminService.updateAdmin(id.toString(), adminData);
        await AdminService.logAdminAction(id.toString(), 'update', `admin:${id}`);
        consoleManager.log("Admin updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Admin updated successfully",
            data: updatedAdmin,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/admin:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete an admin (DELETE)
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Admin ID is required",
            }, { status: 400 });
        }

        // Verify admin exists
        const existingAdmin = await AdminService.getAdminById(id);
        if (!existingAdmin) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Admin not found",
            }, { status: 404 });
        }

        await AdminService.deleteAdmin(id);
        consoleManager.log("Admin deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "Admin deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/admin:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Log admin action (PATCH)
export async function PATCH(req: Request) {
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const action = formData.get("action");
        const target = formData.get("target");

        if (!id || !action || !target) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "ID, action, and target are required",
            }, { status: 400 });
        }

        const actionRecord = await AdminService.logAdminAction(
            id.toString(),
            action.toString(),
            target.toString()
        );

        consoleManager.log("Admin action logged successfully:", actionRecord);

        return NextResponse.json({
            statusCode: 200,
            message: "Admin action logged successfully",
            data: actionRecord,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PATCH /api/admin:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
