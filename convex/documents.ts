import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Non autorisé : veuillez vous connecter pour envoyer des documents");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    titre: v.string(),
    storageId: v.id("_storage"),
    type: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Non autorisé : veuillez vous connecter");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq("email", identity.email))
      .first();

    const auteur = identity.name || identity.email || "Utilisateur";

    const docId = await ctx.db.insert("documents", {
      titre: args.titre,
      storageId: args.storageId,
      type: args.type,
      size: args.size,
      auteur,
      createdBy: user?._id,
      createdAt: Date.now(),
    });

    return docId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    return await Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
      }))
    );
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Non autorisé");
    }

    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("Document introuvable");
    }

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(args.id);
  },
});
