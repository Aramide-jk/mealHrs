import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="page" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading MealHrs</span>
      <Skeleton style={{ height: 32, width: "42%", marginBottom: 24 }} />
      <Skeleton style={{ height: 220, width: "100%" }} />
    </div>
  );
}
