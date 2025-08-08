import { NextResponse } from "next/server";
import AuthService from "../../services/authServices";
import consoleManager from "../../utils/consoleManager";

/**
 * There are two cookies/tokens set in this auth route:
 * 
 * 1. `authToken`: This is the actual authentication token (e.g., JWT) used for verifying the user's session on protected routes. 
 *    - It is only sent when the user logs in (not on signup).
 *    - It is HttpOnly, Secure, and has a 7-day expiry.
 * 
 * 2. `auth`: This is a cookie containing the serialized user object (not sensitive, but useful for client-side access to user info).
 *    - It is set on both signup and login, so the client can access user info after either action.
 *    - It is also HttpOnly, Secure, and has a 7-day expiry.
 * 
 * The separation allows the frontend to access user info for UI purposes (from `auth`), while the actual authentication is handled securely via `authToken`.
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, action, role } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Email and password are required.",
            }, { status: 400 });
        }

        let result;
        if (action === "signup") {
            if (!name) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: "INVALID_INPUT",
                    errorMessage: "Name is required for signup.",
                }, { status: 400 });
            }
            if (!role) {
                return NextResponse.json({
                    statusCode: 400,
                    errorCode: "INVALID_INPUT",
                    errorMessage: "Role is required for signup.",
                }, { status: 400 });
            }
            result = await AuthService.signupUser(email, password, name, role);
            consoleManager.log("✅ User signed up:", result.user.id);
        } else {
            result = await AuthService.loginUser(email, password);
            consoleManager.log("✅ User logged in:", result.user.id);
        }

        // Create response
        const response = NextResponse.json({
            statusCode: 200,
            message: action === "signup" ? "User registered successfully" : "User logged in successfully",
            data: result.user,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

        // Set secure cookies
        const cookieOptions = `Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`; // 7 days

        // Only send authToken if login (not on signup)
        if (action !== "signup") {
            response.headers.append(
                "Set-Cookie",
                `authToken=${result.token}; ${cookieOptions}`
            );
            response.headers.append(
                "Set-Cookie",
                `auth=${encodeURIComponent(JSON.stringify(result.user))}; ${cookieOptions}`
            );
        }


        return response;

    } catch (error: any) {
        consoleManager.error("❌ Error in auth:", error.message);

        return NextResponse.json({
            statusCode: 401,
            errorCode: "AUTH_FAILED",
            errorMessage: error.message || "Authentication failed",
        }, { status: 401 });
    }
}

export async function DELETE(req: Request) {
    const response = NextResponse.json({
        statusCode: 200,
        message: "Logged out successfully",
        errorCode: "NO",
        errorMessage: "",
    });

    // Clear auth cookies
    const cookieOptions = "Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
    response.headers.append("Set-Cookie", `authToken=; ${cookieOptions}`);
    response.headers.append("Set-Cookie", `auth=; ${cookieOptions}`);

    return response;
}
