import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("ceo"), v.literal("admin"), v.literal("employe")),
  }).index("by_userId", ["userId"]),

  // CRM - Prospects
  prospects: defineTable({
    nom: v.string(),
    entreprise: v.optional(v.string()),
    tel: v.optional(v.string()),
    email: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    siteWeb: v.optional(v.string()),
    origine: v.string(), // Facebook, Instagram, WhatsApp, Référence, Site web, Salon, Autre
    stage: v.string(),   // nouveau, contact, qualification, proposition, negociation, client, termine, fidele
    action: v.optional(v.string()),
    rep: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  })
    .index("by_stage", ["stage"])
    .index("by_rep", ["rep"]),

  // CRM - Timeline entries
  prospectEvents: defineTable({
    prospectId: v.id("prospects"),
    label: v.string(),
    date: v.string(),
    type: v.optional(v.string()), // creation, call, move, note, email, whatsapp
  }).index("by_prospect", ["prospectId"]),

  // Projets
  projects: defineTable({
    titre: v.string(),
    client: v.optional(v.string()),
    description: v.optional(v.string()),
    echeanceDefaut: v.string(),
    equipe: v.array(v.string()),
    createdBy: v.optional(v.id("users")),
  }),

  // Tâches de projets
  tasks: defineTable({
    projectId: v.id("projects"),
    titre: v.string(),
    priorite: v.string(),     // basse, moyenne, haute
    echeance: v.string(),
    assigne: v.optional(v.string()),
    assigneId: v.optional(v.id("employees")),
    progression: v.number(),  // 0-100
  })
    .index("by_project", ["projectId"])
    .index("by_assigneId", ["assigneId"]),

  // Employés / Équipe
  employees: defineTable({
    nom: v.string(),
    email: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    role: v.union(v.literal("admin"), v.literal("employe")),
    initials: v.string(),
    poste: v.optional(v.string()),
    departement: v.string(),
    embauche: v.optional(v.string()),
    dispo: v.string(),        // temps_plein, mi_temps, freelance
    competences: v.array(v.string()),
    solde: v.union(v.number(), v.null()),
    salaire: v.union(v.number(), v.null()),
  })
    .index("by_departement", ["departement"])
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  notifications: defineTable({
    employeId: v.id("employees"),
    taskId: v.id("tasks"),
    message: v.string(),
    readAt: v.optional(v.number()),
  })
    .index("by_employeId", ["employeId"])
    .index("by_taskId", ["taskId"]),

  // Demandes RH (congés, absences, etc.)
  demandes: defineTable({
    employeId: v.id("employees"),
    type: v.string(),          // conge, absence, retard, mission, teletravail
    debut: v.string(),
    fin: v.string(),
    motif: v.optional(v.string()),
    statut: v.string(),        // en_attente, approuve, refuse
  })
    .index("by_employe", ["employeId"])
    .index("by_statut", ["statut"]),

  // Rapports hebdomadaires
  rapports: defineTable({
    employeId: v.id("employees"),
    semaine: v.string(),
    realisations: v.string(),
    problemes: v.optional(v.string()),
    besoins: v.optional(v.string()),
    objectifs: v.optional(v.string()),
    statut: v.string(),        // a_valider, valide
  }).index("by_employe", ["employeId"]),
});
