import { z } from "zod";
import { insertIdeaSchema, type Idea } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  ideas: {
    list: {
      method: 'GET' as const,
      path: '/api/ideas' as const,
      responses: {
        200: z.array(z.custom<Idea>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/ideas/:id' as const,
      responses: {
        200: z.custom<Idea>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ideas' as const,
      input: insertIdeaSchema,
      responses: {
        201: z.custom<Idea>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/ideas/:id' as const,
      input: insertIdeaSchema.partial(),
      responses: {
        200: z.custom<Idea>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/ideas/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type IdeaInput = z.infer<typeof api.ideas.create.input>;
export type IdeaUpdateInput = z.infer<typeof api.ideas.update.input>;
