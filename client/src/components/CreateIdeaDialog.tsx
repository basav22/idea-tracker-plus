import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IdeaForm } from "./IdeaForm";
import { type Idea } from "@shared/schema";

interface CreateIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIdea?: Idea | null;
}

export function CreateIdeaDialog({ open, onOpenChange, editingIdea }: CreateIdeaDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editingIdea ? "Refine Your Idea" : "Capture New Idea"}
          </DialogTitle>
          <DialogDescription>
            Answer these 5 questions to clearly define your concept.
          </DialogDescription>
        </DialogHeader>
        <IdeaForm 
          idea={editingIdea || undefined} 
          onSuccess={handleSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
