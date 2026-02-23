import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ExternalLink, ThumbsUp } from "lucide-react";
import { type IdeaResponse } from "@shared/schema";
import { Link } from "wouter";
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
import { useDeleteIdea, useUpvoteIdea, useRemoveUpvote } from "@/hooks/use-ideas";
import { useUser } from "@/hooks/use-auth";

interface IdeaTableProps {
  ideas: IdeaResponse[];
  onEdit: (idea: IdeaResponse) => void;
}

export function IdeaTable({ ideas, onEdit }: IdeaTableProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ideaToDelete, setIdeaToDelete] = useState<number | null>(null);
  const deleteMutation = useDeleteIdea();
  const upvoteMutation = useUpvoteIdea();
  const removeUpvoteMutation = useRemoveUpvote();
  const { data: user } = useUser();

  const handleDelete = () => {
    if (ideaToDelete !== null) {
      deleteMutation.mutate(ideaToDelete);
      setIdeaToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-border/30">
            <TableHead className="w-[80px] font-semibold">ID</TableHead>
            <TableHead className="font-semibold">What</TableHead>
            <TableHead className="font-semibold">Who</TableHead>
            <TableHead className="font-semibold w-[80px]">Votes</TableHead>
            <TableHead className="text-right font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <TableRow key={idea.id} className="group hover:bg-secondary/10 transition-colors border-border/30">
              <TableCell className="font-medium">
                <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0 h-5">
                  #{idea.id}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="max-w-[400px]">
                  <p className="font-medium text-foreground line-clamp-1">{idea.what}</p>
                  {idea.username && (
                    <p className="text-xs text-muted-foreground">by {idea.username}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <p className="text-muted-foreground text-sm truncate max-w-[200px]">{idea.who}</p>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-2 gap-1.5 ${idea.hasUpvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                  onClick={() => {
                    if (!user) return;
                    if (idea.hasUpvoted) {
                      removeUpvoteMutation.mutate(idea.id);
                    } else {
                      upvoteMutation.mutate(idea.id);
                    }
                  }}
                  disabled={!user}
                  title={!user ? 'Login to upvote' : idea.hasUpvoted ? 'Remove upvote' : 'Upvote this idea'}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${idea.hasUpvoted ? 'fill-current' : ''}`} />
                  <span className="text-xs font-medium">{idea.upvoteCount}</span>
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/5"
                  >
                    <Link href={`/ideas/${idea.id}`}>
                      <span className="mr-1.5 hidden sm:inline">Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                  {user && user.id === idea.userId && (
                    <>
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
                        onClick={() => {
                          setIdeaToDelete(idea.id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your idea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdeaToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
