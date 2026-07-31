import { proxyAuthActionToConvex } from "@convex-dev/auth/nextjs/server/proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await proxyAuthActionToConvex(request);
}
