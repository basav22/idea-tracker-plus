import { db } from "./db";
import {
  ideas,
  type CreateIdeaRequest,
  type UpdateIdeaRequest,
  type IdeaResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getIdeas(): Promise<IdeaResponse[]>;
  getIdea(id: number): Promise<IdeaResponse | undefined>;
  createIdea(idea: CreateIdeaRequest): Promise<IdeaResponse>;
  updateIdea(id: number, updates: UpdateIdeaRequest): Promise<IdeaResponse>;
  deleteIdea(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getIdeas(): Promise<IdeaResponse[]> {
    return await db.select().from(ideas);
  }

  async getIdea(id: number): Promise<IdeaResponse | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: CreateIdeaRequest): Promise<IdeaResponse> {
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
}

export const storage = new DatabaseStorage();
