import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isApproved = Boolean(token?.isAdmin || token?.approved);

        if (req.nextUrl.pathname === "/auth") {
            if (token && isApproved) {
                const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/";
                return NextResponse.redirect(new URL(callbackUrl, req.url));
            }

            return NextResponse.next();
        }

        if (token && !isApproved) {
            const url = new URL("/auth", req.url);
            url.searchParams.set("error", "PendingApproval");
            return NextResponse.redirect(url);
        }
    },
    {
        secret: process.env.NEXTAUTH_SECRET,
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname === "/auth") {
                    return true;
                }

                if (!token) {
                    return false;
                }

                return Boolean(token.isAdmin || token.approved);
            },
        },
        pages: {
            signIn: "/auth",
        },
    }
);

export const config = {
    matcher: [
        "/((?!api/auth|api/register|_next/static|_next/image|favicon.ico|images).*)",
    ],
};
