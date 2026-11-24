import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/login";
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!isLoginPage && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    if (request.nextUrl.pathname !== "/") {
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
