import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4 shadow-xl border-border/50">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold font-display text-foreground">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            We couldn't find the page you were looking for. It might have been removed or renamed.
          </p>
          
          <div className="mt-8 flex justify-end">
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
