import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentProfile, getCurrentEmployee } from "./access";

export const stats = query({
  args: { period: v.optional(v.string()) }, // "mois" | "trimestre"
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    const isCeo = profile.role === "ceo";
    const isAdmin = profile.role === "admin";
    const period = args.period || "mois";

    const prospects = (isAdmin || isCeo) ? await ctx.db.query("prospects").collect() : [];
    const projects = await ctx.db.query("projects").collect();
    const employees = (isAdmin || isCeo) ? await ctx.db.query("employees").collect() : [];
    const pendingDemandes = (isAdmin || isCeo)
      ? await ctx.db
          .query("demandes")
          .withIndex("by_statut", (q) => q.eq("statut", "en_attente"))
          .collect()
      : [];

    const today = new Date().toISOString().split("T")[0];
    const lateProjects = projects.filter((p) => p.echeanceDefaut < today).length;

    // Financial numbers strictly reserved for CEO
    const ca = isCeo ? (period === "trimestre" ? 13150000 : 4850000) : null;
    const caTrend = isCeo
      ? (period === "trimestre" ? "▲ 18% vs trimestre précédent" : "▲ 12% vs période précédente")
      : null;

    const tresorerie = isCeo ? 2130000 : null;
    const tresorerieTrend = isCeo ? "▼ 4% vs mois dernier" : null;

    // Assigned tasks count for employee
    let myTasksCount = 0;
    if (profile.role === "employe") {
      const emp = await getCurrentEmployee(ctx);
      if (emp) {
        const tasks = await ctx.db
          .query("tasks")
          .filter((q) => q.eq(q.field("assigneId"), emp._id))
          .collect();
        myTasksCount = tasks.length;
      }
    }

    return {
      role: profile.role,
      isCeo,
      isAdmin: isAdmin || isCeo,
      ca,
      caTrend,
      tresorerie,
      tresorerieTrend,
      prospectsActifs: prospects.length,
      projetsTotal: projects.length,
      projetsRetard: lateProjects,
      devisCount: isCeo ? (period === "trimestre" ? 5 : 2) : null,
      devisSub: isCeo ? (period === "trimestre" ? "mai – juillet" : "en juillet") : null,
      employesTotal: employees.length,
      demandesEnAttente: pendingDemandes.length,
      myTasksCount,
    };
  },
});
