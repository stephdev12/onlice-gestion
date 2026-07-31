import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("prospects").collect();
  },
});

export const getById = query({
  args: { id: v.id("prospects") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const prospect = await ctx.db.get(args.id);
    if (!prospect) return null;
    const events = await ctx.db
      .query("prospectEvents")
      .withIndex("by_prospect", (q) => q.eq("prospectId", args.id))
      .collect();
    return { ...prospect, timeline: events };
  },
});

export const create = mutation({
  args: {
    nom: v.string(),
    entreprise: v.optional(v.string()),
    tel: v.optional(v.string()),
    origine: v.string(),
    action: v.optional(v.string()),
    rep: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const prospectId = await ctx.db.insert("prospects", {
      nom: args.nom,
      entreprise: args.entreprise,
      tel: args.tel,
      origine: args.origine,
      stage: "nouveau",
      action: args.action,
      rep: args.rep || "MK",
    });

    const now = new Date();
    const months = ['janv.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    await ctx.db.insert("prospectEvents", {
      prospectId,
      label: "Création du prospect",
      date: formattedDate,
      type: "creation",
    });

    return prospectId;
  },
});

export const moveStage = mutation({
  args: {
    id: v.id("prospects"),
    newStage: v.string(),
    stageLabel: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { stage: args.newStage });

    const now = new Date();
    const months = ['janv.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    await ctx.db.insert("prospectEvents", {
      prospectId: args.id,
      label: `Déplacé vers "${args.stageLabel}"`,
      date: formattedDate,
      type: "move",
    });
  },
});

export const addNote = mutation({
  args: {
    id: v.id("prospects"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = new Date();
    const months = ['janv.','fév.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]}, ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    await ctx.db.insert("prospectEvents", {
      prospectId: args.id,
      label: args.text,
      date: formattedDate,
      type: "note",
    });
  },
});
