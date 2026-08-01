import { proxyAuthActionToConvex } from "@convex-dev/auth/nextjs/server/proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }
  return proxyAuthActionToConvex(request, {
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  });
}
