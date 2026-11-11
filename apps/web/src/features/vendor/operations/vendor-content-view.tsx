"use client";

import type { VendorDashboardSnapshot } from "@mealhrs/domain";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "./vendor-operations.module.css";

export function VendorContentView({ contentDrafts, menu, posts }: Readonly<Pick<VendorDashboardSnapshot, "contentDrafts" | "menu" | "posts">>) {
  const initialCaption = contentDrafts[0]?.caption ?? "";
  const [caption, setCaption] = useState(initialCaption);
  const [offerId, setOfferId] = useState(contentDrafts[0]?.linkedOfferId ?? menu[0]?.offer.id ?? "");
  const [published, setPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const linked = useMemo(() => menu.find(({ offer }) => offer.id === offerId), [menu, offerId]);
  return <div><header className={styles.head}><div><p className={styles.eyebrow}>Food content</p><h1>Reels and posts</h1><p>Create a food story, attach the right meal, and preview its customer-facing state.</p></div></header><div className={styles.contentGrid}><section className={`card ${styles.editor}`} aria-label="Content editor"><label className={styles.field}><span>Caption</span><textarea value={caption} maxLength={280} onChange={(event) => { setCaption(event.target.value); setSaved(false); }} placeholder="Tell customers what is fresh today"/></label><label className={styles.field}><span>Linked meal</span><select value={offerId} onChange={(event) => { setOfferId(event.target.value); setSaved(false); }}>{menu.map(({ dish, offer }) => <option key={offer.id} value={offer.id}>{dish.name} · {offer.orderingMode === "immediate" ? "Available now" : "Meal Drop"}</option>)}</select></label><div className={styles.actionGroup}><Button variant="secondary" onClick={() => setSaved(true)}>Save draft</Button><Button disabled={!caption.trim()} onClick={() => setPublished(true)}>Publish preview</Button></div>{saved ? <p className={styles.feedback} role="status">Draft saved for this frontend preview only.</p> : null}{published ? <Status tone="success">Published in this frontend preview</Status> : null}</section><aside className={`card ${styles.preview}`}>{linked ? <Image src={linked.dish.imageUrl} alt={linked.dish.name} width={640} height={360}/> : null}<div><Status tone={published ? "success" : "neutral"}>{published ? "Published preview" : "Draft preview"}</Status><h2>{caption || "Your caption will appear here"}</h2><p>{linked?.dish.name ?? "Choose a meal to link this post"}</p><div className={styles.previewMeta}><span>{posts.length} active post{posts.length === 1 ? "" : "s"}</span><span>{linked?.offer.orderingMode === "meal_drop" ? "Pre-order" : "Available now"}</span></div></div></aside></div></div>;
}
