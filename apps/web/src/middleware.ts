import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware для защиты маршрутов и перенаправления неавторизованных пользователей
export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth;
  const isOnProjects = req.nextUrl.pathname.startsWith("/projects");
  const isOnAuth = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  // Если пользователь не авторизован и пытается зайти в проекты — на логин
  if (isOnProjects && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Если пользователь авторизован и заходит на страницы логина — на проекты
  if (isOnAuth && isLoggedIn) {
    return NextResponse.redirect(new URL("/projects", req.nextUrl));
  }

  return NextResponse.next();
});

// Настройка путей, которые обрабатывает Middleware
export const config = {
  matcher: ["/projects/:path*", "/login", "/register"],
};
