import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Onlice ERP",
    short_name: "Onlice",
    description: "Plateforme de gestion startup",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d161d",
    lang: "fr",
    icons: [
      {
        src: "/logo_icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo_icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
