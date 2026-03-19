import { auth } from "@/auth"; 
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing"; 
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const authPages = ["/login", "/register"]; 
const protectedPages = ["/profile", "/admin"]; 
const adminPages = ["/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  const firstSegment = nextUrl.pathname.split("/")[1];
  
  const hasLocale = (routing.locales as readonly string[]).includes(firstSegment);
  
  const pathname = hasLocale 
    ? nextUrl.pathname.replace(`/${firstSegment}`, "") || "/" 
    : nextUrl.pathname;

  const redirectTo = (path: string) => {
    const url = nextUrl.clone();
    url.pathname = hasLocale ? `/${firstSegment}${path}` : path;
    return NextResponse.redirect(url);
  };

  if (isLoggedIn && authPages.includes(pathname)) {
    return redirectTo("/profile");
  }

  if (!isLoggedIn && protectedPages.some(route => pathname.startsWith(route))) {
    return redirectTo("/login");
  }

  if (adminPages.some(route => pathname.startsWith(route))) {
    if (userRole !== "ADMIN") {
      return redirectTo("/profile");
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};