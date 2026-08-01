import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { requireCeo } from "./access";
import { getAuthUserId } from "@convex-dev/auth/server";

const MONTH_LABELS = ["Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

// Shared by convex/dashboard.ts so the KPIs and the finance page never drift apart.
export async function computeFinanceSummary(ctx: QueryCtx, period: string) {
  const entries = await ctx.db.query("financeEntries").collect();

  const now = new Date();
  const periodStart = new Date(now);
  if (period === "trimestre") {
    periodStart.setMonth(periodStart.getMonth() - 3);
  } else {
    periodStart.setMonth(periodStart.getMonth() - 1);
  }
  const periodStartStr = periodStart.toISOString().split("T")[0];

  const inPeriod = entries.filter((e) => e.date >= periodStartStr);
  const totalEntrees = inPeriod.filter((e) => e.type === "entree").reduce((s, e) => s + e.montant, 0);
  const totalSorties = inPeriod.filter((e) => e.type === "sortie").reduce((s, e) => s + e.montant, 0);
  const benefice = totalEntrees - totalSorties;

  // Current cash position: running balance over every entry ever recorded.
  const balance = entries.reduce((s, e) => s + (e.type === "entree" ? e.montant : -e.montant), 0);

  const months: { label: string; revenu: number; depense: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthEntries = entries.filter((e) => {
      const parsed = new Date(e.date);
      return parsed.getFullYear() === year && parsed.getMonth() === month;
    });
    months.push({
      label: MONTH_LABELS[month],
      revenu: monthEntries.filter((e) => e.type === "entree").reduce((s, e) => s + e.montant, 0),
      depense: monthEntries.filter((e) => e.type === "sortie").reduce((s, e) => s + e.montant, 0),
    });
  }

  const sourceTotals = new Map<string, number>();
  for (const e of entries) {
    if (e.type === "entree" && e.source) {
      sourceTotals.set(e.source, (sourceTotals.get(e.source) ?? 0) + e.montant);
    }
  }
  const topSources = Array.from(sourceTotals.entries())
    .map(([source, montant]) => ({ source, montant }))
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  return { totalEntrees, totalSorties, benefice, balance, months, topSources };
}

export const summary = query({
  args: { period: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireCeo(ctx);
    return await computeFinanceSummary(ctx, args.period || "mois");
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireCeo(ctx);
    return await ctx.db.query("financeEntries").order("desc").take(100);
  },
});

export const create = mutation({
  args: {
    type: v.union(v.literal("entree"), v.literal("sortie")),
    montant: v.number(),
    date: v.string(),
    source: v.optional(v.string()),
    motif: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireCeo(ctx);
    if (args.montant <= 0) {
      throw new Error("Le montant doit être positif");
    }
    const userId = await getAuthUserId(ctx);
    return await ctx.db.insert("financeEntries", {
      type: args.type,
      montant: args.montant,
      date: args.date,
      source: args.source,
      motif: args.motif,
      description: args.description,
      createdBy: userId ?? undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("financeEntries") },
  handler: async (ctx, args) => {
    await requireCeo(ctx);
    await ctx.db.delete(args.id);
  },
});
