import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "robot_admin_session";
const ADMIN_EMAIL_COOKIE = "robot_admin_email";
const hostessEmails = new Set(["lana@robotcafe.co.ke", "imaara@robotcafe.co.ke"]);

export function middleware(request: NextRequest) {
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

  const isAuthenticated = request.cookies.get(ADMIN_COOKIE)?.value === "active";
  const adminEmail = request.cookies.get(ADMIN_EMAIL_COOKIE)?.value ?? "";
  const isHostess = hostessEmails.has(adminEmail);

  if (!isAuthenticated) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isHostess && pathname.startsWith("/admin") && pathname !== "/admin/reservations" && !pathname.startsWith("/api/admin/reservations") && pathname !== "/api/admin/logout") {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ ok: false, error: "Hostess access is limited to reservations." }, { status: 403 });
    }
    const reservationsUrl = request.nextUrl.clone();
    reservationsUrl.pathname = "/admin/reservations";
    return NextResponse.redirect(reservationsUrl);
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
