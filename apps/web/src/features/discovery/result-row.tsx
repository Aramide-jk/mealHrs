import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import styles from "./discovery.module.css";

export function ResultRow({ description, href, imageAlt, imageUrl, meta, title }: Readonly<{ description: string; href: string; imageAlt: string; imageUrl: string; meta?: ReactNode; title: string }>) {
  return (
    <Link className={styles.resultRow} href={href}>
      <Image src={imageUrl} alt={imageAlt} width={180} height={150} />
      <span>
        <h3>{title}</h3>
        <p>{description}</p>
        {meta}
      </span>
      <ChevronRight aria-hidden="true" size={18} />
    </Link>
  );
}
