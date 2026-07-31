"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://shiny-wolverine-92.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
