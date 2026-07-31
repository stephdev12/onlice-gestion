import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

const localhostPattern = /(localhost|127\.0\.0\.1|\[::1\])/;

function isLocalhost(host: string | null): boolean {
  return host !== null && localhostPattern.test(host);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, args } = body || {};

    if (action !== "auth:signIn" && action !== "auth:signOut") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const result: any = await fetchAction(action as any, args || {}, {
      url: convexUrl,
    });

    if (!result) {
      return NextResponse.json({ error: "Empty response from authentication provider" }, { status: 500 });
    }

    const isLocal = isLocalhost(request.headers.get("host"));
    const prefix = isLocal ? "" : "__Host-";

    const response = NextResponse.json(
      result.tokens
        ? { tokens: { token: result.tokens.token, refreshToken: "dummy" } }
        : result,
    );

    if (action === "auth:signOut") {
      response.cookies.delete(`${prefix}__convexAuthJWT`);
      response.cookies.delete(`${prefix}__convexAuthRefreshToken`);
      return response;
    }

    if (result.tokens?.token) {
      response.cookies.set(`${prefix}__convexAuthJWT`, result.tokens.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocal,
      });
    }

    if (result.tokens?.refreshToken) {
      response.cookies.set(`${prefix}__convexAuthRefreshToken`, result.tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocal,
      });
    }

    return response;
  } catch (err: any) {
    console.error("Auth API Route Error:", err);
    return NextResponse.json(
      { error: err.message || "Échec de l'authentification" },
      { status: 400 },
    );
  }
}
