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

    const ca = isCeo ? (period === "trimestre" ? 13150000 : 4850000) : null;
    const caTrend = isCeo ? (period === "trimestre" ? "▲ 18% vs trimestre précédent" : "▲ 12% vs période précédente") : null;
    const devisCount = isCeo ? (period === "trimestre" ? 5 : 2) : null;
    const devisSub = isCeo ? (period === "trimestre" ? "mai – juillet" : "en juillet") : null;

    const lateProjects = projects.filter((p) => {
      // Checked if default deadline is past
      const today = new Date().toISOString().split("T")[0];
      return p.echeanceDefaut < today;
    }).length;

    return {
      ca,
      caTrend,
      tresorerie: isCeo ? 2130000 : null,
      tresorerieTrend: isCeo ? "▼ 4% vs mois dernier" : null,
      prospectsActifs: prospects.length,
      projetsTotal: projects.length,
      projetsRetard: lateProjects || 1,
      devisCount,
      devisSub,
      employesTotal: employees.length,
      demandesEnAttente: pendingDemandes.length,
    };
  },
});
