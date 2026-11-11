"use client";

import { formatMoney, ngn, type Money, type VendorDashboardSnapshot } from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Plus, UtensilsCrossed, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "./vendor-operations.module.css";

type AddedDish = Readonly<{ id: string; name: string; category: string; price: Money; preparationEstimate: string }>;

export function VendorMenuView({ menu }: Readonly<Pick<VendorDashboardSnapshot, "menu">>) {
  const immediate = menu.filter(({ offer }) => offer.orderingMode === "immediate");
  const [available, setAvailable] = useState<Set<string>>(() => new Set(immediate.filter(({ offer }) => offer.availability.status === "available_now").map(({ offer }) => offer.id)));
  const [addedDishes, setAddedDishes] = useState<readonly AddedDish[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const toggleAvailability = (id: string) => setAvailable((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const createDish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const price = Number(form.get("price"));
    if (!name || !Number.isFinite(price) || price <= 0) return;
    const id = `preview-dish-${Date.now()}`;
    setAddedDishes((current) => [...current, { id, name, category: String(form.get("category") ?? "Kitchen special"), price: ngn(price), preparationEstimate: String(form.get("preparation") ?? "25–35 min") }]);
    setAvailable((current) => new Set(current).add(id));
    setFeedback(`${name} was added to this frontend preview only.`);
    setAddOpen(false);
  };

  return <div className={styles.menuPage}>
    <header className={styles.head}>
      <div><p className={styles.eyebrow}>Immediate ordering</p><h1>Menu availability</h1><p>Customers only see dishes marked available. These controls update this preview locally.</p></div>
      <Button size="sm" onClick={() => setAddOpen(true)}><Plus aria-hidden="true"/>Add dish</Button>
    </header>
    {feedback ? <p className={styles.feedback} role="status">{feedback}</p> : null}
    <section className={styles.menuList} aria-label="Immediate menu dishes">
      {immediate.map(({ dish, offer }) => <MenuRow key={offer.id} id={offer.id} name={dish.name} category={dish.category} imageUrl={dish.imageUrl} price={offer.price} preparation={offer.availability.status === "available_now" ? offer.availability.preparationEstimate : "Pre-order only"} isAvailable={available.has(offer.id)} onToggle={toggleAvailability}/>)}
      {addedDishes.map((dish) => <MenuRow key={dish.id} id={dish.id} name={dish.name} category={dish.category} price={dish.price} preparation={dish.preparationEstimate} isAvailable={available.has(dish.id)} onToggle={toggleAvailability} preview/>)}
    </section>
    <AddDishDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={createDish}/>
  </div>;
}

function MenuRow({ id, name, category, imageUrl, price, preparation, isAvailable, onToggle, preview = false }: Readonly<{ id: string; name: string; category: string; imageUrl?: string; price: Money; preparation: string; isAvailable: boolean; onToggle: (id: string) => void; preview?: boolean }>) {
  return <article className={`card ${styles.menuRow}`}>
    {imageUrl ? <Image src={imageUrl} alt={name} width={128} height={112}/> : <div className={styles.menuImagePlaceholder} aria-hidden="true"><UtensilsCrossed/></div>}
    <div className={styles.menuInfo}><div className="cluster"><Status tone={isAvailable ? "success" : "neutral"}>{isAvailable ? "Available now" : "Paused"}</Status><span className={styles.reference}>{category}</span>{preview ? <span className={styles.previewPill}>Preview dish</span> : null}</div><h2>{name}</h2><p>{formatMoney(price)} · {preparation}</p></div>
    <label className={styles.switch}><input aria-label={`Set ${name} availability`} type="checkbox" checked={isAvailable} onChange={() => onToggle(id)}/><span>{isAvailable ? "Available" : "Paused"}</span></label>
  </article>;
}

function AddDishDialog({ open, onOpenChange, onSubmit }: Readonly<{ open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }>) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className={styles.menuDialogBackdrop}/><Dialog.Content className={styles.menuDialog}><header><div><p className={styles.eyebrow}>Menu preview</p><Dialog.Title>Add a dish</Dialog.Title><Dialog.Description>Creates a local preview card only. Nothing is saved yet.</Dialog.Description></div><Dialog.Close asChild><button className={styles.close} type="button" aria-label="Close add dish"><X aria-hidden="true"/></button></Dialog.Close></header><form onSubmit={onSubmit}><label>Dish name<input name="name" required placeholder="e.g. Pepper soup"/></label><label>Category<input name="category" defaultValue="Kitchen special"/></label><div className={styles.menuFormGrid}><label>Price (₦)<input name="price" required min="1" type="number" inputMode="numeric" placeholder="0"/></label><label>Preparation time<input name="preparation" defaultValue="25–35 min"/></label></div><footer><Button type="submit" block>Add to preview menu</Button></footer></form></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
