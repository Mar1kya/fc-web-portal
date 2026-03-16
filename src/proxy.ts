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
  const locale = nextUrl.pathname.split("/")[1] || routing.defaultLocale;
  const pathname = nextUrl.pathname.replace(new RegExp(`^/(${routing.locales.join("|")})`), "") || "/";

  if (isLoggedIn && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}/profile`, nextUrl));
  }

  if (!isLoggedIn && protectedPages.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(`/${locale}/login`, nextUrl));
  }

  if (adminPages.some(route => pathname.startsWith(route))) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/profile`, nextUrl));
    }
  }
  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};