"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedTabs, type TabItem } from "../discovery/segmented-tabs";
import styles from "../discovery/discovery.module.css";

export function SavedContent({tabs}:Readonly<{tabs:readonly TabItem[]}>){const [empty,setEmpty]=useState(false); return <><div className={styles.stateTools}><label className={styles.field}><span className="sr-only">Preview state</span><select className={styles.select} value={empty?"empty":"content"} onChange={e=>setEmpty(e.target.value==="empty")} aria-label="Preview saved state"><option value="content">With saved items</option><option value="empty">Empty</option></select></label></div>{empty?<EmptyState icon={<Bookmark/>} title="Nothing saved yet" description="Save meals and food stories while you explore. They will stay here for later." action={<Button asChild><a href="/discover">Discover food</a></Button>}/>:<SegmentedTabs items={tabs}/>}</>}
