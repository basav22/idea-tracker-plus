import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIdeaSchema, type Idea } from "@shared/schema";
import { type IdeaInput } from "@shared/routes";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIdea, useUpdateIdea } from "@/hooks/use-ideas";

interface IdeaFormProps {
  idea?: Idea;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IdeaForm({ idea, onSuccess, onCancel }: IdeaFormProps) {
  const createMutation = useCreateIdea();
  const updateMutation = useUpdateIdea();
  const isEditing = !!idea;

  const form = useForm<IdeaInput>({
    resolver: zodResolver(insertIdeaSchema),
    defaultValues: {
      what: idea?.what ?? "",
      who: idea?.who ?? "",
      features: idea?.features ?? "",
      doneCriteria: idea?.doneCriteria ?? "",
      inspiration: idea?.inspiration ?? "",
    },
  });

  const onSubmit = async (data: IdeaInput) => {
    try {
      if (isEditing && idea) {
        await updateMutation.mutateAsync({ id: idea.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="what"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1. What does it do?</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. A personal finance tracker for freelancers" {...field} />
                </FormControl>
                <FormDescription>The core value proposition of your idea.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="who"
            render={({ field }) => (
              <FormItem>
                <FormLabel>2. Who is it for?</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Remote workers, digital nomads, contractors" {...field} />
                </FormControl>
                <FormDescription>Identify your target audience.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <FormLabel>3. Key Features (3-5 items)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="1. Invoice generation&#10;2. Expense tracking&#10;3. Tax estimation" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>The absolute must-have features for MVP.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="doneCriteria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>4. What does &quot;done&quot; look like?</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="User can sign up, connect bank account, and see monthly burn rate." 
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>Define the scope for completion.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inspiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>5. Design Inspiration</FormLabel>
                <FormControl>
                  <Input placeholder="E.g. Clean like Linear, colorful like Notion" {...field} />
                </FormControl>
                <FormDescription>Existing apps or styles to reference.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update Idea" : "Create Idea"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
