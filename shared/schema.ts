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

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ideaId: serial("idea_id").references(() => ideas.id),
  section: text("section").notNull(), // 'what', 'who', 'features', 'doneCriteria', 'inspiration'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIdeaSchema = createInsertSchema(ideas).omit({ id: true, createdAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Request types
export type CreateIdeaRequest = InsertIdea;
export type UpdateIdeaRequest = Partial<InsertIdea>;
export type CreateCommentRequest = InsertComment;

// Response types
export type IdeaResponse = Idea;
export type IdeasListResponse = Idea[];
export type CommentResponse = Comment;
