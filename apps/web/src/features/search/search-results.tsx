"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";
import { SegmentedTabs, type TabItem } from "../discovery/segmented-tabs";
import styles from "../discovery/discovery.module.css";

type ResultState = "content" | "loading" | "empty" | "error";

export function SearchResults({ query, tabs }: Readonly<{ query: string; tabs: readonly TabItem[] }>) {
  const [state,setState] = useState<ResultState>("content");
  let content: ReactNode = <SegmentedTabs items={tabs}/>;
  if(state === "loading") content = <div role="status" aria-label="Loading search results" className={styles.resultList}><Skeleton style={{height:98}}/><Skeleton style={{height:98}}/></div>;
  if(state === "empty") content = <EmptyState title={`No exact matches for “${query}”`} description="Try a broader search or browse food categories near Ikotun." action={<Button asChild><Link href="/search">Change search</Link></Button>}/>;
  if(state === "error") content = <EmptyState title="Something interrupted the search" description="Your query is still here. Check your connection and try again." action={<Button onClick={()=>setState("content")}>Try again</Button>}/>;
  return <><div className={styles.stateTools}><label className={styles.field}><span className="sr-only">Preview state</span><select className={styles.select} value={state} onChange={(e)=>setState(e.target.value as ResultState)} aria-label="Preview results state"><option value="content">Results</option><option value="loading">Loading</option><option value="empty">Empty</option><option value="error">Error</option></select></label></div>{state === "error" ? <Notice tone="danger">Search could not be refreshed. No filters or query text were lost.</Notice> : null}{content}</>;
}
