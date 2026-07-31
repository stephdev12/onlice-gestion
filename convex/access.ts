import { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

type AuthenticatedContext = QueryCtx | MutationCtx;

export async function requireAuthenticated(ctx: AuthenticatedContext) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function getCurrentProfile(ctx: AuthenticatedContext) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_userId", (query) => query.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new Error("User profile is not initialized");
  }

  return profile;
}

export async function requireAdmin(ctx: AuthenticatedContext) {
  const profile = await getCurrentProfile(ctx);
  if (profile.role !== "admin" && profile.role !== "ceo") {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function requireCeo(ctx: AuthenticatedContext) {
  const profile = await getCurrentProfile(ctx);
  if (profile.role !== "ceo") {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function getCurrentEmployee(ctx: AuthenticatedContext) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  return await ctx.db
    .query("employees")
    .withIndex("by_userId", (query) => query.eq("userId", userId))
    .unique();
}