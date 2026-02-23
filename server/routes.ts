import type { Express } from "express";
import type { Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { requireAuth, hashPassword } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ---- Auth routes ----
  app.post(api.auth.register.path, async (req, res, next) => {
    try {
      const { username, password } = api.auth.register.input.parse(req.body);

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashed = await hashPassword(password);
      const user = await storage.createUser(username, hashed);
      const { password: _, ...userWithoutPassword } = user;

      req.login(userWithoutPassword, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      next(err);
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // ---- Ideas routes ----
  app.get(api.ideas.list.path, async (req, res) => {
    const currentUserId = req.isAuthenticated() ? req.user!.id : undefined;
    const allIdeas = await storage.getIdeas(currentUserId);
    res.json(allIdeas);
  });

  app.get(api.ideas.get.path, async (req, res) => {
    const currentUserId = req.isAuthenticated() ? req.user!.id : undefined;
    const idea = await storage.getIdea(Number(req.params.id), currentUserId);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }
    res.json(idea);
  });

  app.post(api.ideas.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea({ ...input, userId: req.user!.id });
      res.status(201).json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.ideas.update.path, requireAuth, async (req, res) => {
    try {
      const input = api.ideas.update.input.parse(req.body);
      const idea = await storage.updateIdea(Number(req.params.id), input);
      if (!idea) {
         return res.status(404).json({ message: 'Idea not found' });
      }
      res.json(idea);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.ideas.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteIdea(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(404).json({ message: 'Idea not found' });
    }
  });

  app.get(api.ideas.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(Number(req.params.id), req.params.section);
    res.json(comments);
  });

  app.post(api.ideas.comments.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.ideas.comments.create.input.parse(req.body);
      const comment = await storage.createComment({ ...input, userId: req.user!.id });
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // ---- Upvote routes ----
  app.post(api.ideas.upvote.path, requireAuth, async (req, res) => {
    const ideaId = Number(req.params.id);
    const userId = req.user!.id;

    const idea = await storage.getIdea(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const alreadyUpvoted = await storage.hasUserUpvoted(ideaId, userId);
    if (alreadyUpvoted) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    await storage.addUpvote(ideaId, userId);
    const upvoteCount = await storage.getUpvoteCount(ideaId);
    res.json({ id: ideaId, upvoteCount });
  });

  app.delete(api.ideas.removeUpvote.path, requireAuth, async (req, res) => {
    const ideaId = Number(req.params.id);
    const userId = req.user!.id;

    const idea = await storage.getIdea(ideaId);
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    await storage.removeUpvote(ideaId, userId);
    const upvoteCount = await storage.getUpvoteCount(ideaId);
    res.json({ id: ideaId, upvoteCount });
  });

  // Seed data
  try {
    const existingIdeas = await storage.getIdeas();
    if (existingIdeas.length === 0) {
      await storage.createIdea({
        what: "A personal finance tracker that automatically categorizes expenses.",
        who: "Young professionals who want to understand their spending habits.",
        features: "1. Auto-categorize transactions\n2. Monthly budget vs actuals view\n3. Export to CSV",
        doneCriteria: "Users can securely connect their bank, view categorized transactions for the last 30 days, and set budget limits.",
        inspiration: "Mint, YNAB, Copilot"
      });
      await storage.createIdea({
        what: "An AI-powered recipe generator based on ingredients you have in your fridge.",
        who: "Home cooks looking to reduce food waste and try new meals.",
        features: "1. Input list of ingredients\n2. Generate 3 recipe options\n3. Save favorite recipes",
        doneCriteria: "Users can input 'chicken, rice, broccoli' and receive a fully formatted recipe with step-by-step instructions.",
        inspiration: "Supercook, various recipe blogs"
      });
    }
  } catch (error) {
    console.log("Skipping seed data, tables might not exist yet.");
  }

  return httpServer;
}
