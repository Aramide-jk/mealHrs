import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "@/features/discovery/discovery.module.css";
import { ResultRow } from "@/features/discovery/result-row";
import { areaName } from "@/features/location/area-copy";
import { PreviewSearchMeals } from "@/features/search/preview-menu-results";
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
  const storyPreview = (post: (typeof data.posts)[number]) => {
    if (post.media.kind === "carousel") return post.media.items[0];
    return post.media.kind === "video"
      ? { src: post.media.poster ?? post.media.src, alt: post.media.alt }
      : post.media;
  };
  const tabs = [
    { id: "meals", label: "Meals", panel: <PreviewSearchMeals query={query} seed={data.dishes} now={now} /> },
    { id: "kitchens", label: "Kitchens", panel: data.vendors.length ? <div className={styles.resultList}>{data.vendors.map(vendor => <ResultRow key={vendor.id} href={`/k/${vendor.slug}`} imageUrl={vendor.avatarUrl} imageAlt={vendor.name} title={vendor.name} description={`Verified · ${vendor.rating} · ${vendor.publicArea}`} meta={<Status>Accepting orders</Status>} />)}</div> : <div className={styles.empty}><p>No kitchens matched this search.</p></div> },
    { id: "videos", label: "Videos", panel: data.posts.length ? <div className={styles.resultList}>{data.posts.map(post => { const preview = storyPreview(post); return <ResultRow key={post.id} href="/discover" imageUrl={preview?.src ?? "/assets/hero-jollof.png"} imageAlt={preview?.alt ?? "Food story"} title={post.caption} description="Food story" />; })}</div> : <div className={styles.empty}><p>No food stories matched this search.</p></div> },
  ] as const;
  const empty = !data.dishes.length && !data.vendors.length && !data.posts.length;
  const location = areaName(activeAreaId);
  return <div className="page"><div className="page-head"><div><p className={styles.eyebrow}>Search results</p><h1>{query ? `“${query}” near ${location}` : `Food near ${location}`}</h1><p>Orderable meals are ranked before distant inspiration.</p></div><Button asChild variant="secondary" size="sm"><Link href="/search">Change search</Link></Button></div>{empty ? <div className={styles.empty}><div><h2>No matches for “{query}”</h2><p>Try another dish, kitchen or food category.</p></div></div> : <SearchResults query={query} tabs={tabs} />}</div>;
}
