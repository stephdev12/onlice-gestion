import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentProfile } from "./access";

export const stats = query({
  args: { period: v.optional(v.string()) }, // "mois" | "trimestre"
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    const isCeo = profile.role === "ceo";
    const period = args.period || "mois";
    const prospects = await ctx.db.query("prospects").collect();
    const projects = await ctx.db.query("projects").collect();
    const employees = await ctx.db.query("employees").collect();
    const pendingDemandes = await ctx.db
      .query("demandes")
      .withIndex("by_statut", (q) => q.eq("statut", "en_attente"))
      .collect();

    const lateProjects = projects.filter((p) => {
      // Checked if default deadline is past
      const today = new Date().toISOString().split("T")[0];
      return p.echeanceDefaut < today;
    }).length;

    return {
      prospectsActifs: prospects.length,
      projetsTotal: projects.length,
      projetsRetard: lateProjects,
      employesTotal: employees.length,
      demandesEnAttente: pendingDemandes.length,
    };
  },
});
