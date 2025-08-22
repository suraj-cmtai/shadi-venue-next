// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// ===== TYPES =====
export type Role = "super-admin" | "admin" | "hotel" | "vendor" | "user";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

interface Auth {
  id?: string;
  role?: Role;
  roleId?: string;
  status?: "active" | "inactive";
  [key: string]: any; // for dynamic roleIds and other fields
}

interface RouteConfig {
  pattern: string | RegExp;
  methods?: HttpMethod[];
  roles?: Role[];
  isPublic?: boolean;
  customHandler?: (pathname: string, method: HttpMethod, auth: Auth | null) => boolean;
}

interface DashboardConfig {
  path: string;
  allowedRoles: Role[];
}

// ===== CONFIGURATION =====

// Role to Dashboard Mapping
const ROLE_DASHBOARDS: Record<Role, string> = {
  "super-admin": "/dashboard/super-admin",
  "admin": "/dashboard/admin", 
  "hotel": "/dashboard/hotel",
  "vendor": "/dashboard/vendor",
  "user": "/dashboard/user",
};

// Dashboard Access Configuration
const DASHBOARD_ROUTES: DashboardConfig[] = [
  {
    path: "/dashboard/super-admin",
    allowedRoles: ["super-admin"],
  },
  {
    path: "/dashboard/admin", 
    allowedRoles: ["admin", "super-admin"],
  },
  {
    path: "/dashboard/hotel",
    allowedRoles: ["hotel", "admin", "super-admin"],
  },
  {
    path: "/dashboard/vendor",
    allowedRoles: ["vendor", "admin", "super-admin"],
  },
  {
    path: "/dashboard/user",
    allowedRoles: ["user"],
  },
];

// Public Routes (accessible without authentication)
const PUBLIC_ROUTES = ["/login", "/signup"];

// API Routes Configuration
const API_ROUTES: RouteConfig[] = [
  // ===== PUBLIC API ROUTES =====
  {
    pattern: /\/api\/routes\/invite\/[^/]+\/responses$/,
    methods: ["GET"],
    isPublic: true,
  },
  {
    pattern: /\/api\/routes\/(contact|subscribers)$/,
    methods: ["POST"],
    isPublic: true,
  },
  {
    pattern: /\/api\/routes\/blogs\/slug\//,
    isPublic: true,
  },
  {
    pattern: /\/api\/routes\/course\/[^/]+$/,
    methods: ["GET"], 
    isPublic: true,
  },
  //  https://shadi-venue-next.vercel.app/api/routes/hero-extension/content
  {
    pattern: /\/api\/routes\/hero-extension\/content$/,
    methods: ["GET"],
    isPublic: true,
  },
  // https://shadi-venue-next.vercel.app/api/routes/about/process-steps/active
  {
    pattern: /\/api\/routes\/about\/process-steps\/active$/,
    methods: ["GET"],
    isPublic: true,
  },
  {
    // This covers /api/routes/(published|active|login|signup|logout|public|auth) for any method
    pattern: /\/api\/routes\/(published|active|login|signup|logout|public|auth)/,
    isPublic: true,
  },
  {
    pattern: "/api/routes/test",
    methods: ["POST", "OPTIONS"],
    isPublic: true,
  },
  // ===== NEW: Make any GET request to /api/routes/anything/(published|active|login|signup|logout|public|auth)/ public =====
  {
    // Matches /api/routes/anything/(published|active|login|signup|logout|public|auth)/...
    pattern: /\/api\/routes\/[^/]+\/(published|active|login|signup|logout|public|auth)(\/|$)/,
    methods: ["GET"],
    isPublic: true,
  },
  {
    pattern: /\/api\/routes\/users\/[^/]+$/,
    methods: ["GET"],
    isPublic: true,
  },

  // post(`/api/routes/invite/${rsvpData.userId}/rsvp`, rsvpData);
  {
    pattern: /\/api\/routes\/invite\/[^/]+\/rsvp$/,
    methods: ["POST"],
    isPublic: true,
  },
  // /api/routes/wedding/KOSsjxjviRjS2BQkTwGy
  {
    pattern: /\/api\/routes\/wedding\/[^/]+$/,
    methods: ["GET"],
    isPublic: true,
  },

  // hero active
  // testimonial active
  {
    pattern: /\/api\/routes\/hero\/active$/,
    methods: ["GET"],
    isPublic: true,
  },
  {
    pattern: /\/api\/routes\/testimonial\/active$/,
    methods: ["GET"],
    isPublic: true,
  },
  // /api/routes/hotel/ZLkuECmwdA1Tw9Hu1swd
  {
    pattern: /\/api\/routes\/hotel\/[^/]+$/,
    methods: ["GET"],
    isPublic: true,
  },

  // ===== VENDOR API ROUTES =====

  // /api/routes/vendor/active - public, only GET
  {
    pattern: "/api/routes/vendor/active",
    methods: ["GET"],
    isPublic: true,
  },

  // /api/routes/vendor/[id] - admin and vendor, all methods
  {
    pattern: /^\/api\/routes\/vendor\/[^/]+$/,
    roles: ["admin", "vendor"],
  },

  // /api/routes/vendor - admin and vendor, all methods
  {
    pattern: "/api/routes/vendor",
    roles: ["admin", "vendor"],
  },

  // ===== ROLE-BASED API ROUTES =====
  
  // Super Admin Only Routes
  {
    pattern: "/api/routes/super-admin",
    roles: ["super-admin"],
  },
  
  // Admin Routes (admin + super-admin)
  {
    pattern: "/api/routes/admin",
    roles: ["admin", "super-admin"],
  },
  {
    pattern: "/api/routes/test",
    methods: ["GET", "PUT", "DELETE"],
    roles: ["admin", "super-admin"],
  },
  
  // Hotel Routes
  {
    pattern: "/api/routes/hotel",
    roles: ["hotel", "admin", "super-admin"],
  },

  // ===== CUSTOM LOGIC ROUTES =====
  
  // Users route with special logic
  {
    pattern: /^\/api\/routes\/users\/[^/]+$/,
    customHandler: (pathname: string, method: HttpMethod, auth: Auth | null) => {
      if (!auth?.role) return false;

      // Allow users to access their own data
      if (auth.role === "user" && pathname.includes(auth.roleId || "")) {
        return true;
      }
      
      // Admin and super-admin can access all
      return ["admin", "super-admin"].includes(auth.role);
    },
  },
  {
    pattern: /^\/api\/routes\/users\/[^/]+\/(invite|invite\/status|invite\/theme|invite\/events)$/,
    customHandler: (pathname: string, method: HttpMethod, auth: Auth | null) => {
      if (!auth?.role) return false;

      // Allow users to access their own invite data
      if (auth.role === "user" && pathname.includes(auth.roleId || "")) {
        return true;
      }
      
      // Admin and super-admin can access all
      return ["admin", "super-admin"].includes(auth.role);
    },
  },
  {
    // For DELETE method on events
    pattern: /^\/api\/routes\/users\/[^/]+\/invite\/events\/\d+$/,
    customHandler: (pathname: string, method: HttpMethod, auth: Auth | null) => {
      if (!auth?.role) return false;

      // Allow users to delete their own events
      if (auth.role === "user" && pathname.includes(auth.roleId || "")) {
        return true;
      }
      
      // Admin and super-admin can access all
      return ["admin", "super-admin"].includes(auth.role);
    },
  },

  // ===== EXAMPLE: HOW TO ADD NEW ROUTES =====
  
  // Example: Analytics route for managers and above
  // {
  //   pattern: "/api/routes/analytics",
  //   roles: ["manager", "admin", "super-admin"],
  // },
  
  // Example: Public endpoint
  // {
  //   pattern: "/api/public/stats",
  //   isPublic: true,
  // },
  
  // Example: Method-specific access
  // {
  //   pattern: "/api/routes/orders",
  //   methods: ["GET"],
  //   roles: ["vendor", "admin", "super-admin"],
  // },
  // {
  //   pattern: "/api/routes/orders", 
  //   methods: ["POST", "PUT", "DELETE"],
  //   roles: ["admin", "super-admin"],
  // },
  
  // Example: Complex pattern with regex
  // {
  //   pattern: /\/api\/routes\/reports\/\d+$/,
  //   methods: ["GET"],
  //   roles: ["manager", "admin", "super-admin"],
  // },

  // ===== DEFAULT FALLBACK =====
  // All other API routes default to admin/super-admin only
  {
    pattern: /^\/api\//,
    roles: ["admin", "super-admin"],
  },
];

// ===== HELPER FUNCTIONS =====

function getAuthFromRequest(request: NextRequest): Auth | null {
  const userCookie = request.cookies.get("auth")?.value;
  try {
    return userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
  } catch {
    return null;
  }
}

function createRedirect(url: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, request.url));
}

function createLoginRedirect(request: NextRequest): NextResponse {
  return createRedirect("/login", request);
}

function matchesPattern(pathname: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    return pathname.startsWith(pattern);
  }
  return pattern.test(pathname);
}

// ===== ROUTE HANDLERS =====

function handleDashboardRoutes(
  pathname: string,
  auth: Auth | null,
  request: NextRequest
): NextResponse | null {
  // Handle /dashboard root - redirect to role-specific dashboard
  if (pathname === "/dashboard") {
    if (!auth?.role) {
      return createLoginRedirect(request);
    }
    
    const dashboard = ROLE_DASHBOARDS[auth.role];
    return dashboard ? createRedirect(dashboard, request) : createLoginRedirect(request);
  }

  // Handle specific dashboard routes
  for (const { path, allowedRoles } of DASHBOARD_ROUTES) {
    if (pathname.startsWith(path)) {
      if (!auth?.role) {
        return createLoginRedirect(request);
      }
      
      if (!allowedRoles.includes(auth.role)) {
        // Redirect to user's appropriate dashboard
        const userDashboard = ROLE_DASHBOARDS[auth.role];
        return userDashboard ? createRedirect(userDashboard, request) : createLoginRedirect(request);
      }
      
      // User has access
      return null;
    }
  }

  return null;
}

function handlePublicRoutes(
  pathname: string, 
  auth: Auth | null, 
  request: NextRequest
): NextResponse | null {
  // Redirect logged-in users away from auth pages
  const isAuthPage = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  if (isAuthPage && auth?.role) {
    const dashboard = ROLE_DASHBOARDS[auth.role];
    return dashboard ? createRedirect(dashboard, request) : null;
  }

  return null;
}

function handleApiRoutes(
  pathname: string,
  auth: Auth | null, 
  request: NextRequest
): NextResponse | null {
  const method = request.method as HttpMethod;

  for (const route of API_ROUTES) {
    if (matchesPattern(pathname, route.pattern)) {
      // Check method restrictions
      if (route.methods && !route.methods.includes(method)) {
        continue; // Try next route
      }

      // Handle public routes
      if (route.isPublic) {
        return null; // Allow access
      }

      // Handle custom logic
      if (route.customHandler) {
        const hasAccess = route.customHandler(pathname, method, auth);
        return hasAccess ? null : createLoginRedirect(request);
      }

      // Handle role-based access
      if (route.roles) {
        if (!auth?.role) {
          return createLoginRedirect(request);
        }
        
        if (!route.roles.includes(auth.role)) {
          return createLoginRedirect(request);
        }
        
        return null; // Allow access
      }

      // If no specific rules, deny by default
      return createLoginRedirect(request);
    }
  }

  // No matching route found - deny access
  return createLoginRedirect(request);
}

// ===== MAIN MIDDLEWARE =====
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const auth = getAuthFromRequest(request);

  // Handle dashboard routes
  if (pathname.startsWith("/dashboard") || pathname === "/dashboard") {
    const dashboardResponse = handleDashboardRoutes(pathname, auth, request);
    if (dashboardResponse) return dashboardResponse;
  }

  // Handle public route redirects
  const publicRouteResponse = handlePublicRoutes(pathname, auth, request);
  if (publicRouteResponse) return publicRouteResponse;

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    const apiResponse = handleApiRoutes(pathname, auth, request);
    if (apiResponse) return apiResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard", 
    "/login/:path*",
    "/signup/:path*",
    "/api/:path*",
  ],
};

// ===== QUICK REFERENCE FOR ADDING ROUTES =====
/*

TO ADD NEW DASHBOARD ROUTES:
1. Add role to ROLE_DASHBOARDS
2. Add config to DASHBOARD_ROUTES

TO ADD NEW API ROUTES:
Add to API_ROUTES array with one of these patterns:

// Public route
{
  pattern: "/api/public/endpoint",
  isPublic: true,
}

// Role-based route
{
  pattern: "/api/routes/newfeature", 
  roles: ["admin", "super-admin"],
}

// Method-specific route
{
  pattern: "/api/routes/data",
  methods: ["GET"],
  roles: ["user", "admin"],
}

// Regex pattern
{
  pattern: /\/api\/routes\/items\/\d+$/,
  roles: ["vendor", "admin"],
}

// Complex custom logic
{
  pattern: "/api/routes/complex",
  customHandler: (pathname, method, auth) => {
    // Your custom logic here
    return auth?.role === "admin" && method === "POST";
  },
}

EXAMPLES:
- Want to make /api/routes/reports public? Add: { pattern: "/api/routes/reports", isPublic: true }
- Want only vendors to access /api/routes/inventory? Add: { pattern: "/api/routes/inventory", roles: ["vendor", "admin", "super-admin"] }
- Want different methods to have different access? Add multiple entries with different methods arrays

*/