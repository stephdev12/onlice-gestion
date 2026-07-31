import { mutation } from "./_generated/server";
import { requireAdmin } from "./access";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    // Clear existing data
    const prospects = await ctx.db.query("prospects").collect();
    for (const p of prospects) await ctx.db.delete(p._id);

    const events = await ctx.db.query("prospectEvents").collect();
    for (const e of events) await ctx.db.delete(e._id);

    const projects = await ctx.db.query("projects").collect();
    for (const pr of projects) await ctx.db.delete(pr._id);

    const tasks = await ctx.db.query("tasks").collect();
    for (const t of tasks) await ctx.db.delete(t._id);

    const employees = await ctx.db.query("employees").collect();
    for (const emp of employees) await ctx.db.delete(emp._id);

    const demandes = await ctx.db.query("demandes").collect();
    for (const d of demandes) await ctx.db.delete(d._id);

    const rapports = await ctx.db.query("rapports").collect();
    for (const r of rapports) await ctx.db.delete(r._id);

    // 1. Seed prospects
    const seedProspects = [
      { nom: "Paul Etoundi", entreprise: "Boutique Ada", tel: "+237 6 77 12 34 56", origine: "Facebook", stage: "nouveau", action: "Premier appel demain 10h", rep: "MK" },
      { nom: "Solange Mballa", entreprise: "Restaurant Le Manioc d'Or", tel: "+237 6 90 22 11 05", origine: "WhatsApp", stage: "contact", action: "Relancer mercredi 15h", rep: "AF" },
      { nom: "Ferdinand Nkolo", entreprise: "Nkolo Bâtiment", tel: "+237 6 55 44 33 22", origine: "Référence", stage: "qualification", action: "Envoyer le devis", rep: "MK" },
      { nom: "Aïcha Souleymane", entreprise: "Pharmacie Bonamoussadi", tel: "+237 6 71 98 76 54", origine: "Site web", stage: "proposition", action: "Relance devis vendredi", rep: "AF" },
      { nom: "Jean-Baptiste Fouda", entreprise: "Fouda & Fils Transport", tel: "+237 6 80 15 26 37", origine: "Salon", stage: "negociation", action: "RDV négociation lundi", rep: "MK" },
      { nom: "Grace Ateba", entreprise: "Salon Grace Beauté", tel: "+237 6 95 41 20 18", origine: "Instagram", stage: "client", action: "Lancer le kickoff projet", rep: "AF" },
      { nom: "Robert Essomba", entreprise: "Essomba Distribution", tel: "+237 6 60 33 12 09", origine: "Référence", stage: "termine", action: "Demander un avis client", rep: "MK" },
      { nom: "Chantal Ngo", entreprise: "Épicerie Ngo", tel: "+237 6 50 77 88 21", origine: "Référence", stage: "fidele", action: "Renouvellement contrat annuel", rep: "AF" },
      { nom: "Vincent Talla", entreprise: "Talla Menuiserie", tel: "+237 6 66 09 44 71", origine: "WhatsApp", stage: "nouveau", action: "Qualifier le besoin", rep: "MK" }
    ];

    for (const p of seedProspects) {
      const pid = await ctx.db.insert("prospects", p);
      await ctx.db.insert("prospectEvents", {
        prospectId: pid,
        label: "Création du prospect",
        date: "22 juil., 09:10",
        type: "creation"
      });
    }

    // 2. Seed projects & tasks
    const pr1 = await ctx.db.insert("projects", {
      titre: "Refonte identité visuelle",
      client: "Salon Grace Beauté",
      description: "Nouveau logo, moodboard et charte graphique pour le salon.",
      echeanceDefaut: "2026-08-05",
      equipe: ["SK", "MK"]
    });
    await ctx.db.insert("tasks", { projectId: pr1, titre: "Créer moodboard", priorite: "basse", echeance: "2026-07-28", assigne: "SK", progression: 100 });
    await ctx.db.insert("tasks", { projectId: pr1, titre: "Design du logo", priorite: "haute", echeance: "2026-08-02", assigne: "SK", progression: 80 });
    await ctx.db.insert("tasks", { projectId: pr1, titre: "Charte graphique", priorite: "moyenne", echeance: "2026-08-05", assigne: "SK", progression: 20 });

    const pr2 = await ctx.db.insert("projects", {
      titre: "Boutique en ligne",
      client: "Boutique Ada",
      description: "Site e-commerce avec paiement mobile money.",
      echeanceDefaut: "2026-08-20",
      equipe: ["RT", "JN", "MK"]
    });
    await ctx.db.insert("tasks", { projectId: pr2, titre: "Maquette Figma", priorite: "haute", echeance: "2026-07-30", assigne: "RT", progression: 100 });
    await ctx.db.insert("tasks", { projectId: pr2, titre: "Intégration front", priorite: "haute", echeance: "2026-08-10", assigne: "RT", progression: 60 });
    await ctx.db.insert("tasks", { projectId: pr2, titre: "API paiement", priorite: "haute", echeance: "2026-08-15", assigne: "JN", progression: 10 });
    await ctx.db.insert("tasks", { projectId: pr2, titre: "Déploiement", priorite: "moyenne", echeance: "2026-08-20", assigne: "MK", progression: 0 });

    const pr3 = await ctx.db.insert("projects", {
      titre: "Programme fidélité",
      client: "Épicerie Ngo",
      description: "Système de points de fidélité pour les clients réguliers.",
      echeanceDefaut: "2026-07-20",
      equipe: ["AF", "JN"]
    });
    await ctx.db.insert("tasks", { projectId: pr3, titre: "Cahier des charges", priorite: "moyenne", echeance: "2026-07-05", assigne: "AF", progression: 100 });
    await ctx.db.insert("tasks", { projectId: pr3, titre: "Développement backend", priorite: "haute", echeance: "2026-07-20", assigne: "JN", progression: 35 });

    // 3. Seed employees
    const e1 = await ctx.db.insert("employees", { nom: "Marc Kwedi", role: "admin", initials: "MK", poste: "Chef de projet", departement: "Direction", embauche: "2022-03-01", dispo: "temps_plein", competences: ["Gestion de projet", "Relation client", "Vente"], solde: 14, salaire: 450000 });
    const e2 = await ctx.db.insert("employees", { nom: "Aline Foka", role: "employe", initials: "AF", poste: "Chargée de compte", departement: "Commercial", embauche: "2023-06-15", dispo: "temps_plein", competences: ["Vente", "Négociation", "CRM"], solde: 20, salaire: 300000 });
    const e3 = await ctx.db.insert("employees", { nom: "Sarah Kamga", role: "employe", initials: "SK", poste: "Designer", departement: "Design", embauche: "2024-01-10", dispo: "temps_plein", competences: ["Figma", "Branding", "UI/UX"], solde: 9, salaire: 275000 });
    await ctx.db.insert("employees", { nom: "Roland Tchoua", role: "employe", initials: "RT", poste: "Développeur Front", departement: "Développement", embauche: "2023-09-01", dispo: "freelance", competences: ["React", "CSS", "Responsive"], solde: null, salaire: null });
    const e5 = await ctx.db.insert("employees", { nom: "Junior Nka", role: "employe", initials: "JN", poste: "Développeur Back", departement: "Développement", embauche: "2024-05-20", dispo: "temps_plein", competences: ["Node.js", "Convex", "API"], solde: 18, salaire: 320000 });

    // Demandes
    await ctx.db.insert("demandes", { employeId: e2, type: "conge", debut: "2026-08-03", fin: "2026-08-10", motif: "Vacances en famille", statut: "en_attente" });
    await ctx.db.insert("demandes", { employeId: e3, type: "teletravail", debut: "2026-07-29", fin: "2026-07-29", motif: "Rendez-vous personnel", statut: "en_attente" });
    await ctx.db.insert("demandes", { employeId: e5, type: "absence", debut: "2026-07-20", fin: "2026-07-20", motif: "Maladie", statut: "approuve" });

    // Rapports
    await ctx.db.insert("rapports", { employeId: e2, semaine: "2026-07-24", realisations: "3 nouveaux prospects qualifiés, devis envoyé à Aïcha Souleymane", problemes: "Le client Fouda Transport hésite sur le prix", besoins: "Un argument commercial sur la garantie", objectifs: "Signer Fouda Transport la semaine prochaine", statut: "a_valider" });
    await ctx.db.insert("rapports", { employeId: e5, semaine: "2026-07-17", realisations: "API de paiement en cours, tests unitaires lancés", problemes: "Bug d'intégration avec le fournisseur mobile money", besoins: "Accès à l'environnement sandbox du partenaire", objectifs: "Finir l'intégration paiement", statut: "valide" });

    return "Database seeded successfully!";
  },
});
