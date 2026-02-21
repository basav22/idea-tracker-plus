import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  what: text("what").notNull(),
  who: text("who").notNull(),
  features: text("features").notNull(),
  doneCriteria: text("done_criteria").notNull(),
  inspiration: text("inspiration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({ id: true, createdAt: true });

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

// Request types
export type CreateIdeaRequest = InsertIdea;
export type UpdateIdeaRequest = Partial<InsertIdea>;

// Response types
export type IdeaResponse = Idea;
export type IdeasListResponse = Idea[];
