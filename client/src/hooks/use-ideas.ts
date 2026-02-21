import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type IdeaInput, type IdeaUpdateInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/ideas
export function useIdeas() {
  return useQuery({
    queryKey: [api.ideas.list.path],
    queryFn: async () => {
      const res = await fetch(api.ideas.list.path);
      if (!res.ok) throw new Error("Failed to fetch ideas");
      return api.ideas.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/ideas/:id
export function useIdea(id: number) {
  return useQuery({
    queryKey: [api.ideas.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.ideas.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch idea");
      return api.ideas.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

// POST /api/ideas
export function useCreateIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: IdeaInput) => {
      const res = await fetch(api.ideas.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create idea");
      }
      
      return api.ideas.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      toast({
        title: "Success",
        description: "Idea created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// PUT /api/ideas/:id
export function useUpdateIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & IdeaUpdateInput) => {
      const url = buildUrl(api.ideas.update.path, { id });
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update idea");
      }

      return api.ideas.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      toast({
        title: "Success",
        description: "Idea updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// DELETE /api/ideas/:id
export function useDeleteIdea() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.ideas.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Idea not found");
        throw new Error("Failed to delete idea");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.ideas.list.path] });
      toast({
        title: "Success",
        description: "Idea deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
