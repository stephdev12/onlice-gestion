import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { PwaRegistrar } from "@/components/layout/PwaRegistrar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onlice ERP — Plateforme de Gestion Startup",
  description: "Solution ERP moderne pour startups : CRM, Projets, RH et Finance.",
  icons: [
    { rel: "icon", url: "/logo_icon.png" },
    { rel: "apple-touch-icon", url: "/logo_icon.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="fr">
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <PwaRegistrar />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
