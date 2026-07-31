import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const CEO_EMAIL = "admin@onlice.com";

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .unique();

    if (existingProfile) {
      return existingProfile;
    }

    const firstProfile = await ctx.db.query("profiles").first();
    const user = await ctx.db.get(userId);
    const isConfiguredCeo = user?.email?.trim().toLowerCase() === CEO_EMAIL;
    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: isConfiguredCeo || !firstProfile ? "ceo" : "employe",
    });

    if (!isConfiguredCeo && firstProfile && user?.email) {
      const employee = await ctx.db
        .query("employees")
        .withIndex("by_email", (query) => query.eq("email", user.email))
        .unique();

      if (employee) {
        await ctx.db.patch(employee._id, { userId });
        await ctx.db.patch(profileId, { role: employee.role });
      }
    }

    return await ctx.db.get(profileId);
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .unique();
  },
});