import { repositories } from "@/lib/repositories";
import { Status } from "@/components/ui/status";
import { loadAllMeals } from "@/features/discovery/load";
import { MealCard } from "@/features/discovery/meal-card";
import { ResultRow } from "@/features/discovery/result-row";
import { SavedContent } from "@/features/saved/saved-content";
import styles from "@/features/discovery/discovery.module.css";

export default async function SavedPage(){const meals=await loadAllMeals();const vendors=await repositories.discovery.getFollowedVendors();const tabs=[{id:"meals",label:"Meals",panel:<div className={styles.dishGrid}>{meals.slice(0,2).map(m=><MealCard key={m.offer.id} {...m}/>)}</div>},{id:"posts",label:"Posts",panel:<div className={styles.empty}><div><h2>Your saved food stories live here</h2><p>Save a post from the Reels feed to find it again.</p></div></div>},{id:"kitchens",label:"Kitchens",panel:<div className={styles.resultList}>{vendors.ok?vendors.data.map(v=><ResultRow key={v.id} href={`/k/${v.slug}`} imageUrl={v.avatarUrl} imageAlt={v.name} title={v.name} description={`${v.publicArea} · ${v.rating}`} meta={<Status>Following</Status>}/>):null}</div>}] as const;return <div className="page"><div className="page-head"><div><p className={styles.eyebrow}>Your collection</p><h1>Saved</h1><p>Meals, drops and kitchens you want to come back to.</p></div></div><SavedContent tabs={tabs}/></div>}
