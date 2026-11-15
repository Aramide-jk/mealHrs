import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { loadAllMeals } from "@/features/discovery/load";
import { ResultRow } from "@/features/discovery/result-row";
import styles from "@/features/discovery/discovery.module.css";

export default async function SearchPage() {
  const meals = await loadAllMeals(); const first=meals[0];
  return <div className="page"><section className={styles.searchHero}><p className={styles.eyebrow}>Find your next meal</p><h1>Search food, kitchens and pre-orders</h1><form className={styles.searchBox} action="/search/results"><Search className={styles.searchIcon}/><input name="q" defaultValue="jollof" aria-label="Search MealHrs"/><Button className={styles.searchSubmit} type="submit">Search</Button></form></section><div className={styles.stackLg}><section><div className={styles.sectionTitle}><h2>Recent searches</h2><Button variant="ghost" size="sm">Clear</Button></div><div className={styles.horizontalChips}><Link className={styles.chip} href="/search/results?q=jollof">Jollof rice</Link><Link className={styles.chip} href="/search/results?q=egusi">Egusi</Link><Link className={styles.chip} href="/search/results?q=small-chops">Small chops</Link></div></section><section><div className={styles.sectionTitle}><h2>Browse by category</h2></div><div className={styles.categoryGrid}>{[{src:"/assets/hero-jollof.png",alt:"Rice meals",label:"Rice meals",slug:"rice"},{src:"/assets/egusi-pounded-yam.png",alt:"Soups and swallow",label:"Soups & swallow",slug:"soups"},{src:"/assets/bakery-drop.png",alt:"Bakes and snacks",label:"Bakes & snacks",slug:"bakes"}].map(c=><Link className={styles.categoryCircle} href={`/categories/${c.slug}`} key={c.slug}><Image src={c.src} alt={c.alt} width={172} height={172}/><span>{c.label}</span></Link>)}</div></section>{first ? <section><div className={styles.sectionTitle}><h2>Serving Ikotun now</h2><Link href="/search/results">See all</Link></div><div className={styles.resultList}><ResultRow href={`/dishes/${first.dish.id}`} imageUrl={first.dish.imageUrl} imageAlt={first.dish.name} title={first.dish.name} description={`${first.vendor.name} · 25–35 min`} meta={<Status>Available now</Status>}/></div></section>:null}</div></div>;
}
