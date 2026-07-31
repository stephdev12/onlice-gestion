import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentProfile, requireAdmin } from "./access";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const employees = await ctx.db.query("employees").collect();
    const result = await Promise.all(
      employees.map(async (emp) => {
        const report = await ctx.db
          .query("rapports")
          .withIndex("by_employe", (q) => q.eq("employeId", emp._id))
          .filter((q) => q.eq(q.field("statut"), "a_valider"))
          .first();
        return {
          ...emp,
          hasPendingReport: !!report,
        };
      })
    );
    return result;
  },
});

export const pendingDemandes = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_statut", (q) => q.eq("statut", "en_attente"))
      .collect();

    const result = await Promise.all(
      demandes.map(async (d) => {
        const emp = await ctx.db.get(d.employeId);
        return {
          ...d,
          employeNom: emp?.nom || "Inconnu",
          employeInitials: emp?.initials || "??",
        };
      })
    );
    return result;
  },
});

export const getById = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const emp = await ctx.db.get(args.id);
    if (!emp) return null;

    const demandes = await ctx.db
      .query("demandes")
      .withIndex("by_employe", (q) => q.eq("employeId", args.id))
      .collect();

    const rapports = await ctx.db
      .query("rapports")
      .withIndex("by_employe", (q) => q.eq("employeId", args.id))
      .collect();

    return { ...emp, demandes, rapports };
  },
});

export const create = mutation({
  args: {
    nom: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("employe")),
    poste: v.optional(v.string()),
    departement: v.string(),
    embauche: v.optional(v.string()),
    dispo: v.string(),
    competences: v.array(v.string()),
    salaire: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const profile = await requireAdmin(ctx);
    if (args.role === "admin" && profile.role !== "ceo") {
      throw new Error("Only the CEO can create an administrator");
    }

    const existingEmployee = await ctx.db
      .query("employees")
      .withIndex("by_email", (query) => query.eq("email", args.email))
      .unique();
    if (existingEmployee) throw new Error("An employee already uses this email");

    const initials = args.nom
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const email = args.email.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .filter((query) => query.eq(query.field("email"), email))
      .first();

    const employeeId = await ctx.db.insert("employees", {
      nom: args.nom,
      email,
      userId: user?._id,
      role: args.role,
      initials,
      poste: args.poste,
      departement: args.departement,
      embauche: args.embauche,
      dispo: args.dispo,
      competences: args.competences,
      solde: args.dispo === "freelance" ? null : 25,
      salaire: args.salaire,
    });

    if (user) {
      const userProfile = await ctx.db
        .query("profiles")
        .withIndex("by_userId", (query) => query.eq("userId", user._id))
        .unique();
      if (userProfile) await ctx.db.patch(userProfile._id, { role: args.role });
    }

    return employeeId;
  },
});

export const updateDemandeStatus = mutation({
  args: {
    id: v.id("demandes"),
    statut: v.string(), // approuve, refuse
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { statut: args.statut });
  },
});

export const createDemande = mutation({
  args: {
    employeId: v.id("employees"),
    type: v.string(),
    debut: v.string(),
    fin: v.string(),
    motif: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("demandes", {
      employeId: args.employeId,
      type: args.type,
      debut: args.debut,
      fin: args.fin || args.debut,
      motif: args.motif,
      statut: "en_attente",
    });
  },
});

export const submitRapport = mutation({
  args: {
    employeId: v.id("employees"),
    semaine: v.string(),
    realisations: v.string(),
    problemes: v.optional(v.string()),
    besoins: v.optional(v.string()),
    objectifs: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("rapports", {
      employeId: args.employeId,
      semaine: args.semaine,
      realisations: args.realisations,
      problemes: args.problemes,
      besoins: args.besoins,
      objectifs: args.objectifs,
      statut: "a_valider",
    });
  },
});

export const validateRapport = mutation({
  args: { id: v.id("rapports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { statut: "valide" });
  },
});
