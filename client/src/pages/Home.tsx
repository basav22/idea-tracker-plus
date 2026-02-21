import { useIdeas } from "@/hooks/use-ideas";
import { IdeaCard } from "@/components/IdeaCard";
import { IdeaTable } from "@/components/IdeaTable";
import { CreateIdeaDialog } from "@/components/CreateIdeaDialog";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { type Idea } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: ideas, isLoading, error } = useIdeas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const handleCreate = () => {
    setEditingIdea(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-md space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-4">
            <Lightbulb className="w-8 h-8 rotate-180 opacity-50" />
          </div>
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Decorative background element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl opacity-50" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-primary">
                Idea Tracker
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mt-4 leading-relaxed">
                A minimal space to capture, refine, and track your next big thing.
                Defined by clarity, focused on execution.
              </p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center bg-secondary/30 p-1 rounded-lg border border-border/50">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              size="lg" 
              onClick={handleCreate}
              className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Capture New Idea
            </Button>
          </motion.div>
        </header>

        <main>
          {!ideas || ideas.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 border border-dashed border-border rounded-3xl bg-secondary/20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background shadow-sm mb-6">
                <Lightbulb className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-2 font-display">No ideas yet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Every great project starts with a single thought. Capture your first idea now.
              </p>
              <Button onClick={handleCreate} variant="outline" className="bg-background">
                Create First Idea
              </Button>
            </motion.div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {ideas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <IdeaCard 
                      idea={idea} 
                      onEdit={handleEdit} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <IdeaTable ideas={ideas} onEdit={handleEdit} />
            </motion.div>
          )}
        </main>
      </div>

      <CreateIdeaDialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingIdea(null);
        }}
        editingIdea={editingIdea}
      />
    </div>
  );
}
