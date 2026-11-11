import { formatMoney } from "@mealhrs/domain";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "@/features/discovery/discovery.module.css";
import { ResultRow } from "@/features/discovery/result-row";
import { areaName } from "@/features/location/area-copy";
import { isCutoffPassed } from "@/features/meal-drops/effective-availability";
import { SearchResults } from "@/features/search/search-results";
import { getActiveAreaId } from "@/lib/active-area";
import { repositories } from "@/lib/repositories";

export default async function ResultsPage({ searchParams }: Readonly<{ searchParams: Promise<{ q?: string }> }>) {
  const [params, activeAreaId] = await Promise.all([searchParams, getActiveAreaId()]);
  const query = params.q?.trim() ?? "";
  const result = await repositories.discovery.search({ query, areaId: activeAreaId });
  if (!result.ok) throw new Error(result.error.message);
  const data = result.data;
  const now = new Date().toISOString();
  const tabs = [
    { id: "meals", label: "Meals", panel: data.dishes.length ? <div className={styles.resultList}>{data.dishes.map(({ dish, offer, vendor }) => { const expired = offer.availability.status === "preorder" && isCutoffPassed(offer.availability.cutoffAt, now); return <ResultRow key={offer.id} href={offer.orderingMode === "meal_drop" ? `/drops/${offer.mealDropId}` : `/dishes/${dish.id}`} imageUrl={dish.imageUrl} imageAlt={dish.name} title={dish.name} description={`${vendor.name} · ${vendor.publicArea}`} meta={<span className={styles.split}><Status tone={expired ? "neutral" : offer.orderingMode === "meal_drop" ? "warning" : "success"}>{expired ? "Cutoff passed" : offer.orderingMode === "meal_drop" ? "Pre-order" : "Available now"}</Status><strong>{formatMoney(offer.price)}</strong></span>} />; })}</div> : <div className={styles.empty}><p>No meals matched this search.</p></div> },
    { id: "kitchens", label: "Kitchens", panel: data.vendors.length ? <div className={styles.resultList}>{data.vendors.map(vendor => <ResultRow key={vendor.id} href={`/k/${vendor.slug}`} imageUrl={vendor.avatarUrl} imageAlt={vendor.name} title={vendor.name} description={`Verified · ${vendor.rating} · ${vendor.publicArea}`} meta={<Status>Accepting orders</Status>} />)}</div> : <div className={styles.empty}><p>No kitchens matched this search.</p></div> },
    { id: "videos", label: "Videos", panel: data.posts.length ? <div className={styles.resultList}>{data.posts.map(post => <ResultRow key={post.id} href="/discover" imageUrl={post.media.poster ?? post.media.src} imageAlt={post.media.alt} title={post.caption} description="Food story" />)}</div> : <div className={styles.empty}><p>No food stories matched this search.</p></div> },
  ] as const;
  const empty = !data.dishes.length && !data.vendors.length && !data.posts.length;
  const location = areaName(activeAreaId);
  return <div className="page"><div className="page-head"><div><p className={styles.eyebrow}>Search results</p><h1>{query ? `“${query}” near ${location}` : `Food near ${location}`}</h1><p>Orderable meals are ranked before distant inspiration.</p></div><Button asChild variant="secondary" size="sm"><Link href="/search">Change search</Link></Button></div>{empty ? <div className={styles.empty}><div><h2>No matches for “{query}”</h2><p>Try another dish, kitchen or food category.</p></div></div> : <SearchResults query={query} tabs={tabs} />}</div>;
}
