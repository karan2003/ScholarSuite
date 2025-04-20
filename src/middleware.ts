// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define your route access matrix
export const routeAccessMap: Record<string, string[]> = {
  "/admin": ["admin"],
  "/student": ["student"],
  "/teacher": ["teacher"],
  "/dashboard": ["admin", "teacher"],
  "/profile": ["admin", "teacher", "student"],
};

// Create route matchers with proper types
const protectedRoutes = Object.entries(routeAccessMap).map(([route, roles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: roles,
}));

// Fallback routes for role resolution
const roleBasePaths: Record<string, string> = {
  admin: "/dashboard",
  student: "/student",
  teacher: "/teacher",
};

export default clerkMiddleware((auth, req: NextRequest) => {
  // Handle public routes
  const isPublicRoute = ["/", "/sign-in", "/sign-up"].some(path =>
    req.nextUrl.pathname.startsWith(path)
  );
  
  if (isPublicRoute) return NextResponse.next();

  // Get authenticated state
  const { sessionClaims, userId } = auth();
  
  // Handle unauthenticated access to protected routes
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Resolve user role with type safety
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase() || "";
  const basePath = roleBasePaths[role] || "/dashboard";

  // Validate route access
  for (const { matcher, allowedRoles } of protectedRoutes) {
    if (matcher(req)) {
      const hasAccess = allowedRoles.includes(role);
      
      if (!hasAccess) {
        // Redirect to role-specific home or unauthorized
        const redirectPath = role ? basePath : "/unauthorized";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      
      break; // Stop checking after first match
    }
  }

  // Add security headers for protected routes
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};