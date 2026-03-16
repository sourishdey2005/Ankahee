import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/login"]);

export default convexAuthNextjsMiddleware((request, { isAuthenticated }) => {
  if (!isLoginPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
  if (isLoginPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/feed");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
