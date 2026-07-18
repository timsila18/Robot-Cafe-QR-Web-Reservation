import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth-token";

const ADMIN_COOKIE = "robot_admin_session";
const hostessEmails = new Set(["lana@robotcafe.co.ke", "imaara@robotcafe.co.ke"]);

const routeAccessByEmail: Record<string, string[]> = {
  "admin@robotcafe.co.ke": ["/admin", "/api/admin"],
  "gm@robotcafe.co.ke": ["/admin", "/api/admin"],
  "content@robotcafe.co.ke": ["/admin/menu", "/admin/categories", "/api/admin/menu-items", "/api/admin/categories", "/api/admin/images", "/api/admin/logout"],
  "imaara.manager@robotcafe.co.ke": [
    "/admin",
    "/admin/menu",
    "/admin/qr-codes",
    "/admin/analytics",
    "/admin/feedback",
    "/admin/reservations",
    "/api/admin/menu-items",
    "/api/admin/images",
    "/api/admin/reservations",
    "/api/admin/feedback",
    "/api/admin/dashboard",
    "/api/admin/logout",
  ],
  "lana@robotcafe.co.ke": ["/admin/reservations", "/api/admin/reservations", "/api/admin/logout"],
  "imaara@robotcafe.co.ke": ["/admin/reservations", "/api/admin/reservations", "/api/admin/logout"],
};

const routeAccessByRole: Record<string, string[]> = {
  super_admin: ["/admin", "/api/admin"],
  general_manager: ["/admin", "/api/admin"],
  branch_manager: [
    "/admin",
    "/admin/menu",
    "/admin/qr-codes",
    "/admin/analytics",
    "/admin/feedback",
    "/admin/reservations",
    "/api/admin/menu-items",
    "/api/admin/images",
    "/api/admin/reservations",
    "/api/admin/feedback",
    "/api/admin/dashboard",
    "/api/admin/logout",
  ],
  content_manager: ["/admin/menu", "/admin/categories", "/api/admin/menu-items", "/api/admin/categories", "/api/admin/images", "/api/admin/logout"],
  hostess: ["/admin/reservations", "/api/admin/reservations", "/api/admin/logout"],
};

function hasRouteAccess(email: string, role: string | undefined, pathname: string) {
  const allowedPrefixes = routeAccessByEmail[email] ?? (role ? routeAccessByRole[role] : undefined);
  if (!allowedPrefixes) return false;
  return allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if ((!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) || pathname === "/admin/login" || pathname === "/api/admin/login") {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  const adminSession = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const adminEmail = adminSession?.email;
  const isAuthenticated = Boolean(adminEmail);
  const isHostess = adminEmail ? hostessEmails.has(adminEmail) : false;

  if (!isAuthenticated) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminEmail && isHostess && pathname.startsWith("/admin") && pathname !== "/admin/reservations" && !pathname.startsWith("/api/admin/reservations") && pathname !== "/api/admin/logout") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Hostess access is limited to reservations." }, { status: 403 });
    }
    const reservationsUrl = request.nextUrl.clone();
    reservationsUrl.pathname = "/admin/reservations";
    return NextResponse.redirect(reservationsUrl);
  }

  if (adminEmail && !hasRouteAccess(adminEmail, adminSession?.role, pathname)) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "You do not have access to this admin action." }, { status: 403 });
    }
    const fallbackUrl = request.nextUrl.clone();
    fallbackUrl.pathname = hostessEmails.has(adminEmail) ? "/admin/reservations" : "/admin";
    return NextResponse.redirect(fallbackUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
