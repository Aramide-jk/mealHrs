import { repositories } from "@/lib/repositories";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FollowingContent } from "@/features/discovery/following-content";
import styles from "@/features/discovery/discovery.module.css";

export default async function FollowingPage() {
  const result = await repositories.discovery.getFollowedVendors();
  const vendors = result.ok ? result.data : [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className={styles.eyebrow}>Your kitchens</p>
          <h1>Following</h1>
          <p>New pre-orders and food stories from kitchens you care about.</p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/discover">Following feed</Link>
        </Button>
      </div>

      <FollowingContent allVendors={vendors} />

      <EmptyState
        title="Want a more personal feed?"
        description="New posts and pre-orders from kitchens you follow will appear in your Following feed."
        action={
          <Button asChild>
            <Link href="/search">Find kitchens</Link>
          </Button>
        }
      />
    </div>
  );
}
