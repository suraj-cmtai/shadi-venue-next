import { NextResponse } from "next/server";
import AuthService from "../../services/authServices";
import consoleManager from "../../utils/consoleManager";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name, action } = body;

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
            result = await AuthService.signupUser(email, password, name);
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

        response.headers.append(
            "Set-Cookie",
            `authToken=${result.token}; ${cookieOptions}`
        );

        response.headers.append(
            "Set-Cookie",
            `user=${encodeURIComponent(JSON.stringify(result.user))}; ${cookieOptions}`
        );

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
    response.headers.append("Set-Cookie", `user=; ${cookieOptions}`);

    return response;
}
