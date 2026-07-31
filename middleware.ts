import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";

const isSignInPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/pipeline(.*)",
  "/projets(.*)",
  "/equipe(.*)",
  "/finance(.*)",
  "/documents(.*)",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  console.log("[MW] path =", request.nextUrl.pathname, "method =", request.method);

  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
