import { NextRequest, NextResponse } from "next/server";
import path from "path";

export default function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // If no token and trying to access protected routes, redirect to login
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check role-based access for specific routes
  if (token) {
    try {
      // Decode the token and get the role
      const role = decodeTokenAndGetRole(token);

      // Hotel routes protection
      if (request.nextUrl.pathname.startsWith("/dashboard/hotel") && role !== "hotel") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Vendor routes protection
      if (request.nextUrl.pathname.startsWith("/dashboard/vendor") && role !== "vendor") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Admin routes protection
      if (request.nextUrl.pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Helper function to decode token and get role
function decodeTokenAndGetRole(token: string): string {
  try {
    // This is a simple base64 decode. Replace this with your actual token decoding logic
    const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return decoded.role || "user";
  } catch (error) {
    return "user";
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};