import { type IdeaResponse } from "@shared/schema";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ArrowRight, ThumbsUp } from "lucide-react";
import { useDeleteIdea, useUpvoteIdea, useRemoveUpvote } from "@/hooks/use-ideas";
import { useUser } from "@/hooks/use-auth";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Link } from "wouter";

interface IdeaCardProps {
  idea: IdeaResponse;
  onEdit: (idea: IdeaResponse) => void;
}

export function IdeaCard({ idea, onEdit }: IdeaCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteIdea();
  const upvoteMutation = useUpvoteIdea();
  const removeUpvoteMutation = useRemoveUpvote();
  const { data: user } = useUser();

  const handleUpvoteToggle = () => {
    if (!user) return;
    if (idea.hasUpvoted) {
      removeUpvoteMutation.mutate(idea.id);
    } else {
      upvoteMutation.mutate(idea.id);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(idea.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className="h-full transition-transform duration-200 hover:-translate-y-1"
      >
        <Card className="h-full flex flex-col overflow-hidden border border-border/50 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group">
          <CardHeader className="pb-3 space-y-3">
            <div className="flex justify-between items-start gap-4">
              <Link href={`/ideas/${idea.id}`} className="hover:underline decoration-1 underline-offset-4 decoration-muted-foreground/50">
                <h3 className="font-display text-xl font-semibold text-foreground leading-tight line-clamp-2">
                  {idea.what}
                </h3>
              </Link>
              <Badge variant="secondary" className="font-normal text-xs whitespace-nowrap shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                Idea #{idea.id}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              For: {idea.who}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pb-6">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {idea.features}
            </p>
          </CardContent>

          <CardFooter className="pt-0 flex items-center justify-between gap-2 border-t border-border/30 p-4 bg-secondary/20">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary pl-0 hover:bg-transparent transition-colors group/btn"
                asChild
              >
                <Link href={`/ideas/${idea.id}`}>
                  View Details
                  <ArrowRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 gap-1.5 ${idea.hasUpvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                onClick={handleUpvoteToggle}
                disabled={!user}
                title={!user ? 'Login to upvote' : idea.hasUpvoted ? 'Remove upvote' : 'Upvote this idea'}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${idea.hasUpvoted ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{idea.upvoteCount}</span>
              </Button>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-white"
                onClick={() => onEdit(idea)}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your idea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
