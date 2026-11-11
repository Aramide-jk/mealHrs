"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { CustomerProfile } from "@mealhrs/domain";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCustomerContext } from "@/lib/customer-context";
import styles from "@/features/account/account.module.css";

type PreferenceKey = "orders" | "drops" | "posts" | "motion";

function PreferenceSwitch({ checked, id, label, onChange }: Readonly<{ checked: boolean; id: string; label: string; onChange: () => void }>) {
  return (
    <label className={styles.switch}>
      <span className={styles.visuallyHidden}>{label}</span>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span aria-hidden="true" />
    </label>
  );
}

export function SettingsScreen({ profile }: Readonly<{ profile: CustomerProfile }>) {
  const router = useRouter();
  const { setPendingIntent, setSignedIn } = useCustomerContext();
  const [preferences, setPreferences] = useState<Record<PreferenceKey, boolean>>({ orders: true, drops: true, posts: false, motion: false });
  const [message, setMessage] = useState("");

  const toggle = (key: PreferenceKey, label: string) => {
    setPreferences((current) => {
      const enabled = !current[key];
      setMessage(`${label} ${enabled ? "enabled" : "disabled"} in this frontend preview.`);
      return { ...current, [key]: enabled };
    });
  };

  const signOut = () => {
    setSignedIn(false);
    setPendingIntent("/profile/settings");
    router.push("/auth");
  };

  return (
    <div className="page page--narrow">
      <div className="page-head">
        <div><p className={styles.eyebrow}>Account</p><h1>Settings</h1><p>Choose how MealHrs communicates with you and supports your experience.</p></div>
      </div>
      <div className="stack-lg">
        <section className={`surface-section ${styles.settingsGroup}`} aria-labelledby="profile-settings-title">
          <h2 id="profile-settings-title">Profile and security</h2>
          <div className={styles.settingRow}><div><strong>Personal details</strong><small>{profile.name} · {profile.email}</small></div><Button size="sm" variant="secondary" onClick={() => setMessage("Profile editing is represented as a frontend preview only.")}>Edit</Button></div>
          <div className={styles.settingRow}><div><strong>Verified phone</strong><small>{profile.phone}</small></div><Button size="sm" variant="secondary" onClick={() => setMessage("Phone verification requires the future secure authentication service.")}>Change</Button></div>
        </section>
        <section className={`surface-section ${styles.settingsGroup}`} aria-labelledby="notification-settings-title">
          <h2 id="notification-settings-title">Notifications</h2>
          <div className={styles.settingRow}><div><strong>Order updates</strong><small>Payment, preparation and delivery events</small></div><PreferenceSwitch checked={preferences.orders} id="order-updates" label="Order updates" onChange={() => toggle("orders", "Order updates")} /></div>
          <div className={styles.settingRow}><div><strong>Meal Drop reminders</strong><small>Upcoming cutoffs from followed kitchens</small></div><PreferenceSwitch checked={preferences.drops} id="drop-reminders" label="Meal Drop reminders" onChange={() => toggle("drops", "Meal Drop reminders")} /></div>
          <div className={styles.settingRow}><div><strong>New posts from followed kitchens</strong><small>In-app notifications only</small></div><PreferenceSwitch checked={preferences.posts} id="post-notifications" label="New posts from followed kitchens" onChange={() => toggle("posts", "New posts from followed kitchens")} /></div>
        </section>
        <section className={`surface-section ${styles.settingsGroup}`} aria-labelledby="accessibility-settings-title">
          <h2 id="accessibility-settings-title">Accessibility and data</h2>
          <div className={styles.settingRow}><div><strong>Reduce motion</strong><small>Limits non-essential transitions and autoplay motion</small></div><PreferenceSwitch checked={preferences.motion} id="reduce-motion" label="Reduce motion" onChange={() => toggle("motion", "Reduce motion")} /></div>
          <button className={styles.settingRow} type="button" onClick={() => setMessage("Data export preparation is a frontend preview. No file was created.")}><div><strong>Download my information</strong><small>Prepare a copy of your account and order data</small></div><ChevronRight aria-hidden="true" size={17} /></button>
          <button className={styles.settingRow} type="button" onClick={() => setMessage("Privacy choices preview opened. No account preference was transmitted.")}><div><strong>Privacy choices</strong><small>Manage personalization and data preferences</small></div><ChevronRight aria-hidden="true" size={17} /></button>
        </section>
        <section className={`surface-section ${styles.settingsGroup}`} aria-labelledby="account-actions-title">
          <h2 id="account-actions-title">Account actions</h2>
          <Dialog.Root>
            <Dialog.Trigger asChild><button className={`${styles.settingRow} ${styles.danger}`} type="button"><div><strong>Sign out</strong><small>End this local preview session on this device</small></div><ChevronRight aria-hidden="true" size={17} /></button></Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogOverlay} />
              <Dialog.Content className={styles.confirmDialog} role="dialog" aria-modal="true" aria-describedby="settings-signout-description">
                <Dialog.Title>Sign out of MealHrs?</Dialog.Title>
                <Dialog.Description id="settings-signout-description">You will return to the sign-in preview. No remote session exists yet.</Dialog.Description>
                <div className={styles.dialogActions}><Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close><Dialog.Close asChild><Button variant="danger" onClick={signOut}>Sign out</Button></Dialog.Close></div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <button className={`${styles.settingRow} ${styles.danger}`} type="button" onClick={() => setMessage("Account deletion requires identity confirmation and is not available in this frontend preview.")}><div><strong>Delete account</strong><small>Your orders and required financial records follow the retention policy.</small></div><ChevronRight aria-hidden="true" size={17} /></button>
        </section>
      </div>
      <div className={styles.statusText} role="status" aria-live="polite">{message}</div>
    </div>
  );
}
