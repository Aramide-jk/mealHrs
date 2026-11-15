import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "@/features/discovery/discovery.module.css";
import { loadAllMeals } from "@/features/discovery/load";
import { PreviewCategoryMeals } from "@/features/discovery/preview-category-meals";
import { areaName } from "@/features/location/area-copy";
import { getActiveAreaId } from "@/lib/active-area";

export default async function CategoryPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
  const [{ slug }, meals, activeAreaId] = await Promise.all([params, loadAllMeals(), getActiveAreaId()]);
  const category = slug === "soups" ? "Soups" : slug === "bakes" ? "Bakery" : slug === "rice" ? "Rice" : "";
  const title = slug === "soups" ? "Soups & swallow" : slug === "bakes" ? "Bakes & snacks" : slug === "rice" ? "Rice meals" : "Food category";
  const location = areaName(activeAreaId);
  const now = new Date().toISOString();
  return <div className="page"><div className="page-head"><div><p className={styles.eyebrow}>Food category</p><h1>{title}</h1><p>Fresh meals from kitchens serving {location}.</p></div><Button variant="secondary" size="sm"><Filter size={15} />Filters</Button></div><div className={styles.horizontalChips}><button className={`${styles.chip} ${styles.chipActive}`}>All</button><button className={styles.chip}>Available now</button><button className={styles.chip}>Pre-order</button><button className={styles.chip}>Under ₦5,000</button></div><h2 className="sr-only">Meals in this category</h2>{category ? <PreviewCategoryMeals category={category} seed={meals} now={now} /> : <div className={styles.empty} style={{ marginTop: 20 }}><div><h2>No meals in this category yet</h2><p>Explore other food near {location} or check again later.</p></div></div>}</div>;
}
