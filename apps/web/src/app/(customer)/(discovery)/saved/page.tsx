import { repositories } from "@/lib/repositories";
import { loadAllMeals } from "@/features/discovery/load";
import { SavedContent } from "@/features/saved/saved-content";
import styles from "@/features/discovery/discovery.module.css";

export default async function SavedPage() {
  const [meals, vendorsResult] = await Promise.all([
    loadAllMeals(),
    repositories.discovery.getFollowedVendors(),
  ]);
  const vendors = vendorsResult.ok ? vendorsResult.data : [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className={styles.eyebrow}>Your collection</p>
          <h1>Saved</h1>
          <p>Meals, drops and kitchens you want to come back to.</p>
        </div>
      </div>
      <SavedContent allMeals={meals} allVendors={vendors} />
    </div>
  );
}
