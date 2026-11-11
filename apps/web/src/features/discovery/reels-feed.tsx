"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { asAreaId, formatMoney, type DishId, type FeedMode, type MediaAsset, type Money, type OfferId, type VendorId } from "@mealhrs/domain";
import { Bookmark, ChevronRight, Compass, Heart, MapPin, MessageCircle, Minus, Plus, Search, Share2, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Status } from "@/components/ui/status";
import { addCartItem } from "@/features/cart/cart-store";
import { useCustomerContext } from "@/lib/customer-context";
import styles from "./discovery.module.css";

export type ReelItem = Readonly<{ id: string; vendor: Readonly<{ id: VendorId; name: string; handle: string; slug: string; publicArea: string; verified: boolean }>; caption: string; media: MediaAsset; engagement: Readonly<{ likes: number; comments: number; saves: number }>; meal?: Readonly<{ dishId: DishId; offerId: OfferId; name: string; imageUrl: string; price: Money; offerStatus: "available" | "preorder"; mealDropId?: string }> }>;
export type ReelFeeds = Readonly<Record<string, Readonly<Record<FeedMode, readonly ReelItem[]>>>>;
type Comment = Readonly<{ id: string; author: string; body: string }>;
type CommentReaction = "like" | "love";

const modes = [{ id: "near_me", label: "Near Me" }, { id: "following", label: "Following" }, { id: "explore_nigeria", label: "Explore Nigeria" }] as const;
const shareContacts = [{ name: "Amara", initials: "A" }, { name: "Teni", initials: "T" }, { name: "Femi", initials: "F" }, { name: "Zainab", initials: "Z" }, { name: "David", initials: "D" }] as const;

export function ReelsFeed({ feeds }: Readonly<{ feeds: ReelFeeds }>) {
  const { activeArea, setActiveArea } = useCustomerContext();
  const [mode, setMode] = useState<FeedMode>("near_me");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState("");
  const [selected, setSelected] = useState<ReelItem | null>(null);
  const [commenting, setCommenting] = useState<ReelItem | null>(null);
  const [comments, setComments] = useState<Record<string, readonly Comment[]>>({});
  const [commentReactions, setCommentReactions] = useState<Record<string, ReadonlySet<CommentReaction>>>({});
  const [commentDraft, setCommentDraft] = useState("");
  const [sharing, setSharing] = useState<ReelItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [locationOpen, setLocationOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [heartBurstId, setHeartBurstId] = useState<string | null>(null);
  const items = useMemo(() => feeds[activeArea.id]?.[mode] ?? [], [activeArea.id, feeds, mode]);
  const feedRef = useRef<HTMLDivElement>(null);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const mealTrigger = useRef<HTMLElement | null>(null);
  const locationTrigger = useRef<HTMLElement | null>(null);
  const touchTap = useRef<Readonly<{ id: string; at: number }> | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setActiveId(items[0]?.id ?? ""));
    return () => window.cancelAnimationFrame(frame);
  }, [items]);
  useEffect(() => {
    const root = feedRef.current;
    if (!root) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target instanceof HTMLElement) setActiveId(visible.target.dataset.reelId ?? "");
    }, { root, threshold: [.65, .9] });
    root.querySelectorAll<HTMLElement>("[data-reel-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);
  useEffect(() => { videos.current.forEach((video, id) => { if (id === activeId) void video.play().catch(() => undefined); else video.pause(); }); }, [activeId]);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);
  useEffect(() => {
    const meal = selected?.meal;
    if (!meal || meal.offerStatus !== "available") return;
    const vendorId = selected.vendor.id;
    const add = (event: MouseEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href="/cart"]') : null;
      if (!anchor) return;
      addCartItem({ vendorId, orderingMode: "immediate" }, { id: meal.offerId, dishId: meal.dishId, offerId: meal.offerId, name: meal.name, imageUrl: meal.imageUrl, unitPrice: meal.price, quantity, selectedOptions: [] });
    };
    document.addEventListener("click", add, true);
    return () => document.removeEventListener("click", add, true);
  }, [quantity, selected]);

  const bindVideo = useCallback((id: string, node: HTMLVideoElement | null) => { if (node) videos.current.set(id, node); else videos.current.delete(id); }, []);
  const toggle = (set: Set<string>, update: (next: Set<string>) => void, id: string) => { const next = new Set(set); if (next.has(id)) next.delete(id); else next.add(id); update(next); };
  const like = (id: string) => { setLiked((current) => current.has(id) ? current : new Set(current).add(id)); setHeartBurstId(id); window.setTimeout(() => setHeartBurstId((current) => current === id ? null : current), 650); };
  const interactiveTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest("button, a, input, textarea, select"));
  const handleReelPointerUp = (event: PointerEvent<HTMLElement>, id: string) => {
    if (event.pointerType !== "touch" || interactiveTarget(event.target)) return;
    const now = event.timeStamp;
    if (touchTap.current?.id === id && now - touchTap.current.at < 300) { like(id); touchTap.current = null; return; }
    touchTap.current = { id, at: now };
  };
  const handleShare = (item: ReelItem) => setSharing(item);
  const submitComment = () => {
    const body = commentDraft.trim();
    if (!commenting || !body) return;
    setComments((current) => ({ ...current, [commenting.id]: [...(current[commenting.id] ?? []), { id: `${Date.now()}`, author: "You", body }] }));
    setCommentDraft("");
    setFeedback("Comment added for this preview");
  };
  const toggleCommentReaction = (commentId: string, reaction: CommentReaction) => {
    setCommentReactions((current) => {
      const next = new Set(current[commentId] ?? []);
      if (next.has(reaction)) next.delete(reaction); else next.add(reaction);
      return { ...current, [commentId]: next };
    });
  };
  const emptyLocal = mode === "near_me" && !items.length;
  const context = items.find((item) => item.id === activeId) ?? items[0];

  return <div className={styles.feedPage}>
    <div className={styles.feedLayout}>
      <aside className={styles.feedSide}><Logo inverse/><nav className={styles.sideLinks} aria-label="Discovery"><Link href="/discover" aria-current="page">Discover</Link><Link href="/search">Search</Link><Link href="/following">Following</Link><Link href="/saved">Saved</Link><Link href="/notifications">Notifications</Link><Link href="/orders">Orders</Link></nav></aside>
      <section className={styles.feedFrame} aria-label="Food discovery feed"><h1 className="sr-only">Discover food near you</h1>
        <div className={styles.feedTop}><div className={styles.feedTopline}><Logo inverse mark={false}/><Dialog.Root open={locationOpen} onOpenChange={setLocationOpen}><Dialog.Trigger asChild><button ref={(node) => { if (node) locationTrigger.current = node; }} className={styles.delivery} type="button"><MapPin size={14}/>Delivering to {activeArea.name}</button></Dialog.Trigger><LocationDialog onCloseAutoFocus={(event) => { event.preventDefault(); locationTrigger.current?.focus(); }} onSelect={(name) => { setActiveArea({ id: asAreaId(name === "Ikotun" ? "area-ikotun" : name === "Egbe" ? "area-egbe" : "area-ikeja"), name, state: "Lagos" }); setLocationOpen(false); }}/></Dialog.Root></div><div className={styles.feedTabs} role="group" aria-label="Discovery feed">{modes.map((item) => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)}>{item.label}</button>)}</div><Link className={styles.feedSearch} href="/search" aria-label="Search"><Search size={21}/></Link></div>
        <div className={styles.reels} ref={feedRef} tabIndex={0} onKeyDown={(event) => { if (["ArrowDown", "PageDown", "ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); feedRef.current?.scrollBy({ top: (event.key.includes("Down") ? 1 : -1) * (feedRef.current?.clientHeight ?? 0), behavior: "smooth" }); } }}>{items.map((item, index) => {
          const commentCount = item.engagement.comments + (comments[item.id]?.length ?? 0);
          return <article className={styles.reel} data-reel-id={item.id} key={item.id} onDoubleClick={(event) => { if (!interactiveTarget(event.target)) like(item.id); }} onPointerUp={(event) => handleReelPointerUp(event, item.id)}>
            {item.media.kind === "video" ? <video ref={(node) => bindVideo(item.id, node)} className={styles.reelMedia} src={item.media.src} poster={item.media.poster} muted playsInline loop preload={index === 0 ? "metadata" : "none"} aria-label={item.media.alt}/> : <Image className={styles.reelMedia} src={item.media.src} alt={item.media.alt} fill sizes="(max-width: 900px) 100vw, 520px" priority={index === 0}/>}<div className={styles.reelScrim}/>{heartBurstId === item.id && <Heart className={styles.heartBurst} fill="currentColor" aria-hidden="true"/>}
            <div className={styles.reelActions}><Link className={styles.vendorBubble} href={`/k/${item.vendor.slug}`} aria-label={`Visit ${item.vendor.name}`}>{item.vendor.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</Link><button type="button" aria-label="Like" aria-pressed={liked.has(item.id)} onClick={() => toggle(liked, setLiked, item.id)}><Heart fill={liked.has(item.id) ? "currentColor" : "none"}/></button><small>{(item.engagement.likes + (liked.has(item.id) ? 1 : 0)).toLocaleString()}</small><button type="button" aria-label="Comments" onClick={() => { setCommenting(item); setCommentDraft(""); }}><MessageCircle/></button><small>{commentCount}</small><button type="button" aria-label="Save" aria-pressed={saved.has(item.id)} onClick={() => toggle(saved, setSaved, item.id)}><Bookmark fill={saved.has(item.id) ? "currentColor" : "none"}/></button><button type="button" aria-label="Share" onClick={() => void handleShare(item)}><Share2/></button></div>
            <div className={styles.reelCopy}><div className={styles.vendorLine}><Link href={`/k/${item.vendor.slug}`}>{item.vendor.handle}</Link>{item.vendor.verified ? <span className={styles.verified} aria-label="Verified">✓</span> : null}<button className={styles.follow} type="button" aria-pressed={followed.has(item.vendor.slug)} onClick={() => toggle(followed, setFollowed, item.vendor.slug)}>{followed.has(item.vendor.slug) ? "Following" : "Follow"}</button></div><p className={styles.vendorArea}>{item.vendor.name} · {item.vendor.publicArea}</p><p className={styles.caption}>{item.caption}</p>{item.meal ? <button className={styles.mealTray} type="button" onClick={(event) => { mealTrigger.current = event.currentTarget; setSelected(item); setQuantity(1); }}><Image src={item.meal.imageUrl} alt="" width={48} height={48}/><span><strong>{item.meal.name}</strong><span className={styles.trayMeta}><b>{formatMoney(item.meal.price)}</b><span className={`${styles.trayStatus} ${item.meal.offerStatus === "preorder" ? styles.trayStatusPre : ""}`}>{item.meal.offerStatus === "preorder" ? "Pre-order" : "Available now"}</span></span></span><ChevronRight size={17}/></button> : null}</div>
          </article>;
        })}</div>
        <nav className={styles.feedMobileNav} aria-label="Customer navigation"><Link href="/discover"><Compass/>Discover</Link><Link href="/search"><Search/>Search</Link><Link href="/orders"><ShoppingBag/>Orders</Link><Link href="/profile"><UserRound/>Profile</Link></nav>{emptyLocal ? <section className={styles.feedAlt} aria-live="polite"><div><MapPin/><h2>No kitchens deliver to {activeArea.name} yet</h2><p>Explore food across Nigeria or choose another delivery area. Food remains watchable without false ordering claims.</p><Button onClick={(event) => { locationTrigger.current = event.currentTarget; setLocationOpen(true); }}>Change location</Button><Button variant="secondary" onClick={() => setMode("explore_nigeria")}>Explore Nigeria</Button></div></section> : null}
      </section>
      <aside className={`${styles.feedSide} ${styles.context}`}>{context?.meal ? <div className={styles.contextCard}><Status tone={context.meal.offerStatus === "preorder" ? "warning" : "success"}>{context.meal.offerStatus === "preorder" ? "Pre-order" : "Available now"}</Status><h2>{context.meal.name}</h2><p>{context.vendor.name} · {mode === "explore_nigeria" ? "Check eligibility before ordering" : `Serving ${activeArea.name}`}</p><div className={styles.contextFact}><span>Meal</span><strong>{formatMoney(context.meal.price)}</strong></div><Button block onClick={(event) => { mealTrigger.current = event.currentTarget; setSelected(context); }}>View meal</Button></div> : null}</aside>
    </div>
    {feedback && <p className={styles.feedFeedback} role="status">{feedback}</p>}
    <MealDialog selected={selected} quantity={quantity} setQuantity={setQuantity} onOpenChange={(open) => !open && setSelected(null)} onCloseAutoFocus={(event) => { event.preventDefault(); mealTrigger.current?.focus(); }}/>
    <CommentsDialog item={commenting} comments={commenting ? comments[commenting.id] ?? [] : []} draft={commentDraft} reactions={commentReactions} setDraft={setCommentDraft} onReact={toggleCommentReaction} onSubmit={submitComment} onOpenChange={(open) => !open && setCommenting(null)}/>
    <ShareDialog item={sharing} onOpenChange={(open) => !open && setSharing(null)} onCopied={() => { setSharing(null); setFeedback("Link copied"); }} onReposted={() => { setSharing(null); setFeedback("Reposted in this frontend preview"); }} onSent={(name) => { setSharing(null); setFeedback(`Sent to ${name} in this frontend preview`); }}/>
  </div>;
}

function MealDialog({ selected, quantity, setQuantity, onCloseAutoFocus, onOpenChange }: Readonly<{ selected: ReelItem | null; quantity: number; setQuantity: (quantity: number) => void; onCloseAutoFocus: (event: Event) => void; onOpenChange: (open: boolean) => void }>) { return <Dialog.Root open={Boolean(selected)} onOpenChange={onOpenChange}>{selected?.meal ? <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={styles.sheet} aria-modal="true" aria-describedby="meal-description" onCloseAutoFocus={onCloseAutoFocus}><Dialog.Close className={styles.sheetClose} aria-label="Close meal details"><X/></Dialog.Close><Image className={styles.sheetMedia} src={selected.meal.imageUrl} alt={selected.meal.name} width={720} height={400}/><Status tone={selected.meal.offerStatus === "preorder" ? "warning" : "success"}>{selected.meal.offerStatus === "preorder" ? "Pre-order" : "Available now"}</Status><Dialog.Title asChild><h2>{selected.meal.name}</h2></Dialog.Title><p className={styles.sheetVendor}>{selected.vendor.name} · Check current fulfillment eligibility</p><p id="meal-description" className={styles.small}>{selected.caption}</p><div className={styles.split}><span>Quantity</span><div className={styles.quantity}><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus/></button><output>{quantity}</output><button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus/></button></div></div><div className={styles.sheetTotal}><div><small>Total</small><strong>{formatMoney({ ...selected.meal.price, amount: selected.meal.price.amount * quantity })}</strong></div><Button asChild><Link href={selected.meal.offerStatus === "preorder" && selected.meal.mealDropId ? `/drops/${selected.meal.mealDropId}` : "/cart"}>{selected.meal.offerStatus === "preorder" ? "View Meal Drop" : "Add to order"}</Link></Button></div></Dialog.Content></Dialog.Overlay></Dialog.Portal> : null}</Dialog.Root>; }

function CommentsDialog({ comments, draft, item, onOpenChange, onReact, onSubmit, reactions, setDraft }: Readonly<{ comments: readonly Comment[]; draft: string; item: ReelItem | null; onOpenChange: (open: boolean) => void; onReact: (commentId: string, reaction: CommentReaction) => void; onSubmit: () => void; reactions: Record<string, ReadonlySet<CommentReaction>>; setDraft: (value: string) => void }>) { return <Dialog.Root open={Boolean(item)} onOpenChange={onOpenChange}>{item ? <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={`${styles.sheet} ${styles.commentsSheet}`} aria-describedby="comments-description"><Dialog.Close className={styles.sheetClose} aria-label="Close comments"><X/></Dialog.Close><p className={styles.eyebrow}>Comments</p><Dialog.Title asChild><h2>Join the conversation</h2></Dialog.Title><Dialog.Description id="comments-description" className={styles.small}>Comments are saved only in this frontend preview for now.</Dialog.Description><div className={styles.commentList}>{comments.length ? comments.map((comment) => { const reaction = reactions[comment.id] ?? new Set<CommentReaction>(); return <div className={styles.comment} key={comment.id}><div className={styles.commentReactions}><button type="button" aria-label="Like comment" aria-pressed={reaction.has("like")} onClick={() => onReact(comment.id, "like")}>👍 <span>{reaction.has("like") ? 1 : 0}</span></button><button type="button" aria-label="Love comment" aria-pressed={reaction.has("love")} onClick={() => onReact(comment.id, "love")}>❤️ <span>{reaction.has("love") ? 1 : 0}</span></button></div><p><strong>{comment.author}</strong>{comment.body}</p></div>; }) : <p className={styles.small}>No preview comments yet. Be the first to respond.</p>}</div><form className={styles.commentForm} onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><label className="sr-only" htmlFor="reel-comment">Add a comment</label><input id="reel-comment" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={280} placeholder="Add a comment"/><Button type="submit" disabled={!draft.trim()}>Post</Button></form></Dialog.Content></Dialog.Overlay></Dialog.Portal> : null}</Dialog.Root>; }

function ShareDialog({ item, onCopied, onOpenChange, onReposted, onSent }: Readonly<{ item: ReelItem | null; onCopied: () => void; onOpenChange: (open: boolean) => void; onReposted: () => void; onSent: (name: string) => void }>) {
  const url = item ? `${typeof window === "undefined" ? "" : window.location.origin}/k/${item.vendor.slug}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(url); onCopied(); } catch { /* The visible link remains available for manual copy. */ } };
  const nativeShare = async () => { if (!item) return; try { await navigator.share({ title: `${item.meal?.name ?? "Food"} · MealHrs`, text: item.caption, url }); } catch { /* Unsupported devices, closing, or declining the native share sheet need no extra feedback. */ } };
  const message = encodeURIComponent(`${item?.meal?.name ?? "Food"} on MealHrs ${url}`);
  return <Dialog.Root open={Boolean(item)} onOpenChange={onOpenChange}>{item ? <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={`${styles.sheet} ${styles.shareSheet}`} aria-describedby="share-description"><Dialog.Close className={styles.sheetClose} aria-label="Close share"><X/></Dialog.Close><p className={styles.eyebrow}>Share to</p><Dialog.Title asChild><h2>Send this food story</h2></Dialog.Title><Dialog.Description id="share-description" className={styles.small}>Share with people you know or choose another app.</Dialog.Description><div className={styles.shareContacts} aria-label="Send to a friend">{shareContacts.map((contact) => <button key={contact.name} type="button" aria-label={`Send to ${contact.name}`} onClick={() => onSent(contact.name)}><span aria-hidden="true">{contact.initials}</span><small>{contact.name}</small></button>)}</div><div className={styles.shareDivider}/><div className={styles.shareActions}><button type="button" aria-label="Repost" onClick={onReposted}><span aria-hidden="true">↻</span><small>Repost</small></button><a aria-label="WhatsApp" href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"><span aria-hidden="true">◔</span><small>WhatsApp</small></a><button type="button" aria-label="Copy link" onClick={() => void copy()}><span aria-hidden="true">⧉</span><small>Copy link</small></button><a aria-label="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"><span aria-hidden="true">f</span><small>Facebook</small></a><button type="button" aria-label="More sharing options" onClick={() => void nativeShare()}><span aria-hidden="true">⋯</span><small>More</small></button></div></Dialog.Content></Dialog.Overlay></Dialog.Portal> : null}</Dialog.Root>;
}

function LocationDialog({ onCloseAutoFocus, onSelect }: Readonly<{ onCloseAutoFocus: (event: Event) => void; onSelect: (name: "Ikotun" | "Egbe" | "Ikeja") => void }>) { const [value, setValue] = useState<"Ikotun" | "Egbe" | "Ikeja">("Ikotun"); return <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={styles.sheet} aria-modal="true" onCloseAutoFocus={onCloseAutoFocus}><Dialog.Close className={styles.sheetClose} aria-label="Close location"><X/></Dialog.Close><p className={styles.eyebrow}>Delivery area</p><Dialog.Title asChild><h2>Where should food reach you?</h2></Dialog.Title><Dialog.Description className={styles.small}>Choose an area to revalidate discovery and ordering eligibility.</Dialog.Description><label className={styles.field}><span>Area</span><select className={styles.select} value={value} onChange={(event) => setValue(event.target.value as typeof value)}><option>Ikotun</option><option>Egbe</option><option>Ikeja</option></select></label><p className={`${styles.notice} ${value === "Ikeja" ? styles.noticeWarning : ""}`}>{value === "Ikeja" ? "Near Me has no eligible kitchens in this scenario. Explore Nigeria remains available." : `${value} has eligible kitchens in this scenario.`}</p><Button block onClick={() => onSelect(value)}>Use {value}</Button></Dialog.Content></Dialog.Overlay></Dialog.Portal>; }
