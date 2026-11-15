"use client";

import type { VendorNotificationItem } from "@mealhrs/domain";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useVendorWorkspace } from "../vendor-workspace-context";
import styles from "./vendor-insights.module.css";

type CategoryFilter = "all" | VendorNotificationItem["category"];

export function VendorNotificationsView({
  initialNotifications,
}: Readonly<{ initialNotifications: readonly VendorNotificationItem[] }>) {
  const { setUnreadNotifications } = useVendorWorkspace();
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const markAllRead = () => {
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
    setUnreadNotifications(0);
  };

  const markOneRead = (id: string) => {
    setItems((current) => {
      const next = current.map((item) => (item.id === id ? { ...item, unread: false } : item));
      setUnreadNotifications(next.filter((item) => item.unread).length);
      return next;
    });
  };

  const visible = filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Kitchen alerts</p>
          <h1>Vendor notifications</h1>
          <p>Order prompts, scheduled batch prep reminders, customer reviews, and compliance updates.</p>
        </div>
        <Button size="sm" variant="secondary" type="button" onClick={markAllRead}>
          Mark all read
        </Button>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Notification category">
        {(
          [
            { id: "all", label: "All" },
            { id: "order", label: "Orders" },
            { id: "prep", label: "Prep & cutoffs" },
            { id: "review", label: "Reviews" },
            { id: "compliance", label: "Compliance" },
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

      <section className={`card ${styles.section}`} aria-live="polite">
        {visible.length ? (
          visible.map((item) => (
            <div className={`${styles.notifRow} ${item.unread ? styles.notifUnread : ""}`} key={item.id}>
              <div style={{ flex: 1 }}>
                <div className="cluster" style={{ marginBottom: 5 }}>
                  <Status tone={item.unread ? "success" : "neutral"}>{item.category}</Status>
                  <small className="vendor-muted">{item.timeLabel}</small>
                </div>
                <strong style={{ display: "block", fontSize: "0.78rem", marginBottom: 3 }}>{item.title}</strong>
                <p style={{ margin: 0, fontSize: "0.7rem" }}>{item.detail}</p>
              </div>
              <Button
                asChild
                size="sm"
                variant="ghost"
                onClick={() => markOneRead(item.id)}
              >
                <Link href={item.href}>
                  Open
                  <ChevronRight aria-hidden="true" size={14} />
                </Link>
              </Button>
            </div>
          ))
        ) : (
          <div className="stack" style={{ justifyItems: "center", padding: 24 }}>
            <Bell aria-hidden="true" size={24} />
            <p>No notifications in this category.</p>
          </div>
        )}
      </section>
    </div>
  );
}
