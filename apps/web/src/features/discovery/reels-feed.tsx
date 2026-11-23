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
import { isImmediateOrderingOpen, type MenuPreviewItem, useMenuPreview } from "@/lib/menu-preview-context";
import { useCustomerActivity } from "@/lib/customer-activity-context";
import styles from "./discovery.module.css";

export type ReelItem = Readonly<{ id: string; vendor: Readonly<{ id: VendorId; name: string; handle: string; slug: string; publicArea: string; verified: boolean }>; caption: string; media: MediaAsset; engagement: Readonly<{ likes: number; comments: number; saves: number }>; meal?: Readonly<{ dishId: DishId; offerId: OfferId; name: string; imageUrl: string; price: Money; offerStatus: "available" | "preorder" | "unavailable"; mealDropId?: string }> }>;
export type ReelFeeds = Readonly<Record<string, Readonly<Record<FeedMode, readonly ReelItem[]>>>>;
type Comment = Readonly<{ id: string; author: string; body: string }>;
type CommentReaction = "like" | "love";

const modes = [{ id: "near_me", label: "Near Me" }, { id: "following", label: "Following" }, { id: "explore_nigeria", label: "Explore Nigeria" }] as const;
const shareContacts = [{ name: "Amara", initials: "A" }, { name: "Teni", initials: "T" }, { name: "Femi", initials: "F" }, { name: "Zainab", initials: "Z" }, { name: "David", initials: "D" }] as const;

export function ReelsFeed({ feeds }: Readonly<{ feeds: ReelFeeds }>) {
  const { activeArea, setActiveArea } = useCustomerContext();
  const { items: menuItems, schedule } = useMenuPreview();
  const { isVendorFollowed, toggleFollowVendor, isPostSaved, toggleSavePost } = useCustomerActivity();
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
  const [carouselSlides, setCarouselSlides] = useState<Record<string, number>>({});
  const items = useMemo(() => (feeds[activeArea.id]?.[mode] ?? []).map((item) => {
    if (!item.meal) return item;
    const preview = menuItems.find((entry) => entry.offer.id === item.meal?.offerId);
    if (!preview) return item;
    const unavailable = preview.archived || preview.remainingToday < 1 || (preview.offer.orderingMode === "immediate" && !isImmediateOrderingOpen(schedule)) || preview.offer.availability.status === "unavailable";
    return { ...item, meal: { ...item.meal, dishId: preview.dish.id, offerId: preview.offer.id, name: preview.dish.name, imageUrl: preview.dish.imageUrl, price: preview.offer.price, offerStatus: unavailable ? "unavailable" as const : preview.offer.orderingMode === "meal_drop" ? "preorder" as const : "available" as const } };
  }), [activeArea.id, feeds, menuItems, mode, schedule]);
  const feedRef = useRef<HTMLDivElement>(null);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const mealTrigger = useRef<HTMLElement | null>(null);
  const locationTrigger = useRef<HTMLElement | null>(null);
  const touchTap = useRef<Readonly<{ id: string; at: number }> | null>(null);
  const carouselTouchStart = useRef<Readonly<{ id: string; x: number; y: number }> | null>(null);

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
  const bindVideo = useCallback((id: string, node: HTMLVideoElement | null) => { if (node) videos.current.set(id, node); else videos.current.delete(id); }, []);
  const setCarouselSlide = (id: string, total: number, next: number) => setCarouselSlides((current) => ({ ...current, [id]: (next + total) % total }));
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
          const carousel = item.media.kind === "carousel" ? item.media : null;
          const standardMedia = item.media.kind === "carousel" ? null : item.media;
          const slideIndex = carousel ? carouselSlides[item.id] ?? 0 : 0;
          const carouselItem = carousel?.items[slideIndex] ?? null;
          const changeSlide = (next: number) => { if (carousel) setCarouselSlide(item.id, carousel.items.length, next); };
          return <article className={styles.reel} data-reel-id={item.id} key={item.id} onDoubleClick={(event) => { if (!interactiveTarget(event.target)) like(item.id); }} onPointerUp={(event) => handleReelPointerUp(event, item.id)}>
            {standardMedia?.kind === "video" ? <video ref={(node) => bindVideo(item.id, node)} className={styles.reelMedia} src={standardMedia.src} poster={standardMedia.poster} muted playsInline loop preload={index === 0 ? "metadata" : "none"} aria-label={standardMedia.alt}/> : carousel && carouselItem ? <div className={styles.carousel} role="group" aria-label={`Photo carousel, slide ${slideIndex + 1} of ${carousel.items.length}`} tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); changeSlide(slideIndex - 1); } if (event.key === "ArrowRight") { event.preventDefault(); changeSlide(slideIndex + 1); } }} onPointerDown={(event) => { carouselTouchStart.current = { id: item.id, x: event.clientX, y: event.clientY }; }} onPointerUp={(event) => { const start = carouselTouchStart.current; carouselTouchStart.current = null; if (!start || start.id !== item.id) return; const xDistance = event.clientX - start.x; const yDistance = event.clientY - start.y; if (Math.abs(xDistance) > 36 && Math.abs(xDistance) > Math.abs(yDistance)) { event.stopPropagation(); changeSlide(slideIndex + (xDistance < 0 ? 1 : -1)); } }}><Image className={styles.reelMedia} src={carouselItem.src} alt={carouselItem.alt} fill sizes="(max-width: 900px) 100vw, 520px" priority={index === 0}/><div className={styles.carouselControls}><div className={styles.carouselIndicators} aria-label="Select carousel photo">{carousel.items.map((slide, position) => <button key={`${slide.src}-${position}`} type="button" aria-label={`Show photo ${position + 1} of ${carousel.items.length}`} aria-current={position === slideIndex ? "true" : undefined} onClick={() => changeSlide(position)}>{position + 1}</button>)}</div></div></div> : standardMedia ? <Image className={styles.reelMedia} src={standardMedia.src} alt={standardMedia.alt} fill sizes="(max-width: 900px) 100vw, 520px" priority={index === 0}/> : null}<div className={styles.reelScrim}/>{heartBurstId === item.id && <Heart className={styles.heartBurst} fill="currentColor" aria-hidden="true"/>}
            <div className={styles.reelActions}><Link className={styles.vendorBubble} href={`/k/${item.vendor.slug}`} aria-label={`Visit ${item.vendor.name}`}>{item.vendor.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</Link><button type="button" aria-label="Like" aria-pressed={liked.has(item.id)} onClick={() => toggle(liked, setLiked, item.id)}><Heart fill={liked.has(item.id) ? "currentColor" : "none"}/></button><small>{(item.engagement.likes + (liked.has(item.id) ? 1 : 0)).toLocaleString()}</small><button type="button" aria-label="Comments" onClick={() => { setCommenting(item); setCommentDraft(""); }}><MessageCircle/></button><small>{commentCount}</small><button type="button" aria-label="Save" aria-pressed={isPostSaved(item.id) || saved.has(item.id)} onClick={() => { toggle(saved, setSaved, item.id); toggleSavePost(item.id); }}><Bookmark fill={isPostSaved(item.id) || saved.has(item.id) ? "currentColor" : "none"}/></button><button type="button" aria-label="Share" onClick={() => void handleShare(item)}><Share2/></button></div>
            <div className={styles.reelCopy}><div className={styles.vendorLine}><Link href={`/k/${item.vendor.slug}`}>{item.vendor.handle}</Link>{item.vendor.verified ? <span className={styles.verified} aria-label="Verified">✓</span> : null}<button className={styles.follow} type="button" aria-pressed={isVendorFollowed(item.vendor.id) || followed.has(item.vendor.slug)} onClick={() => { toggle(followed, setFollowed, item.vendor.slug); toggleFollowVendor(item.vendor.id); }}>{(isVendorFollowed(item.vendor.id) || followed.has(item.vendor.slug)) ? "Following" : "Follow"}</button></div><p className={styles.vendorArea}>{item.vendor.name} · {item.vendor.publicArea}</p><p className={styles.caption}>{item.caption}</p>{item.meal ? <button className={styles.mealTray} type="button" onClick={(event) => { mealTrigger.current = event.currentTarget; setSelected(item); setQuantity(1); }}><Image src={item.meal.imageUrl} alt="" width={48} height={48}/><span><strong>{item.meal.name}</strong><span className={styles.trayMeta}><b>{formatMoney(item.meal.price)}</b><span className={`${styles.trayStatus} ${item.meal.offerStatus === "preorder" ? styles.trayStatusPre : ""}`}>{item.meal.offerStatus === "preorder" ? "Pre-order" : item.meal.offerStatus === "unavailable" ? "Unavailable" : "Available now"}</span></span></span><ChevronRight size={17}/></button> : null}</div>
          </article>;
        })}</div>
        <nav className={styles.feedMobileNav} aria-label="Customer navigation"><Link href="/discover"><Compass/>Discover</Link><Link href="/search"><Search/>Search</Link><Link href="/orders"><ShoppingBag/>Orders</Link><Link href="/profile"><UserRound/>Profile</Link></nav>{emptyLocal ? <section className={styles.feedAlt} aria-live="polite"><div><MapPin/><h2>No kitchens deliver to {activeArea.name} yet</h2><p>Explore food across Nigeria or choose another delivery area. Food remains watchable without false ordering claims.</p><Button onClick={(event) => { locationTrigger.current = event.currentTarget; setLocationOpen(true); }}>Change location</Button><Button variant="secondary" onClick={() => setMode("explore_nigeria")}>Explore Nigeria</Button></div></section> : null}
      </section>
      <aside className={`${styles.feedSide} ${styles.context}`}>{context?.meal ? <div className={styles.contextCard}><Status tone={context.meal.offerStatus === "preorder" ? "warning" : context.meal.offerStatus === "unavailable" ? "neutral" : "success"}>{context.meal.offerStatus === "preorder" ? "Pre-order" : context.meal.offerStatus === "unavailable" ? "Unavailable" : "Available now"}</Status><h2>{context.meal.name}</h2><p>{context.vendor.name} · {mode === "explore_nigeria" ? "Check eligibility before ordering" : `Serving ${activeArea.name}`}</p><div className={styles.contextFact}><span>Meal</span><strong>{formatMoney(context.meal.price)}</strong></div><Button block onClick={(event) => { mealTrigger.current = event.currentTarget; setSelected(context); }}>View meal</Button></div> : null}</aside>
    </div>
    {feedback && <p className={styles.feedFeedback} role="status">{feedback}</p>}
    <MealDialog key={selected?.meal?.offerId ?? "no-meal"} selected={selected} menuItem={selected?.meal ? menuItems.find((item) => item.offer.id === selected.meal?.offerId) : undefined} quantity={quantity} setQuantity={setQuantity} onAdd={(item) => { addCartItem({ vendorId: selected!.vendor.id, orderingMode: "immediate" }, item); setSelected(null); setFeedback(`${item.name} added to your order`); }} onOpenChange={(open) => !open && setSelected(null)} onCloseAutoFocus={(event) => { event.preventDefault(); mealTrigger.current?.focus(); }}/>
    <CommentsDialog item={commenting} comments={commenting ? comments[commenting.id] ?? [] : []} draft={commentDraft} reactions={commentReactions} setDraft={setCommentDraft} onReact={toggleCommentReaction} onSubmit={submitComment} onOpenChange={(open) => !open && setCommenting(null)}/>
    <ShareDialog item={sharing} onOpenChange={(open) => !open && setSharing(null)} onCopied={() => { setSharing(null); setFeedback("Link copied"); }} onReposted={() => { setSharing(null); setFeedback("Reposted in this frontend preview"); }} onSent={(name) => { setSharing(null); setFeedback(`Sent to ${name} in this frontend preview`); }}/>
  </div>;
}

function MealDialog({
  menuItem,
  onAdd,
  onCloseAutoFocus,
  onOpenChange,
  quantity,
  selected,
  setQuantity,
}: Readonly<{
  menuItem: MenuPreviewItem | undefined;
  onAdd: (item: Readonly<{
    id: string;
    dishId: DishId;
    offerId: OfferId;
    name: string;
    imageUrl: string;
    unitPrice: Money;
    quantity: number;
    selectedOptions: readonly Readonly<{ name: string; value: string; priceDelta: Money }>[];
    instructions?: string;
  }>) => void;
  onCloseAutoFocus: (event: Event) => void;
  onOpenChange: (open: boolean) => void;
  quantity: number;
  selected: ReelItem | null;
  setQuantity: (quantity: number) => void;
}>) {
  const [selections, setSelections] = useState<Record<string, readonly string[]>>({});
  const [instructions, setInstructions] = useState("");
  const meal = selected?.meal;
  const groups = menuItem?.dish.optionGroups ?? [];

  if (!meal) return null;

  const selectedOptions = groups.flatMap((group) =>
    group.choices
      .filter((choice) => selections[group.id]?.includes(choice.id))
      .map((choice) => ({ name: group.name, value: choice.name, priceDelta: choice.priceDelta })),
  );
  const requiredComplete = groups
    .filter((group) => group.required)
    .every((group) => (selections[group.id]?.length ?? 0) > 0);
  const optionTotal = selectedOptions.reduce((sum, option) => sum + option.priceDelta.amount, 0);
  const canOrder = meal.offerStatus === "available" && Boolean(menuItem) && requiredComplete;
  const changeSelection = (groupId: string, choiceId: string, multiple: boolean) =>
    setSelections((current) => ({
      ...current,
      [groupId]: multiple
        ? current[groupId]?.includes(choiceId)
          ? current[groupId]?.filter((id) => id !== choiceId) ?? []
          : [...(current[groupId] ?? []), choiceId]
        : [choiceId],
    }));

  return (
    <Dialog.Root open={Boolean(selected)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.sheetBackdrop}>
          <Dialog.Content
            className={styles.sheet}
            aria-describedby="meal-description"
            aria-modal="true"
            onCloseAutoFocus={onCloseAutoFocus}
          >
            <Dialog.Close className={styles.sheetClose} aria-label="Close meal details">
              <X />
            </Dialog.Close>
            <Image className={styles.sheetMedia} src={meal.imageUrl} alt={meal.name} width={720} height={400} />
            <Status tone={meal.offerStatus === "preorder" ? "warning" : meal.offerStatus === "unavailable" ? "neutral" : "success"}>
              {meal.offerStatus === "preorder" ? "Pre-order" : meal.offerStatus === "unavailable" ? "Unavailable" : "Available now"}
            </Status>
            <Dialog.Title asChild><h2>{meal.name}</h2></Dialog.Title>
            <p className={styles.sheetVendor}>{selected.vendor.name} · Check current fulfillment eligibility</p>
            <p id="meal-description" className={styles.small}>{selected.caption}</p>
            {meal.offerStatus === "available" ? (
              <Link className={styles.fullDetailsLink} href={`/dishes/${meal.dishId}`}>View full details <ChevronRight size={14} aria-hidden="true" /></Link>
            ) : null}

            {meal.offerStatus === "available" && menuItem ? (
              <>
                {groups.map((group) => (
                  <fieldset className={styles.modifier} key={group.id}>
                    <legend className={styles.modifierHead}>
                      <span>{group.name}</span>
                      <small>{group.required ? "Required" : "Optional"}</small>
                    </legend>
                    <div className={styles.modifierChoices}>
                      {group.choices.map((choice) => (
                        <label className={styles.choice} key={choice.id}>
                          <input
                            type={group.selection === "single" ? "radio" : "checkbox"}
                            name={`reel-${meal.offerId}-${group.id}`}
                            checked={selections[group.id]?.includes(choice.id) ?? false}
                            disabled={!choice.available}
                            onChange={() => changeSelection(group.id, choice.id, group.selection === "multiple")}
                          />
                          <span>
                            <strong>{choice.name}</strong>
                            <small>{choice.priceDelta.amount ? `+ ${formatMoney(choice.priceDelta)}` : "Included"}{!choice.available ? " · Unavailable" : ""}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <label className={styles.field}>
                  <span>Special instructions <small>Optional</small></span>
                  <textarea
                    className={styles.textarea}
                    maxLength={300}
                    placeholder="Optional note for the kitchen"
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                  />
                </label>
                <div className={styles.split}>
                  <span>Quantity</span>
                  <div className={styles.quantity}>
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity"><Minus /></button>
                    <output>{quantity}</output>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity"><Plus /></button>
                  </div>
                </div>
              </>
            ) : null}

            <div className={styles.sheetTotal}>
              <div>
                <small>Total</small>
                <strong>{formatMoney({ ...meal.price, amount: (meal.price.amount + optionTotal) * quantity })}</strong>
              </div>
              {meal.offerStatus === "preorder" && meal.mealDropId ? (
                <Button asChild><Link href={`/drops/${meal.mealDropId}`}>View pre-order</Link></Button>
              ) : meal.offerStatus === "unavailable" ? (
                <Button disabled>Currently unavailable</Button>
              ) : !menuItem ? (
                <Button
                  onClick={() => onAdd({
                    id: meal.offerId,
                    dishId: meal.dishId,
                    offerId: meal.offerId,
                    name: meal.name,
                    imageUrl: meal.imageUrl,
                    unitPrice: meal.price,
                    quantity,
                    selectedOptions: [],
                  })}
                >
                  Add to order
                </Button>
              ) : (
                <Button
                  disabled={!canOrder}
                  onClick={() => onAdd({
                    id: `${meal.offerId}:${JSON.stringify(selections)}`,
                    dishId: meal.dishId,
                    offerId: meal.offerId,
                    name: meal.name,
                    imageUrl: meal.imageUrl,
                    unitPrice: meal.price,
                    quantity,
                    selectedOptions,
                    ...(instructions.trim() ? { instructions: instructions.trim() } : {}),
                  })}
                >
                  Add to order
                </Button>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CommentsDialog({ comments, draft, item, onOpenChange, onReact, onSubmit, reactions, setDraft }: Readonly<{ comments: readonly Comment[]; draft: string; item: ReelItem | null; onOpenChange: (open: boolean) => void; onReact: (commentId: string, reaction: CommentReaction) => void; onSubmit: () => void; reactions: Record<string, ReadonlySet<CommentReaction>>; setDraft: (value: string) => void }>) { return <Dialog.Root open={Boolean(item)} onOpenChange={onOpenChange}>{item ? <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={`${styles.sheet} ${styles.commentsSheet}`} aria-describedby="comments-description"><Dialog.Close className={styles.sheetClose} aria-label="Close comments"><X/></Dialog.Close><p className={styles.eyebrow}>Comments</p><Dialog.Title asChild><h2>Join the conversation</h2></Dialog.Title><Dialog.Description id="comments-description" className={styles.small}>Comments are saved only in this frontend preview for now.</Dialog.Description><div className={styles.commentList}>{comments.length ? comments.map((comment) => { const reaction = reactions[comment.id] ?? new Set<CommentReaction>(); return <div className={styles.comment} key={comment.id}><div className={styles.commentReactions}><button type="button" aria-label="Like comment" aria-pressed={reaction.has("like")} onClick={() => onReact(comment.id, "like")}>👍 <span>{reaction.has("like") ? 1 : 0}</span></button><button type="button" aria-label="Love comment" aria-pressed={reaction.has("love")} onClick={() => onReact(comment.id, "love")}>❤️ <span>{reaction.has("love") ? 1 : 0}</span></button></div><p><strong>{comment.author}</strong>{comment.body}</p></div>; }) : <p className={styles.small}>No preview comments yet. Be the first to respond.</p>}</div><form className={styles.commentForm} onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><label className="sr-only" htmlFor="reel-comment">Add a comment</label><input id="reel-comment" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={280} placeholder="Add a comment"/><Button type="submit" disabled={!draft.trim()}>Post</Button></form></Dialog.Content></Dialog.Overlay></Dialog.Portal> : null}</Dialog.Root>; }

function ShareDialog({ item, onCopied, onOpenChange, onReposted, onSent }: Readonly<{ item: ReelItem | null; onCopied: () => void; onOpenChange: (open: boolean) => void; onReposted: () => void; onSent: (name: string) => void }>) {
  const url = item ? `${typeof window === "undefined" ? "" : window.location.origin}/k/${item.vendor.slug}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(url); onCopied(); } catch { /* The visible link remains available for manual copy. */ } };
  const nativeShare = async () => { if (!item) return; try { await navigator.share({ title: `${item.meal?.name ?? "Food"} · MealHrs`, text: item.caption, url }); } catch { /* Unsupported devices, closing, or declining the native share sheet need no extra feedback. */ } };
  const message = encodeURIComponent(`${item?.meal?.name ?? "Food"} on MealHrs ${url}`);
  return <Dialog.Root open={Boolean(item)} onOpenChange={onOpenChange}>{item ? <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={`${styles.sheet} ${styles.shareSheet}`} aria-describedby="share-description"><Dialog.Close className={styles.sheetClose} aria-label="Close share"><X/></Dialog.Close><p className={styles.eyebrow}>Share to</p><Dialog.Title asChild><h2>Send this food story</h2></Dialog.Title><Dialog.Description id="share-description" className={styles.small}>Share with people you know or choose another app.</Dialog.Description><div className={styles.shareContacts} aria-label="Send to a friend">{shareContacts.map((contact) => <button key={contact.name} type="button" aria-label={`Send to ${contact.name}`} onClick={() => onSent(contact.name)}><span aria-hidden="true">{contact.initials}</span><small>{contact.name}</small></button>)}</div><div className={styles.shareDivider}/><div className={styles.shareActions}><button type="button" aria-label="Repost" onClick={onReposted}><span aria-hidden="true">↻</span><small>Repost</small></button><a aria-label="WhatsApp" href={`https://wa.me/?text=${message}`} target="_blank" rel="noreferrer"><span aria-hidden="true">◔</span><small>WhatsApp</small></a><button type="button" aria-label="Copy link" onClick={() => void copy()}><span aria-hidden="true">⧉</span><small>Copy link</small></button><a aria-label="Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer"><span aria-hidden="true">f</span><small>Facebook</small></a><button type="button" aria-label="More sharing options" onClick={() => void nativeShare()}><span aria-hidden="true">⋯</span><small>More</small></button></div></Dialog.Content></Dialog.Overlay></Dialog.Portal> : null}</Dialog.Root>;
}

function LocationDialog({ onCloseAutoFocus, onSelect }: Readonly<{ onCloseAutoFocus: (event: Event) => void; onSelect: (name: "Ikotun" | "Egbe" | "Ikeja") => void }>) { const [value, setValue] = useState<"Ikotun" | "Egbe" | "Ikeja">("Ikotun"); return <Dialog.Portal><Dialog.Overlay className={styles.sheetBackdrop}><Dialog.Content className={styles.sheet} aria-modal="true" onCloseAutoFocus={onCloseAutoFocus}><Dialog.Close className={styles.sheetClose} aria-label="Close location"><X/></Dialog.Close><p className={styles.eyebrow}>Delivery area</p><Dialog.Title asChild><h2>Where should food reach you?</h2></Dialog.Title><Dialog.Description className={styles.small}>Choose an area to revalidate discovery and ordering eligibility.</Dialog.Description><label className={styles.field}><span>Area</span><select className={styles.select} value={value} onChange={(event) => setValue(event.target.value as typeof value)}><option>Ikotun</option><option>Egbe</option><option>Ikeja</option></select></label><p className={`${styles.notice} ${value === "Ikeja" ? styles.noticeWarning : ""}`}>{value === "Ikeja" ? "Near Me has no eligible kitchens in this scenario. Explore Nigeria remains available." : `${value} has eligible kitchens in this scenario.`}</p><Button block onClick={() => onSelect(value)}>Use {value}</Button></Dialog.Content></Dialog.Overlay></Dialog.Portal>; }
