const convexSiteUrl =
  process.env.CONVEX_SITE_URL ||
  process.env.NEXT_PUBLIC_CONVEX_SITE_URL ||
  process.env.NEXT_PUBLIC_CONVEX_URL ||
  "https://shiny-wolverine-92.convex.cloud";

export default {
  providers: [
    {
      domain: convexSiteUrl,
      applicationID: "convex",
    },
  ],
};
