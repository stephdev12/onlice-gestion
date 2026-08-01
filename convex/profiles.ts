import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const CEO_EMAILS = ["admin@onlice.com", "admin@onlice.cm", "ceo@onlice.com", "ceo@onlice.cm"];

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    const userEmail = user?.email?.trim().toLowerCase() || "";

    const isConfiguredCeo =
      CEO_EMAILS.includes(userEmail) ||
      userEmail.startsWith("admin") ||
      userEmail.startsWith("ceo");

    // Check if there is an employee matching this user's email
    let matchingEmployee = null;
    if (userEmail) {
      matchingEmployee = await ctx.db
        .query("employees")
        .withIndex("by_email", (query) => query.eq("email", userEmail))
        .first();
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .unique();

    let targetRole: "ceo" | "admin" | "employe" = "employe";

    if (isConfiguredCeo) {
      targetRole = "ceo";
    } else if (matchingEmployee) {
      targetRole = matchingEmployee.role;
    } else {
      const firstProfile = await ctx.db.query("profiles").first();
      if (!firstProfile) {
        targetRole = "ceo";
      }
    }

    if (existingProfile) {
      if (existingProfile.role !== targetRole && (isConfiguredCeo || matchingEmployee)) {
        await ctx.db.patch(existingProfile._id, { role: targetRole });
        existingProfile.role = targetRole;
      }

      if (matchingEmployee && !matchingEmployee.userId) {
        await ctx.db.patch(matchingEmployee._id, { userId });
      }

      return existingProfile;
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      role: targetRole,
    });

    if (matchingEmployee && !matchingEmployee.userId) {
      await ctx.db.patch(matchingEmployee._id, { userId });
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

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .unique();

    if (!profile) return null;

    const user = await ctx.db.get(userId);
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_userId", (query) => query.eq("userId", userId))
      .first();

    return {
      ...profile,
      email: user?.email,
      name: user?.name || employee?.nom || user?.email?.split("@")[0] || "Utilisateur",
      employeeId: employee?._id,
    };
  },
});

export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("ceo"), v.literal("admin"), v.literal("employe")),
  },
  handler: async (ctx, args) => {
    const callerUserId = await getAuthUserId(ctx);
    if (!callerUserId) throw new Error("Not authenticated");

    const callerProfile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", callerUserId))
      .unique();

    if (callerProfile?.role !== "ceo") {
      throw new Error("Seul le CEO peut modifier les rôles utilisateur");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (query) => query.eq("userId", args.userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, { role: args.role });
    } else {
      await ctx.db.insert("profiles", { userId: args.userId, role: args.role });
    }
  },
});

export const setName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // patch the users record so `profiles.current` can read `user?.name`
    await ctx.db.patch(userId, { name: args.name });
  },
});