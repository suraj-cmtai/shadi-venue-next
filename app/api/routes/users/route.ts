import { NextResponse } from "next/server";
import { UploadImage } from "../../controller/imageController";
import UserService, { User, UserRole, Invite } from "../../services/userServices";
import consoleManager from "../../utils/consoleManager";

// Get all users (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role") as UserRole;
        const search = searchParams.get("search");

        let users = await UserService.getAllUsers();

        // Apply filters if provided
        if (role) {
            users = users.filter((user) => user.role === role);
        }

        if (search) {
            users = await UserService.searchUsers(search);
        }

        consoleManager.log("Fetched users with filters:", users.length);

        return NextResponse.json({
            statusCode: 200,
            message: "Users fetched successfully",
            data: users,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in GET /api/routes/users:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Add a new user (POST)
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        // Extract basic info
        const name = formData.get("name");
        const email = formData.get("email");
        const role = formData.get("role") as UserRole;
        const phoneNumber = formData.get("phoneNumber");
        const file = formData.get("avatar");

        // Extract address info
        const street = formData.get("street");
        const city = formData.get("city");
        const state = formData.get("state");
        const country = formData.get("country");
        const zipCode = formData.get("zipCode");

        // Extract invite data if provided
        const inviteData = formData.get("invite");
        let invite: Invite | undefined;
        
        if (inviteData) {
            try {
                invite = JSON.parse(inviteData.toString());
            } catch (error) {
                consoleManager.error("Error parsing invite data:", error);
            }
        }

        // Validate required fields
        if (!name || !email || !role) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Name, email, and role are required",
            }, { status: 400 });
        }

        let avatarUrl = null;

        // Upload avatar if provided
        if (file && file instanceof File) {
            avatarUrl = await UploadImage(file, 400, 400);
            consoleManager.log("User avatar uploaded:", avatarUrl);
        }

        // Prepare user data
        const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
            name: name.toString(),
            email: email.toString(),
            role: role,
            phoneNumber: phoneNumber?.toString() || "",
            avatar: avatarUrl ? String(avatarUrl) : undefined,
            address: street ? {
                street: street.toString(),
                city: city?.toString() || "",
                state: state?.toString() || "",
                country: country?.toString() || "",
                zipCode: zipCode?.toString() || "",
            } : undefined,
            bookings: [],
            favorites: {
                hotels: [],
                vendors: [],
            },
            notifications: [],
            invite,
        };

        const newUser = await UserService.addUser(userData);

        consoleManager.log("User created successfully:", newUser);

        return NextResponse.json({
            statusCode: 201,
            message: "User added successfully",
            data: newUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error: any) {
        consoleManager.error("Error in POST /api/routes/users:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}

// Update user's notifications (PATCH)
export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const notificationId = searchParams.get("notificationId");
        const action = searchParams.get("action");

        if (!userId || !action) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "User ID and action are required",
            }, { status: 400 });
        }

        if (action === "markRead" && notificationId) {
            await UserService.markNotificationAsRead(userId, notificationId);
        } else if (action === "addNotification") {
            const { message } = await req.json();
            if (!message) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: "BAD_REQUEST",
                    errorMessage: "Message is required for new notification",
                }, { status: 400 });
            }
            await UserService.addNotification(userId, message);
        }

        const updatedUser = await UserService.getUserById(userId);

        return NextResponse.json({
            statusCode: 200,
            message: "Notifications updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error: any) {
        consoleManager.error("Error in PATCH /api/routes/users:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}
