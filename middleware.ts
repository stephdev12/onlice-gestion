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
  const url = new URL(request.url);
  // Never intercept or redirect auth API requests
  if (url.pathname.startsWith("/api/auth")) {
    return;
  }

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
