"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  type ReactNode,
} from "react";
import styles from "./vendor-insights.module.css";

export function PageHead({
  action,
  children,
  description,
  eyebrow,
  title,
}: Readonly<{
  action?: ReactNode;
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}>) {
  return (
    <div>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1>{title}</h1>
          <p className={styles.lead}>{description}</p>
        </div>
        {action}
      </header>
      <div className="stack-lg">{children}</div>
    </div>
  );
}

export function Metric({
  detail,
  label,
  value,
}: Readonly<{
  detail: string;
  label: string;
  value: string;
}>) {
  return (
    <article className={`card ${styles.metric}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function Fact({
  label,
  value,
}: Readonly<{
  label: string;
  value: string;
}>) {
  return (
    <div className={styles.fact}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Field({
  children,
  label,
  hint,
}: Readonly<{
  children: ReactNode;
  label: string;
  hint?: string;
}>) {
  const id = useId();
  const control = isValidElement<{ id?: string }>(children)
    ? cloneElement(children, { id })
    : children;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {control}
      {hint ? <span className={styles.formHint}>{hint}</span> : null}
    </div>
  );
}

export function Toggle({
  label,
  onChange,
  value,
}: Readonly<{
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}>) {
  return (
    <button
      className={styles.switch}
      type="button"
      aria-label={label}
      aria-pressed={value}
      onClick={() => onChange(!value)}
    >
      <i />
    </button>
  );
}
