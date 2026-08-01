import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentEmployee, getCurrentProfile, requireAdmin } from "./access";

async function canAccessProject(ctx: Parameters<typeof getCurrentProfile>[0], projectId: string) {
  const profile = await getCurrentProfile(ctx);
  if (!profile) return false;
  if (profile.role === "admin" || profile.role === "ceo") return true;

  const employee = await getCurrentEmployee(ctx);
  if (!employee) return false;

  const task = await ctx.db
    .query("tasks")
    .withIndex("by_project", (query) => query.eq("projectId", projectId as never))
    .filter((query) => query.eq(query.field("assigneId"), employee._id))
    .first();
  return !!task;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) return [];
    const employee = profile.role === "employe" ? await getCurrentEmployee(ctx) : null;
    if (profile.role === "employe" && !employee) return [];

    const projects = await ctx.db.query("projects").collect();
    const today = new Date().toISOString().split("T")[0];

    const result = await Promise.all(
      projects.map(async (project) => {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        const visibleTasks = employee
          ? tasks.filter((task) => task.assigneId === employee._id)
          : tasks;
        if (employee && visibleTasks.length === 0) return null;

        const progress = visibleTasks.length
          ? Math.round(visibleTasks.reduce((sum, t) => sum + t.progression, 0) / visibleTasks.length)
          : 0;

        const echeance = visibleTasks.length
          ? visibleTasks.reduce((max, t) => (t.echeance > max ? t.echeance : max), visibleTasks[0].echeance)
          : project.echeanceDefaut;

        let status: "termine" | "retard" | "encours" = "encours";
        if (visibleTasks.length && progress >= 100) status = "termine";
        else if (echeance && echeance < today) status = "retard";

        return {
          ...project,
          taches: visibleTasks,
          progress,
          echeance,
          status,
        };
      })
    );

    return result.filter((project) => project !== null);
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    if (!(await canAccessProject(ctx, args.id))) {
      throw new Error("Unauthorized");
    }
    const project = await ctx.db.get(args.id);
    if (!project) return null;
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    const profile = await getCurrentProfile(ctx);
    const employee = profile?.role === "employe" ? await getCurrentEmployee(ctx) : null;
    return {
      ...project,
      taches: employee ? tasks.filter((task) => task.assigneId === employee._id) : tasks,
    };
  },
});

export const create = mutation({
  args: {
    titre: v.string(),
    client: v.optional(v.string()),
    description: v.optional(v.string()),
    projectType: v.optional(
      v.union(
        v.literal("dev"),
        v.literal("marketing_digital"),
        v.literal("design"),
        v.literal("campagne_marketing"),
        v.literal("rapide")
      )
    ),
    echeanceDefaut: v.string(),
    equipe: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("projects", args);
  },
});

export const addTask = mutation({
  args: {
    projectId: v.id("projects"),
    titre: v.string(),
    priorite: v.string(),
    importance: v.optional(v.union(v.literal("critique"), v.literal("haute"), v.literal("moyenne"), v.literal("basse"))),
    echeance: v.string(),
    assigneId: v.id("employees"),
    statut: v.optional(v.union(v.literal("attendu"), v.literal("encours"), v.literal("termine"))),
    detailsFait: v.optional(v.string()),
    detailsBlocage: v.optional(v.string()),
    detailsReste: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const employee = await ctx.db.get(args.assigneId);
    if (!employee) throw new Error("Employee not found");

    const initialStatus = args.statut || "attendu";
    const initialProgress = initialStatus === "termine" ? 100 : initialStatus === "encours" ? 40 : 0;

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      titre: args.titre,
      priorite: args.priorite,
      importance:
        args.importance ||
        (args.priorite === "haute" || args.priorite === "moyenne" || args.priorite === "basse"
          ? args.priorite
          : "moyenne"),
      echeance: args.echeance,
      assigne: employee.initials,
      assigneId: employee._id,
      statut: initialStatus,
      detailsFait: args.detailsFait,
      detailsBlocage: args.detailsBlocage,
      detailsReste: args.detailsReste,
      notes: args.notes,
      progression: initialProgress,
    });

    await ctx.db.insert("notifications", {
      employeId: employee._id,
      taskId,
      message: `Nouvelle mission : ${args.titre}`,
    });

    return taskId;
  },
});

export const updateTaskProgress = mutation({
  args: {
    id: v.id("tasks"),
    progression: v.number(),
  },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.progression) || args.progression < 0 || args.progression > 100) {
      throw new Error("Progression must be between 0 and 100");
    }

    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const profile = await getCurrentProfile(ctx);
    if (profile?.role === "employe") {
      const employee = await getCurrentEmployee(ctx);
      if (!employee || task.assigneId !== employee._id) {
        throw new Error("Unauthorized");
      }
    }
    await ctx.db.patch(args.id, {
      progression: args.progression,
      statut: args.progression >= 100 ? "termine" : args.progression > 0 ? "encours" : "attendu",
    });
  },
});

export const updateTaskWorkflow = mutation({
  args: {
    id: v.id("tasks"),
    statut: v.union(v.literal("attendu"), v.literal("encours"), v.literal("termine")),
    detailsFait: v.optional(v.string()),
    detailsBlocage: v.optional(v.string()),
    detailsReste: v.optional(v.string()),
    notes: v.optional(v.string()),
    importance: v.optional(v.union(v.literal("critique"), v.literal("haute"), v.literal("moyenne"), v.literal("basse"))),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const profile = await getCurrentProfile(ctx);
    if (!profile) throw new Error("Unauthorized");

    if (profile.role === "employe") {
      const employee = await getCurrentEmployee(ctx);
      if (!employee || task.assigneId !== employee._id) {
        throw new Error("Unauthorized");
      }
    }

    const progression = args.statut === "termine" ? 100 : args.statut === "encours" ? Math.max(10, task.progression || 0) : 0;

    await ctx.db.patch(args.id, {
      statut: args.statut,
      detailsFait: args.detailsFait,
      detailsBlocage: args.detailsBlocage,
      detailsReste: args.detailsReste,
      notes: args.notes,
      importance: args.importance,
      progression,
    });
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const lateProjects = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const today = new Date().toISOString().split("T")[0];
    const projects = await ctx.db.query("projects").collect();
    const late = projects.filter((p) => p.echeanceDefaut < today);

    const result = await Promise.all(
      late.map(async (p) => {
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .collect();
        const progression = tasks.length
          ? Math.round(tasks.reduce((sum, t) => sum + t.progression, 0) / tasks.length)
          : 0;
        return {
          id: p._id,
          titre: p.titre,
          client: p.client,
          echeance: p.echeanceDefaut,
          progression,
        };
      })
    );

    return result.sort((a, b) => a.echeance.localeCompare(b.echeance)).slice(0, 5);
  },
});

export const notifications = query({
  args: {},
  handler: async (ctx) => {
    const employee = await getCurrentEmployee(ctx);
    if (!employee) return [];

    return await ctx.db
      .query("notifications")
      .withIndex("by_employeId", (query) => query.eq("employeId", employee._id))
      .order("desc")
      .take(20);
  },
});

export const markNotificationRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const employee = await getCurrentEmployee(ctx);
    const notification = await ctx.db.get(args.id);
    if (!employee || !notification || notification.employeId !== employee._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.id, { readAt: Date.now() });
  },
});

export const deleteProject = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) throw new Error("Unauthorized");
    if (profile.role !== "ceo" && profile.role !== "admin") throw new Error("Forbidden");

    // cascade delete tasks and related entries
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id as never))
      .collect();

    for (const t of tasks) {
      // delete comments and activity
      const comments = await ctx.db.query("taskComments").withIndex("by_task", (q) => q.eq("taskId", t._id as never)).collect();
      for (const c of comments) await ctx.db.delete(c._id);
      const acts = await ctx.db.query("taskActivity").withIndex("by_task", (q) => q.eq("taskId", t._id as never)).collect();
      for (const a of acts) await ctx.db.delete(a._id);
      await ctx.db.delete(t._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const addComment = mutation({
  args: { taskId: v.id("tasks"), text: v.string() },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfile(ctx);
    if (!profile) throw new Error("Unauthorized");

    const employee = profile.role === "employe" ? await getCurrentEmployee(ctx) : null;
    const user = profile.userId ? await ctx.db.get(profile.userId) : null;
    const authorName = employee?.nom || user?.name || "Utilisateur";

    const commentId = await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      authorId: employee?._id,
      authorName,
      text: args.text,
      createdAt: Date.now(),
    });

    await ctx.db.insert("taskActivity", {
      taskId: args.taskId,
      type: "comment",
      payload: args.text,
      createdAt: Date.now(),
    });

    return commentId;
  },
});

export const commentsForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as never))
      .order("asc")
      .collect();
  },
});

export const activityForTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskActivity")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId as never))
      .order("asc")
      .collect();
  },
});
