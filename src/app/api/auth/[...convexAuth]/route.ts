import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://shiny-wolverine-92.convex.site";
  const url = new URL(request.url);
  const targetUrl = `${convexSiteUrl}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(convexSiteUrl).host);

  const body = request.method !== "GET" && request.method !== "HEAD" ? await request.blob() : undefined;

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(res.headers);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("Convex Auth proxy error:", err);
    return NextResponse.json({ error: "Failed to connect to Convex Auth backend" }, { status: 502 });
  }
}
