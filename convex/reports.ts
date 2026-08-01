import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentEmployee, getCurrentProfile, requireAdmin } from "./access";

export const submitMine = mutation({
  args: {
    periodeType: v.union(v.literal("journalier"), v.literal("hebdomadaire")),
    dateRef: v.string(),
    realisations: v.string(),
    objectifs: v.optional(v.string()),
    problemes: v.optional(v.string()),
    previsions: v.optional(v.string()),
    humeur: v.union(v.literal("excellent"), v.literal("bon"), v.literal("moyen"), v.literal("difficile")),
  },
  handler: async (ctx, args) => {
    const employee = await getCurrentEmployee(ctx);
    if (!employee) {
      throw new Error("Only employees can submit this report");
    }

    return await ctx.db.insert("rapports", {
      employeId: employee._id,
      periodeType: args.periodeType,
      semaine: args.dateRef,
      realisations: args.realisations,
      objectifs: args.objectifs,
      problemes: args.problemes,
      previsions: args.previsions,
      humeur: args.humeur,
      createdAt: Date.now(),
      statut: "a_valider",
    });
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const employee = await getCurrentEmployee(ctx);
    if (!employee) return [];

    return await ctx.db
      .query("rapports")
      .withIndex("by_employe", (q) => q.eq("employeId", employee._id))
      .order("desc")
      .take(100);
  },
});

export const reviewList = query({
  args: { status: v.optional(v.union(v.literal("a_valider"), v.literal("valide"))) },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile || (profile.role !== "admin" && profile.role !== "ceo")) {
      throw new Error("Unauthorized");
    }

    const status = args.status || "a_valider";
    const reports = await ctx.db
      .query("rapports")
      .withIndex("by_statut", (q) => q.eq("statut", status))
      .order("desc")
      .take(200);

    const enriched = await Promise.all(
      reports.map(async (report) => {
        const employee = await ctx.db.get(report.employeId);
        return {
          ...report,
          employeNom: employee?.nom || "Inconnu",
          employeInitials: employee?.initials || "??",
          employePoste: employee?.poste || employee?.departement || "Employe",
        };
      })
    );

    return enriched;
  },
});

export const validate = mutation({
  args: { id: v.id("rapports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { statut: "valide" });
  },
});
