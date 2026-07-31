import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, args } = body || {};

    if (action !== "auth:signIn" && action !== "auth:signOut") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL is not defined" }, { status: 500 });
    }

    const isLocalhost = request.headers.get("host")?.includes("localhost") ?? true;
    const prefix = isLocalhost ? "" : "__Host-";

    if (action === "auth:signOut") {
      const response = NextResponse.json(null);
      response.cookies.delete(`${prefix}__convexAuthJWT`);
      response.cookies.delete(`${prefix}__convexAuthRefreshToken`);
      return response;
    }

    const result: any = await fetchAction("auth:signIn" as any, args || {}, {
      url: convexUrl,
    });

    if (!result) {
      return NextResponse.json({ error: "Empty response from authentication provider" }, { status: 500 });
    }

    const responseData = result.tokens
      ? { tokens: { token: result.tokens.token, refreshToken: "dummy" } }
      : result;

    const response = NextResponse.json(responseData);

    if (result.tokens?.token) {
      response.cookies.set(`${prefix}__convexAuthJWT`, result.tokens.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost,
      });
    }

    if (result.tokens?.refreshToken) {
      response.cookies.set(`${prefix}__convexAuthRefreshToken`, result.tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost,
      });
    }

    return response;
  } catch (err: any) {
    console.error("Auth API Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Échec de l'authentification" },
      { status: 400 }
    );
  }
}
