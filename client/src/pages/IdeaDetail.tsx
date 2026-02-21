import { useIdea, useDeleteIdea } from "@/hooks/use-ideas";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit2, Trash2, Calendar, CheckCircle2, Target, Users, Palette, Layers } from "lucide-react";
import { CreateIdeaDialog } from "@/components/CreateIdeaDialog";
import { CommentSection } from "@/components/CommentSection";
import { useState } from "react";
import { format } from "date-fns";
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

export default function IdeaDetail() {
  const [, params] = useRoute("/ideas/:id");
  const [, setLocation] = useLocation();
  const id = params ? parseInt(params.id) : 0;
  
  const { data: idea, isLoading, error } = useIdea(id);
  const deleteMutation = useDeleteIdea();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Idea not found</h2>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ideas
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="px-3 py-1 text-xs uppercase tracking-wider">
              Idea #{idea.id}
            </Badge>
            {idea.createdAt && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(idea.createdAt), "MMMM d, yyyy")}
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
            {idea.what}
          </h1>
          <div className="mt-6 p-6 rounded-2xl bg-secondary/10 border border-border/30">
            <h3 className="font-display text-lg font-semibold mb-2">Overall Discussion</h3>
            <CommentSection ideaId={idea.id} section="what" />
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 space-y-8"
          >
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-8">
                
                <section>
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Users className="w-5 h-5" />
                    <h3 className="font-display text-xl font-semibold">Target Audience</h3>
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50">
                    <p className="text-lg leading-relaxed">{idea.who}</p>
                    <CommentSection ideaId={idea.id} section="who" />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Layers className="w-5 h-5" />
                    <h3 className="font-display text-xl font-semibold">Key Features</h3>
                  </div>
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <div className="prose prose-stone max-w-none text-foreground/90 whitespace-pre-wrap">
                      {idea.features}
                    </div>
                    <CommentSection ideaId={idea.id} section="features" />
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-display text-xl font-semibold">Done Criteria</h3>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-950/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <p className="text-lg leading-relaxed">{idea.doneCriteria}</p>
                    <CommentSection ideaId={idea.id} section="doneCriteria" />
                  </div>
                </section>

              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar Column */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 space-y-6"
          >
            <div className="sticky top-8">
              <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 opacity-90">
                    <Palette className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Inspiration</h3>
                  </div>
                  <p className="text-primary-foreground/90 leading-relaxed font-medium">
                    {idea.inspiration}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <CommentSection ideaId={idea.id} section="inspiration" />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 p-6 rounded-2xl bg-secondary/20 border border-border/50 text-center">
                <Target className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                <p className="font-semibold">In Planning</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <CreateIdeaDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        editingIdea={idea}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{idea.what}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Idea"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
