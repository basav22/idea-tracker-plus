import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.ideas.list.path, async (req, res) => {
    const allIdeas = await storage.getIdeas();
    res.json(allIdeas);
  });

  app.get(api.ideas.get.path, async (req, res) => {
    const idea = await storage.getIdea(Number(req.params.id));
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }
    res.json(idea);
  });

  app.post(api.ideas.create.path, async (req, res) => {
    try {
      const input = api.ideas.create.input.parse(req.body);
      const idea = await storage.createIdea(input);
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

  app.put(api.ideas.update.path, async (req, res) => {
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

  app.delete(api.ideas.delete.path, async (req, res) => {
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

  app.post(api.ideas.comments.create.path, async (req, res) => {
    try {
      const input = api.ideas.comments.create.input.parse(req.body);
      const comment = await storage.createComment(input);
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
