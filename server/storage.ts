import { db } from "./db";
import {
  ideas,
  comments,
  users,
  type CreateIdeaRequest,
  type UpdateIdeaRequest,
  type IdeaResponse,
  type CommentResponse,
  type CreateCommentRequest,
  type User,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getIdeas(): Promise<IdeaResponse[]>;
  getIdea(id: number): Promise<IdeaResponse | undefined>;
  createIdea(idea: CreateIdeaRequest & { userId?: number | null }): Promise<IdeaResponse>;
  updateIdea(id: number, updates: UpdateIdeaRequest): Promise<IdeaResponse>;
  deleteIdea(id: number): Promise<void>;

  getComments(ideaId: number, section: string): Promise<CommentResponse[]>;
  createComment(comment: CreateCommentRequest & { userId?: number | null }): Promise<CommentResponse>;

  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(username: string, hashedPassword: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getIdeas(): Promise<IdeaResponse[]> {
    return await db.select().from(ideas);
  }

  async getIdea(id: number): Promise<IdeaResponse | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: CreateIdeaRequest & { userId?: number | null }): Promise<IdeaResponse> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: number, updates: UpdateIdeaRequest): Promise<IdeaResponse> {
    const [updatedIdea] = await db.update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteIdea(id: number): Promise<void> {
    await db.delete(ideas).where(eq(ideas.id, id));
  }

  async getComments(ideaId: number, section: string): Promise<(CommentResponse & { username?: string })[]> {
    const rows = await db
      .select({
        id: comments.id,
        ideaId: comments.ideaId,
        section: comments.section,
        content: comments.content,
        userId: comments.userId,
        createdAt: comments.createdAt,
        username: users.username,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(
        and(
          eq(comments.ideaId, ideaId),
          eq(comments.section, section)
        )
      );
    return rows.map(r => ({ ...r, username: r.username ?? undefined }));
  }

  async createComment(comment: CreateCommentRequest & { userId?: number | null }): Promise<CommentResponse> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(username: string, hashedPassword: string): Promise<User> {
    const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();
    return user;
  }
}

export const storage = new DatabaseStorage();
