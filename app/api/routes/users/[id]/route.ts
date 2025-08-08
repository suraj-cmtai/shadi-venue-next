import { NextResponse } from "next/server";
import { ReplaceImage } from "../../../controller/imageController";
import UserService, { User, UserRole } from "../../../services/userServices";
import consoleManager from "../../../utils/consoleManager";

// Get a specific user (GET)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await UserService.getUserById(id);

        if (!user) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        consoleManager.log("Fetched user:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "User fetched successfully",
            data: {
                ...user,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/users/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update a user (PUT)
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        
        const name = formData.get("name");
        const email = formData.get("email");
        const role = formData.get("role");
        const phoneNumber = formData.get("phoneNumber");
        const street = formData.get("street");
        const city = formData.get("city");
        const state = formData.get("state");
        const country = formData.get("country");
        const zipCode = formData.get("zipCode");
        const file = formData.get("avatar");
        const removeAvatar = formData.get("removeAvatar") === "true";

        // Validate user exists
        const existingUser = await UserService.getUserById(id);
        if (!existingUser) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        let avatarUrl = existingUser.avatar;
        
        // Handle avatar
        if (removeAvatar) {
            avatarUrl = undefined;
        } else if (file && file instanceof File) {
            const uploadedUrl = await ReplaceImage(file, existingUser.avatar || "", 400, 400);
            avatarUrl = uploadedUrl ? String(uploadedUrl) : undefined;
            consoleManager.log("User avatar updated:", avatarUrl);
        }

        // Update user data
        const userData: Partial<User> = {};
        if (name) userData.name = name.toString();
        if (email) userData.email = email.toString();
        if (role) userData.role = role.toString() as UserRole;
        if (phoneNumber) userData.phoneNumber = phoneNumber.toString();
        
        // Update address if any field is provided
        if (street || city || state || country || zipCode) {
            userData.address = {
                street: street?.toString() || existingUser.address?.street || "",
                city: city?.toString() || existingUser.address?.city || "",
                state: state?.toString() || existingUser.address?.state || "",
                country: country?.toString() || existingUser.address?.country || "",
                zipCode: zipCode?.toString() || existingUser.address?.zipCode || "",
            };
        }

        if (avatarUrl !== undefined) userData.avatar = avatarUrl;

        const updatedUser = await UserService.updateUser(id, userData);

        consoleManager.log("User updated successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "User updated successfully",
            data: {
                ...updatedUser,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PUT /api/routes/users/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Delete a user (DELETE)
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Validate user exists
        const existingUser = await UserService.getUserById(id);
        if (!existingUser) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        await UserService.deleteUser(id);

        consoleManager.log("User deleted successfully:", id);

        return NextResponse.json({
            statusCode: 200,
            message: "User deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in DELETE /api/routes/users/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
