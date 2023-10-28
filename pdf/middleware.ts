export const config = {
  matcher: ["/dashboard/:path*, /auth-callback"],
};

export { default } from "next-auth/middleware";
