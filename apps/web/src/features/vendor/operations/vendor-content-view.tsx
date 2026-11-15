"use client";

import type { VendorDashboardSnapshot, VendorPostInsight } from "@mealhrs/domain";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import styles from "./vendor-operations.module.css";

type ContentTab = "composer" | "published" | "drafts";
type UploadState = "idle" | "ready" | "failed";

type LocalPostItem = Readonly<{
  id: string;
  caption: string;
  mediaKind: "video" | "image" | "carousel";
  imageUrl: string;
  linkedDishName: string;
  status: "published" | "draft" | "scheduled";
  scheduledFor?: string;
  views: number;
  mealClicks: number;
  ordersAttributed: number;
  comments: readonly { id: string; author: string; body: string; createdAt: string }[];
}>;

export function VendorContentView({
  contentDrafts,
  menu,
  posts,
  postInsights = [],
}: Readonly<
  Pick<VendorDashboardSnapshot, "contentDrafts" | "menu" | "posts"> & {
    postInsights?: readonly VendorPostInsight[];
  }
>) {
  const [tab, setTab] = useState<ContentTab>("composer");
  const initialCaption = contentDrafts[0]?.caption ?? "";
  const [caption, setCaption] = useState(initialCaption);
  const [offerId, setOfferId] = useState(contentDrafts[0]?.linkedOfferId ?? menu[0]?.offer.id ?? "");
  const [mediaKind, setMediaKind] = useState<"video" | "image" | "carousel">("video");
  const [carouselImageUrls, setCarouselImageUrls] = useState<readonly string[]>([]);
  const [tags, setTags] = useState("jollof, lunch, ikotun");
  const [publishSchedule, setPublishSchedule] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("ready");
  const [published, setPublished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const [library, setLibrary] = useState<readonly LocalPostItem[]>(() => {
    const publishedEntries: LocalPostItem[] = posts.map((post) => {
      const linkedEntry = menu.find(({ offer }) => offer.id === post.linkedOfferId);
      const insight = postInsights.find((item) => item.postId === post.id);
      return {
        id: post.id,
        caption: post.caption,
        mediaKind: post.media.kind,
        imageUrl: post.media.kind === "carousel" ? post.media.items[0]?.src ?? "/assets/hero-jollof.png" : post.media.kind === "video" ? post.media.poster ?? post.media.src : post.media.src,
        linkedDishName: linkedEntry?.dish.name ?? "Kitchen menu",
        status: "published",
        views: insight?.views ?? 1200,
        mealClicks: insight?.mealClicks ?? 84,
        ordersAttributed: insight?.ordersAttributed ?? 5,
        comments: insight?.comments ?? [],
      };
    });
    const draftEntries: LocalPostItem[] = contentDrafts.map((draft) => {
      const linkedEntry = menu.find(({ offer }) => offer.id === draft.linkedOfferId);
      return {
        id: draft.id,
        caption: draft.caption,
        mediaKind: "image",
        imageUrl: linkedEntry?.dish.imageUrl ?? "/assets/hero-jollof.png",
        linkedDishName: linkedEntry?.dish.name ?? "Unlinked",
        status: draft.status,
        views: 0,
        mealClicks: 0,
        ordersAttributed: 0,
        comments: [],
      };
    });
    return [...publishedEntries, ...draftEntries];
  });

  const linked = useMemo(() => menu.find(({ offer }) => offer.id === offerId), [menu, offerId]);
  const previewAssets = useMemo(() => menu.flatMap(({ dish }) => (dish.imageUrls?.length ? dish.imageUrls : [dish.imageUrl]).map((imageUrl, index) => ({ id: `${dish.id}-${index}`, imageUrl, name: index ? `${dish.name} · photo ${index + 1}` : dish.name }))), [menu]);
  const toggleCarouselAsset = (imageUrl: string) => {
    setCarouselImageUrls((current) => current.includes(imageUrl)
      ? current.filter((url) => url !== imageUrl)
      : current.length < 4 ? [...current, imageUrl] : current);
  };

  const handleSaveDraft = () => {
    setPublished(false);
    setFeedback("Draft saved for this frontend preview only.");
  };

  const handlePublishPreview = () => {
    if (!caption.trim() || uploadState === "failed" || (mediaKind === "carousel" && carouselImageUrls.length < 2)) return;
    setPublished(true);
    const nextPost: LocalPostItem = {
      id: `preview-post-${Date.now()}`,
      caption: caption.trim(),
      mediaKind,
      imageUrl: mediaKind === "carousel" ? carouselImageUrls[0] ?? linked?.dish.imageUrl ?? "/assets/hero-jollof.png" : linked?.dish.imageUrl ?? "/assets/hero-jollof.png",
      linkedDishName: linked?.dish.name ?? "Unlinked",
      status: publishSchedule === "later" ? "scheduled" : "published",
      ...(publishSchedule === "later" && scheduledAt ? { scheduledFor: scheduledAt } : {}),
      views: 0,
      mealClicks: 0,
      ordersAttributed: 0,
      comments: [],
    };
    setLibrary((current) => [nextPost, ...current]);
    setFeedback(
      publishSchedule === "later"
        ? "Post added to Scheduled in this frontend preview."
        : "Food story added to Published list in this preview.",
    );
  };

  const postReply = (postId: string) => {
    const body = (replyDraft[postId] ?? "").trim();
    if (!body) return;
    setLibrary((current) =>
      current.map((item) =>
        item.id === postId
          ? {
              ...item,
              comments: [
                ...item.comments,
                { id: `reply-${Date.now()}`, author: "Kitchen (preview)", body, createdAt: "Just now" },
              ],
            }
          : item,
      ),
    );
    setReplyDraft((current) => ({ ...current, [postId]: "" }));
    setFeedback("Reply added in this frontend preview.");
  };

  const publishedItems = library.filter((item) => item.status === "published");
  const draftItems = library.filter((item) => item.status === "draft" || item.status === "scheduled");

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Food content</p>
          <h1>Reels and posts</h1>
          <p>Create food stories, link dishes or pre-order batches, manage drafts, and review engagement.</p>
        </div>
      </header>

      {feedback ? (
        <p className={styles.feedback} role="status">
          {feedback}
        </p>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="Content views">
        {(
          [
            { id: "composer", label: "Create post" },
            { id: "published", label: `Published (${publishedItems.length})` },
            { id: "drafts", label: `Drafts & Scheduled (${draftItems.length})` },
          ] as const
        ).map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "composer" ? (
        <div className={styles.contentGrid}>
          <section className={`card ${styles.editor}`} aria-label="Content editor">
            <div className={styles.menuFormGrid}>
              <label className={styles.field}>
                <span>Media format</span>
                <select
                  value={mediaKind}
                  onChange={(event) => setMediaKind(event.target.value as "video" | "image" | "carousel")}
                >
                  <option value="video">Short food video (Reel)</option>
                  <option value="image">Food photograph</option>
                  <option value="carousel">Photo carousel</option>
                </select>
              </label>
              <label className={styles.field}>
                <span>Media upload state preview</span>
                <select
                  value={uploadState}
                  onChange={(event) => setUploadState(event.target.value as UploadState)}
                >
                  <option value="ready">Processed &amp; thumbnail ready</option>
                  <option value="failed">Simulate upload failure</option>
                </select>
              </label>
            </div>

            {mediaKind === "carousel" ? (
              <fieldset className={styles.field}>
                <legend>Select 2–4 existing preview photos</legend>
                <span>These preview assets are not uploaded or saved.</span>
                <div className={styles.carouselAssets}>
                  {previewAssets.map((dish) => (
                    <label key={dish.id} className={styles.carouselAsset}>
                      <input type="checkbox" checked={carouselImageUrls.includes(dish.imageUrl)} onChange={() => toggleCarouselAsset(dish.imageUrl)} disabled={!carouselImageUrls.includes(dish.imageUrl) && carouselImageUrls.length >= 4} />
                      <Image src={dish.imageUrl} alt="" width={88} height={64} />
                      <span>{dish.name}</span>
                    </label>
                  ))}
                </div>
                <span aria-live="polite">{carouselImageUrls.length} of 2–4 photos selected</span>
              </fieldset>
            ) : null}

            {uploadState === "failed" ? (
              <Notice tone="danger">
                Upload failed in this preview. Your draft is preserved—retry without losing caption or dish link.{" "}
                <Button size="sm" variant="secondary" type="button" onClick={() => setUploadState("ready")}>
                  Retry upload
                </Button>
              </Notice>
            ) : null}

            <label className={styles.field}>
              <span>Caption</span>
              <textarea
                value={caption}
                maxLength={280}
                onChange={(event) => {
                  setCaption(event.target.value);
                  setPublished(false);
                }}
                placeholder="Tell customers what is fresh today"
              />
            </label>

            <div className={styles.menuFormGrid}>
              <label className={styles.field}>
                <span>Linked meal</span>
                <select
                  value={offerId}
                  onChange={(event) => {
                    setOfferId(event.target.value);
                    setPublished(false);
                  }}
                >
                  {menu.map(({ dish, offer }) => (
                    <option key={offer.id} value={offer.id}>
                      {dish.name} · {offer.orderingMode === "immediate" ? "Available now" : "Pre-order batch"}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span>Food tags</span>
                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="e.g. jollof, smoky, lunch"
                />
              </label>
            </div>

            <div className={styles.menuFormGrid}>
              <label className={styles.field}>
                <span>Publishing schedule</span>
                <select
                  value={publishSchedule}
                  onChange={(event) => setPublishSchedule(event.target.value as "now" | "later")}
                >
                  <option value="now">Publish immediately</option>
                  <option value="later">Schedule publication</option>
                </select>
              </label>
              {publishSchedule === "later" ? (
                <label className={styles.field}>
                  <span>Publish date &amp; time (WAT)</span>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                  />
                </label>
              ) : null}
            </div>

            <div className={styles.actionGroup}>
              <Button variant="secondary" type="button" onClick={handleSaveDraft}>
                Save draft
              </Button>
              <Button
                type="button"
                disabled={!caption.trim() || uploadState === "failed" || (mediaKind === "carousel" && carouselImageUrls.length < 2)}
                onClick={handlePublishPreview}
              >
                {publishSchedule === "later" ? "Schedule preview" : "Publish preview"}
              </Button>
            </div>

            {published ? <Status tone="success">Published in this frontend preview</Status> : null}
          </section>

          <aside className={`card ${styles.preview}`}>
            {linked ? <Image src={mediaKind === "carousel" ? carouselImageUrls[0] ?? linked.dish.imageUrl : linked.dish.imageUrl} alt={linked.dish.name} width={640} height={360} /> : null}
            <div>
              <div className="cluster">
                <Status tone={published ? "success" : "neutral"}>
                  {published ? "Published preview" : publishSchedule === "later" ? "Scheduled preview" : "Draft preview"}
                </Status>
                <span className={styles.previewPill}>{mediaKind === "video" ? "Short video" : mediaKind === "carousel" ? `Photo carousel (${carouselImageUrls.length})` : "Photo"}</span>
              </div>
              <h2>{caption || "Your caption will appear here"}</h2>
              <p>{linked?.dish.name ?? "Choose a meal to link this post"}</p>
              <div className={styles.previewMeta}>
                <span>{publishedItems.length} active post{publishedItems.length === 1 ? "" : "s"}</span>
                <span>{linked?.offer.orderingMode === "meal_drop" ? "Pre-order" : "Available now"}</span>
                <span>Note: Checkout rules always override post tags</span>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <section className={styles.list} aria-label={tab === "published" ? "Published food posts" : "Drafts and scheduled posts"}>
          {(tab === "published" ? publishedItems : draftItems).map((item) => (
            <article className={`card ${styles.postLibraryCard}`} key={item.id}>
              <Image src={item.imageUrl} alt={item.linkedDishName} width={192} height={164} />
              <div>
                <div className="cluster">
                  <Status tone={item.status === "published" ? "success" : "warning"}>{item.status}</Status>
                  <span className={styles.previewPill}>{item.mediaKind}</span>
                  <span className={styles.reference}>{item.linkedDishName}</span>
                </div>
                <h2 style={{ fontSize: "0.92rem", margin: "7px 0 4px" }}>{item.caption}</h2>
                {item.scheduledFor ? <p className="vendor-muted">Scheduled: {item.scheduledFor}</p> : null}
                <div className={styles.postStats}>
                  <span>{item.views.toLocaleString("en-NG")} views</span>
                  <span>{item.mealClicks} meal clicks</span>
                  <span>{item.ordersAttributed} attributed orders</span>
                </div>
                {item.comments.length > 0 ? (
                  <div className={styles.commentBox}>
                    {item.comments.map((comment) => (
                      <div className={styles.commentItem} key={comment.id}>
                        <strong>{comment.author}</strong> · <span>{comment.createdAt}</span>
                        <p style={{ margin: "3px 0 0" }}>{comment.body}</p>
                      </div>
                    ))}
                    <form
                      className="cluster"
                      onSubmit={(event) => {
                        event.preventDefault();
                        postReply(item.id);
                      }}
                    >
                      <input
                        aria-label={`Reply on ${item.linkedDishName}`}
                        value={replyDraft[item.id] ?? ""}
                        onChange={(event) =>
                          setReplyDraft((current) => ({ ...current, [item.id]: event.target.value }))
                        }
                        placeholder="Reply to customer comment…"
                        style={{
                          flex: 1,
                          minWidth: 160,
                          padding: "7px 10px",
                          border: "1px solid var(--color-line)",
                          borderRadius: 8,
                          fontSize: "0.7rem",
                        }}
                      />
                      <Button size="sm" variant="secondary" type="submit">
                        Reply
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>
              <div className={styles.actionGroup}>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setCaption(item.caption);
                    setTab("composer");
                  }}
                >
                  Load in editor
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
