import { repositories } from "@/lib/repositories";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Status } from "@/components/ui/status";
import { ResultRow } from "@/features/discovery/result-row";
import styles from "@/features/discovery/discovery.module.css";

export default async function FollowingPage(){const result=await repositories.discovery.getFollowedVendors();const vendors=result.ok?result.data:[];return <div className="page"><div className="page-head"><div><p className={styles.eyebrow}>Your kitchens</p><h1>Following</h1><p>New drops and food stories from kitchens you care about.</p></div><Button asChild variant="secondary" size="sm"><Link href="/discover">Following feed</Link></Button></div>{vendors.length?<div className={styles.resultList}>{vendors.map(v=><ResultRow key={v.id} href={`/k/${v.slug}`} imageUrl={v.avatarUrl} imageAlt={v.name} title={v.name} description={`${v.publicArea} · ${v.acceptsOrders?"Available now":"Paused"} · ${v.rating}`} meta={<Status tone={v.acceptsOrders?"success":"neutral"}>{v.acceptsOrders?"New menu today":"Orders paused"}</Status>}/>)}</div>:<EmptyState title="No followed kitchens yet" description="Follow kitchens from search or their storefront to build a personal food feed." action={<Button asChild><Link href="/search">Find kitchens</Link></Button>}/>}<EmptyState title="Want a more personal feed?" description="New posts and Meal Drops from kitchens you follow will appear in your Following feed." action={<Button asChild><Link href="/search">Find kitchens</Link></Button>}/></div>}
