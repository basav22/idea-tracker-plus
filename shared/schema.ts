import { pgTable, text, serial, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  what: text("what").notNull(),
  who: text("who").notNull(),
  features: text("features").notNull(),
  doneCriteria: text("done_criteria").notNull(),
  inspiration: text("inspiration").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ideaId: serial("idea_id").references(() => ideas.id),
  section: text("section").notNull(), // 'what', 'who', 'features', 'doneCriteria', 'inspiration'
  content: text("content").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const upvotes = pgTable("upvotes", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUpvote: uniqueIndex("unique_upvote").on(table.ideaId, table.userId),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertIdeaSchema = createInsertSchema(ideas).omit({ id: true, createdAt: true, userId: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, userId: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Request types
export type CreateIdeaRequest = InsertIdea;
export type UpdateIdeaRequest = Partial<InsertIdea>;
export type CreateCommentRequest = InsertComment;

export type Upvote = typeof upvotes.$inferSelect;

// Response types
export type IdeaResponse = Idea & { upvoteCount: number; hasUpvoted: boolean };
export type IdeasListResponse = IdeaResponse[];
export type CommentResponse = Comment;
