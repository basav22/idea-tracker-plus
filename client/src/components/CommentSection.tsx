import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Comment, type InsertComment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface CommentSectionProps {
  ideaId: number;
  section: string;
}

export function CommentSection({ ideaId, section }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: [buildUrl(api.ideas.comments.list.path, { id: ideaId, section })],
  });

  const mutation = useMutation({
    mutationFn: async (newComment: InsertComment) => {
      const res = await apiRequest(
        api.ideas.comments.create.method,
        buildUrl(api.ideas.comments.create.path, { id: ideaId }),
        newComment
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [buildUrl(api.ideas.comments.list.path, { id: ideaId, section })],
      });
      setContent("");
      toast({
        title: "Comment added",
        description: "Your thought has been captured.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    mutation.mutate({ ideaId, section, content });
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/30">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <MessageSquare className="w-4 h-4" />
        <h4 className="text-sm font-semibold uppercase tracking-wider">Discussion</h4>
      </div>

      <div className="space-y-4 mb-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : comments?.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No comments yet. Start the conversation!</p>
        ) : (
          comments?.map((comment: any) => (
            <div key={comment.id} className="bg-secondary/10 p-3 rounded-xl border border-border/20">
              <p className="text-sm leading-relaxed">{comment.content}</p>
              <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                {comment.username && <span className="text-foreground/70">{comment.username}</span>}
                {comment.username && comment.createdAt && <span>·</span>}
                {comment.createdAt && format(new Date(comment.createdAt), "MMM d, h:mm a")}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] pr-12 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all resize-none"
        />
        <Button
          type="submit"
          size="icon"
          disabled={mutation.isPending || !content.trim()}
          className="absolute bottom-2 right-2 h-8 w-8 shadow-sm"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
