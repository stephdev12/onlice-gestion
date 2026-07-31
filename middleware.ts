import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

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
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  // Run middleware on all app routes and API routes so convexAuthNextjsMiddleware can proxy /api/auth
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
