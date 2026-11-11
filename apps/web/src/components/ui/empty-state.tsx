import type { ReactNode } from "react";

export function EmptyState({ action, description, icon, title }: Readonly<{ action?: ReactNode; description: string; icon?: ReactNode; title: string }>) {
  return (
    <section className="empty-state">
      {icon ? <div className="empty-state__icon">{icon}</div> : null}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </section>
  );
}
