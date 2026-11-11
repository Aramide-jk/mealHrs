"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./discovery.module.css";

export type TabItem = Readonly<{ id: string; label: string; panel: ReactNode }>;

export function SegmentedTabs({ items }: Readonly<{ items: readonly TabItem[] }>) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const baseId = useId();
  const move = (index: number, key: string) => {
    if (!items.length) return;
    const next = key === "Home" ? 0 : key === "End" ? items.length - 1 : (index + (key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    setActive(items[next]?.id ?? active);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };
  return (
    <>
      <div className={styles.segmented} role="tablist">
        {items.map((item, index) => (
          <button
            id={`${baseId}-tab-${index}`}
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active === item.id}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={active === item.id ? 0 : -1}
            onClick={() => setActive(item.id)}
            onKeyDown={(event) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                move(index, event.key);
              }
            }}
          >{item.label}</button>
        ))}
      </div>
      {items.map((item, index) => (
        <section id={`${baseId}-panel-${index}`} key={item.id} role="tabpanel" aria-labelledby={`${baseId}-tab-${index}`} hidden={active !== item.id} style={{ marginTop: 18 }}>
          {item.panel}
        </section>
      ))}
    </>
  );
}
