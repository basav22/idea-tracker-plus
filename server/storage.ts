import { db } from "./db";
import {
  ideas,
  comments,
  users,
  upvotes,
  type CreateIdeaRequest,
  type UpdateIdeaRequest,
  type IdeaResponse,
  type CommentResponse,
  type CreateCommentRequest,
  type User,
} from "@shared/schema";
import { eq, and, sql, count } from "drizzle-orm";

export interface IStorage {
  getIdeas(currentUserId?: number): Promise<IdeaResponse[]>;
  getIdea(id: number, currentUserId?: number): Promise<IdeaResponse | undefined>;
  createIdea(idea: CreateIdeaRequest & { userId?: number | null }): Promise<IdeaResponse>;
  updateIdea(id: number, updates: UpdateIdeaRequest): Promise<IdeaResponse>;
  deleteIdea(id: number): Promise<void>;

  getComments(ideaId: number, section: string): Promise<CommentResponse[]>;
  createComment(comment: CreateCommentRequest & { userId?: number | null }): Promise<CommentResponse>;

  addUpvote(ideaId: number, userId: number): Promise<void>;
  removeUpvote(ideaId: number, userId: number): Promise<void>;
  getUpvoteCount(ideaId: number): Promise<number>;
  hasUserUpvoted(ideaId: number, userId: number): Promise<boolean>;

  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(username: string, hashedPassword: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getIdeas(currentUserId?: number): Promise<IdeaResponse[]> {
    const rows = await db
      .select({
        id: ideas.id,
        what: ideas.what,
        who: ideas.who,
        features: ideas.features,
        doneCriteria: ideas.doneCriteria,
        inspiration: ideas.inspiration,
        userId: ideas.userId,
        createdAt: ideas.createdAt,
        username: users.username,
      })
      .from(ideas)
      .leftJoin(users, eq(ideas.userId, users.id));
    const result: IdeaResponse[] = [];
    for (const row of rows) {
      const upvoteCount = await this.getUpvoteCount(row.id);
      const hasUpvoted = currentUserId ? await this.hasUserUpvoted(row.id, currentUserId) : false;
      result.push({ ...row, upvoteCount, hasUpvoted, username: row.username ?? undefined });
    }
    return result;
  }

  async getIdea(id: number, currentUserId?: number): Promise<IdeaResponse | undefined> {
    const [row] = await db
      .select({
        id: ideas.id,
        what: ideas.what,
        who: ideas.who,
        features: ideas.features,
        doneCriteria: ideas.doneCriteria,
        inspiration: ideas.inspiration,
        userId: ideas.userId,
        createdAt: ideas.createdAt,
        username: users.username,
      })
      .from(ideas)
      .leftJoin(users, eq(ideas.userId, users.id))
      .where(eq(ideas.id, id));
    if (!row) return undefined;
    const upvoteCount = await this.getUpvoteCount(id);
    const hasUpvoted = currentUserId ? await this.hasUserUpvoted(id, currentUserId) : false;
    return { ...row, upvoteCount, hasUpvoted, username: row.username ?? undefined };
  }

  async createIdea(idea: CreateIdeaRequest & { userId?: number | null }): Promise<IdeaResponse> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return { ...newIdea, upvoteCount: 0, hasUpvoted: false };
  }

  async updateIdea(id: number, updates: UpdateIdeaRequest): Promise<IdeaResponse> {
    const [updatedIdea] = await db.update(ideas)
      .set(updates)
      .where(eq(ideas.id, id))
      .returning();
    const upvoteCount = await this.getUpvoteCount(id);
    return { ...updatedIdea, upvoteCount, hasUpvoted: false };
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

  async addUpvote(ideaId: number, userId: number): Promise<void> {
    await db.insert(upvotes).values({ ideaId, userId });
  }

  async removeUpvote(ideaId: number, userId: number): Promise<void> {
    await db.delete(upvotes).where(
      and(eq(upvotes.ideaId, ideaId), eq(upvotes.userId, userId))
    );
  }

  async getUpvoteCount(ideaId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(upvotes)
      .where(eq(upvotes.ideaId, ideaId));
    return result?.count ?? 0;
  }

  async hasUserUpvoted(ideaId: number, userId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(upvotes)
      .where(and(eq(upvotes.ideaId, ideaId), eq(upvotes.userId, userId)));
    return !!result;
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
