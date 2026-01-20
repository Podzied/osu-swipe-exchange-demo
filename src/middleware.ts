import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";
  const { pathname } = req.nextUrl;

  // Public routes
  const publicRoutes = ["/", "/login"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
