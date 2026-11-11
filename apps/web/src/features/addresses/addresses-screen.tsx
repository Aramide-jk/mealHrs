"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { asAreaId, type CustomerAddress } from "@mealhrs/domain";
import { MapPin, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import styles from "@/features/account/account.module.css";
import { validateAddressDraft, type AddressDraft } from "./address-validation";

const emptyDraft: AddressDraft = { label: "", line1: "", area: "Ikotun", directions: "" };

export function AddressesScreen({ initialAddresses }: Readonly<{ initialAddresses: readonly CustomerAddress[] }>) {
  const [addresses, setAddresses] = useState([...initialAddresses]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (errors.length) errorRef.current?.focus();
  }, [errors]);

  const openAdd = (opener: HTMLElement) => {
    openerRef.current = opener;
    setEditingId(null);
    setDraft(emptyDraft);
    setErrors([]);
    setOpen(true);
  };

  const openEdit = (address: CustomerAddress, opener: HTMLElement) => {
    openerRef.current = opener;
    setEditingId(address.id);
    setDraft({ label: address.label, line1: address.line1.replace(/, (Ikotun|Ikeja), Lagos$/, ""), area: address.areaName === "Ikeja" ? "Ikeja" : "Ikotun", directions: "" });
    setErrors([]);
    setOpen(true);
  };

  const saveAddress = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAddressDraft(draft);
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const next: CustomerAddress = {
      id: editingId ?? `address-${Date.now()}`,
      label: draft.label.trim(),
      line1: `${draft.line1.trim()}, ${draft.area}, Lagos`,
      areaId: asAreaId(draft.area === "Ikotun" ? "area-ikotun" : "area-ikeja"),
      areaName: draft.area,
      isDefault: editingId ? Boolean(addresses.find((item) => item.id === editingId)?.isDefault) : false,
    };
    setAddresses((current) => editingId ? current.map((item) => item.id === editingId ? next : item) : [...current, next]);
    setMessage(`${next.label} address saved in this frontend preview.`);
    setOpen(false);
  };

  const setDefault = (address: CustomerAddress) => {
    if (address.areaName === "Ikeja") {
      setMessage("Ikeja is outside this kitchen’s delivery coverage, so the default was not changed.");
      return;
    }
    setAddresses((current) => current.map((item) => ({ ...item, isDefault: item.id === address.id })));
    setMessage(`${address.label} is now the preview default address.`);
  };

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <div><p className={styles.eyebrow}>Delivery</p><h1>Saved addresses</h1><p>Addresses determine which kitchens, meals and delivery fees are available.</p></div>
        <Button size="sm" onClick={(event) => openAdd(event.currentTarget)}>Add address</Button>
      </div>
      <div className="stack">
        {addresses.map((address) => (
          <article className={`card ${styles.addressCard}`} key={address.id}>
            <div className={styles.addressIcon}><MapPin aria-hidden="true" size={18} /></div>
            <div className={styles.addressBody}>
              <div className="split"><h3>{address.label}</h3>{address.isDefault ? <Status>Default</Status> : null}</div>
              <p>{address.line1}<br />{address.areaName} · {address.areaName === "Ikeja" ? "Ikeja" : "Alimosho"} LGA</p>
              {address.areaName === "Ikeja" ? <div className={styles.warning}>Amaka’s Kitchen does not currently deliver here. Choose a different kitchen or pickup where offered.</div> : null}
              <div className={styles.addressActions}>
                <button type="button" onClick={(event) => openEdit(address, event.currentTarget)}>Edit</button>
                <button type="button" onClick={() => setDefault(address)}>{address.isDefault ? "Current default" : "Set default"}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className={styles.statusText} role="status" aria-live="polite">{message}</div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.backdrop} />
          <Dialog.Content
            className={styles.sheet}
            role="dialog"
            aria-describedby="address-description"
            aria-modal="true"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              openerRef.current?.focus();
            }}
          >
            <div className={styles.sheetHandle} />
            <Dialog.Close className={styles.sheetClose} aria-label="Close address form"><X aria-hidden="true" size={18} /></Dialog.Close>
            <p className={styles.eyebrow}>Address details</p>
            <Dialog.Title>{editingId ? "Edit delivery address" : "Add a delivery address"}</Dialog.Title>
            <Dialog.Description className={styles.hint} id="address-description">This preview checks named service areas only. It does not perform real geocoding.</Dialog.Description>
            <form className={styles.formStack} onSubmit={saveAddress} noValidate>
              {errors.length ? <div ref={errorRef} className={styles.warning} role="alert" tabIndex={-1}><strong>Review this address:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
              <label className={styles.field}><span>Label</span><input className={styles.input} value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} /></label>
              <label className={styles.field}><span>Street address</span><input className={styles.input} value={draft.line1} onChange={(event) => setDraft({ ...draft, line1: event.target.value })} /></label>
              <div className={styles.grid2}>
                <label className={styles.field}><span>State</span><select className={styles.select} value="Lagos" disabled><option>Lagos</option></select></label>
                <label className={styles.field}><span>Area</span><select className={styles.select} value={draft.area} aria-describedby={draft.area === "Ikeja" ? "address-warning" : undefined} onChange={(event) => setDraft({ ...draft, area: event.target.value as AddressDraft["area"] })}><option value="Ikotun">Ikotun</option><option value="Ikeja">Ikeja — unsupported</option></select></label>
              </div>
              {draft.area === "Ikeja" ? <div className={styles.warning} id="address-warning" role="alert">This area is outside the selected vendor’s delivery coverage. Save is disabled until you choose a supported area.</div> : null}
              <label className={styles.field}><span>Delivery directions</span><textarea className={styles.textarea} value={draft.directions} placeholder="Gate colour, landmark or helpful directions" onChange={(event) => setDraft({ ...draft, directions: event.target.value })} /></label>
              <Button block type="submit" disabled={draft.area === "Ikeja"}>Save address</Button>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
