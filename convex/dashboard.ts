import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentProfile, getCurrentEmployee } from "./access";
import { computeFinanceSummary } from "./finance";

export const stats = query({
  args: { period: v.optional(v.string()) }, // "mois" | "trimestre"
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) {
      return {
        role: "employe" as const,
        isCeo: false,
        isAdmin: false,
        ca: null,
        caTrend: null,
        tresorerie: null,
        tresorerieTrend: null,
        tresorerieUp: null,
        prospectsActifs: 0,
        projetsTotal: 0,
        projetsRetard: 0,
        employesTotal: 0,
        demandesEnAttente: 0,
        myTasksCount: 0,
      };
    }
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

    // Financial numbers strictly reserved for CEO, computed from the finance ledger
    const finance = isCeo ? await computeFinanceSummary(ctx, period) : null;
    const ca = finance ? finance.totalEntrees : null;
    const tresorerie = finance ? finance.balance : null;
    const caTrend = finance
      ? `Dépenses ${period === "trimestre" ? "du trimestre" : "du mois"} : ${finance.totalSorties.toLocaleString()} XAF`
      : null;
    const tresorerieTrend = finance
      ? `${finance.benefice >= 0 ? "▲" : "▼"} ${Math.abs(finance.benefice).toLocaleString()} XAF ce ${period}`
      : null;
    const tresorerieUp = finance ? finance.benefice >= 0 : null;

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
      tresorerieUp,
      prospectsActifs: prospects.length,
      projetsTotal: projects.length,
      projetsRetard: lateProjects,
      employesTotal: employees.length,
      demandesEnAttente: pendingDemandes.length,
      myTasksCount,
    };
  },
});
