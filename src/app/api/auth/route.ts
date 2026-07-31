import { fetchAction } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

const localhostPattern = /(localhost|127\.0\.0\.1|\[::1\])/;

function isLocalhost(host: string | null): boolean {
  return host !== null && localhostPattern.test(host);
}

function getCookiePrefix(host: string | null) {
  return isLocalhost(host) ? "" : "__Host-";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, args } = body ?? {};

    if (action !== "auth:signIn" && action !== "auth:signOut") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const convexUrl =
      process.env.NEXT_PUBLIC_CONVEX_URL ||
      "https://shiny-wolverine-92.convex.cloud";

    const prefix = getCookiePrefix(request.headers.get("host"));
    const tokenCookie =
      request.cookies.get(`${prefix}__convexAuthJWT`)?.value ||
      request.cookies.get("__convexAuthJWT")?.value ||
      null;
    const refreshCookie =
      request.cookies.get(`${prefix}__convexAuthRefreshToken`)?.value ||
      request.cookies.get("__convexAuthRefreshToken")?.value ||
      null;

    const requestArgs = args ?? {};
    const isRefreshFlow =
      action === "auth:signIn" && requestArgs.refreshToken !== undefined;

    if (isRefreshFlow) {
      if (refreshCookie === null) {
        return NextResponse.json({ tokens: null });
      }
      requestArgs.refreshToken = refreshCookie;
    }

    const fetchActionOptions: any = { url: convexUrl };
    if (!isRefreshFlow && tokenCookie) {
      fetchActionOptions.token = tokenCookie;
    }

    const result: any = await fetchAction(action as any, requestArgs, fetchActionOptions);

    if (!result) {
      return NextResponse.json(
        { error: "Empty response from authentication provider" },
        { status: 500 },
      );
    }

    if (action === "auth:signOut") {
      const response = NextResponse.json(null);
      response.cookies.delete(`${prefix}__convexAuthJWT`);
      response.cookies.delete(`${prefix}__convexAuthRefreshToken`);
      response.cookies.delete("__convexAuthJWT");
      response.cookies.delete("__convexAuthRefreshToken");
      return response;
    }

    const response = NextResponse.json(
      result.tokens
        ? { tokens: { token: result.tokens.token, refreshToken: "dummy" } }
        : result,
    );

    if (result.tokens?.token) {
      response.cookies.set(`${prefix}__convexAuthJWT`, result.tokens.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost(request.headers.get("host")),
      });
    }

    if (result.tokens?.refreshToken) {
      response.cookies.set(`${prefix}__convexAuthRefreshToken`, result.tokens.refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: !isLocalhost(request.headers.get("host")),
      });
    }

    return response;
  } catch (err: any) {
    console.error("Auth API Route Error:", err);
    return NextResponse.json(
      { error: err?.message || "Échec de l'authentification" },
      { status: 500 },
    );
  }
}
