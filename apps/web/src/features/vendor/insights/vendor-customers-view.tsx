"use client";

import { formatMoney, type VendorCustomerRecord } from "@mealhrs/domain";
import { Heart, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import styles from "./vendor-insights.module.css";

type CustomerFilter = "all" | "repeat" | "followers";

export function VendorCustomersView({
  customers,
}: Readonly<{ customers: readonly VendorCustomerRecord[] }>) {
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(customers.filter((c) => c.note).map((c) => [c.id, c.note!])),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [feedback, setFeedback] = useState("");

  const filtered = customers.filter((customer) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "repeat"
          ? customer.orderCount > 1
          : customer.isFollower;
    const searchable = `${customer.name} ${customer.area} ${customer.favoriteDish}`.toLowerCase();
    return matchesFilter && searchable.includes(query.trim().toLowerCase());
  });

  const followerCount = customers.filter((c) => c.isFollower).length;
  const repeatCount = customers.filter((c) => c.orderCount > 1).length;

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Relationships</p>
          <h1>Customers &amp; followers</h1>
          <p>
            Review repeat buyers, kitchen followers, and verified order feedback scoped strictly to your kitchen.
          </p>
        </div>
      </header>

      <div className="stack-lg">
        <Notice tone="info">
          Customer records are strictly scoped to orders with your kitchen. Unrelated customer data is never accessible.
        </Notice>

        <div className={styles.grid}>
          <article className={`card ${styles.metric}`}>
            <span>Known buyers</span>
            <strong>{customers.length}</strong>
            <small>Preview customer records</small>
          </article>
          <article className={`card ${styles.metric}`}>
            <span>Returning buyers</span>
            <strong>{repeatCount}</strong>
            <small>2+ orders with your kitchen</small>
          </article>
          <article className={`card ${styles.metric}`}>
            <span>Followers</span>
            <strong>{followerCount}</strong>
            <small>Subscribed to new drops</small>
          </article>
        </div>

        <section className={`card ${styles.section}`}>
          <div className="split" style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div className={styles.tabs} role="tablist" aria-label="Customer filter" style={{ marginBottom: 0 }}>
              {(
                [
                  { id: "all", label: `All (${customers.length})` },
                  { id: "repeat", label: `Returning (${repeatCount})` },
                  { id: "followers", label: `Followers (${followerCount})` },
                ] as const
              ).map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === entry.id}
                  onClick={() => setFilter(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid var(--color-line)",
                borderRadius: 9,
                padding: "7px 11px",
                background: "var(--color-surface)",
                minWidth: 220,
              }}
            >
              <Search aria-hidden="true" size={15} />
              <span className="sr-only">Search customers</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, area or meal"
                style={{ border: 0, outline: 0, width: "100%", fontSize: "0.72rem", background: "transparent" }}
              />
            </label>
          </div>

          {feedback ? (
            <p className={styles.feedback} role="status">
              {feedback}
            </p>
          ) : null}

          <div className={styles.customerGrid}>
            {filtered.length ? (
              filtered.map((customer) => (
                <article className={`card ${styles.customerCard}`} key={customer.id}>
                  <div className="split">
                    <div>
                      <strong style={{ fontSize: "0.86rem" }}>{customer.name}</strong>
                      <p className="vendor-muted" style={{ marginTop: 2 }}>
                        {customer.area} · Last order {customer.lastOrderAt}
                      </p>
                    </div>
                    <div className="cluster">
                      {customer.isFollower ? (
                        <Status tone="success">
                          <Heart aria-hidden="true" size={11} />
                          Follower
                        </Status>
                      ) : null}
                      {customer.orderCount > 1 ? <Status tone="warning">Repeat</Status> : null}
                    </div>
                  </div>

                  <div className={styles.facts}>
                    <div className={styles.fact}>
                      <span>Orders · Total spent</span>
                      <strong>
                        {customer.orderCount} orders · {formatMoney(customer.totalSpent)}
                      </strong>
                    </div>
                    <div className={styles.fact}>
                      <span>Favorite dish</span>
                      <strong>{customer.favoriteDish}</strong>
                    </div>
                  </div>

                  {customer.lastFeedback ? (
                    <p style={{ margin: 0, fontSize: "0.7rem", fontStyle: "italic" }}>{customer.lastFeedback}</p>
                  ) : null}

                  {editingId === customer.id ? (
                    <form
                      className="stack"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setNotes((current) => ({ ...current, [customer.id]: draftNote.trim() }));
                        setEditingId(null);
                        setFeedback(`Kitchen note saved locally for ${customer.name}.`);
                      }}
                    >
                      <label className={styles.field}>
                        <span>Private kitchen note</span>
                        <input
                          value={draftNote}
                          maxLength={180}
                          onChange={(event) => setDraftNote(event.target.value)}
                          placeholder="e.g. Prefers plantain packed separately"
                        />
                      </label>
                      <div className="cluster">
                        <Button size="sm" type="submit">
                          Save note
                        </Button>
                        <Button size="sm" variant="ghost" type="button" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="split">
                      <span className="vendor-muted">
                        {notes[customer.id] ? `Note: ${notes[customer.id]}` : "No kitchen note saved"}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        onClick={() => {
                          setEditingId(customer.id);
                          setDraftNote(notes[customer.id] ?? "");
                        }}
                      >
                        {notes[customer.id] ? "Edit note" : "Add note"}
                      </Button>
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="stack" style={{ gridColumn: "1 / -1", justifyItems: "center", padding: 24 }}>
                <UsersRound aria-hidden="true" size={26} />
                <p>No customers matched this filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
