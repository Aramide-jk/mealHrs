import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <div className="page page--narrow">
      <EmptyState
        title="We couldn’t find that page"
        description="The meal, kitchen, or page may have moved. Return to discovery to find something fresh."
        icon={<SearchX aria-hidden="true" />}
        action={<Button asChild><a href="/discover">Back to Discover</a></Button>}
      />
    </div>
  );
}
