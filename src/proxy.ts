import { auth } from "@/auth";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Skip auth-related paths
  if (request.nextUrl.pathname === "/admin/login") return;

  const session = await auth();
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
