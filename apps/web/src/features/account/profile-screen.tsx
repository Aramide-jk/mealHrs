"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { CustomerProfile, Order } from "@mealhrs/domain";
import { Bell, Bookmark, ChevronRight, Heart, HelpCircle, LogOut, MapPin, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/ui/status";
import { useCustomerContext } from "@/lib/customer-context";
import styles from "./account.module.css";

export function ProfileScreen({ activeOrder, profile }: Readonly<{ activeOrder: Order | null; profile: CustomerProfile }>) {
  const router = useRouter();
  const { isSignedIn, setPendingIntent, setSignedIn } = useCustomerContext();

  if (!isSignedIn) {
    return (
      <div className="page">
        <section className={styles.signedOut}>
          <UserRound aria-hidden="true" size={42} />
          <h1>Sign in to see your profile</h1>
          <p>Your saved meals, followed kitchens and order history stay together when you sign in.</p>
          <Button onClick={() => { setPendingIntent("/profile"); router.push("/auth"); }}>Sign in</Button>
        </section>
      </div>
    );
  }

  const signOut = () => {
    setSignedIn(false);
    setPendingIntent("/profile");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div><p className={styles.eyebrow}>Your MealHrs</p><h1>Profile</h1></div>
        <Button asChild size="sm" variant="secondary"><Link href="/profile/settings">Settings</Link></Button>
      </div>
      <div className={styles.profileLayout}>
        <div className="stack-lg">
          <section className={`surface-section ${styles.profileIdentity}`}>
            <div className={styles.avatar} aria-hidden="true">TA</div>
            <div><h2>{profile.name}</h2><p>{profile.email} · {profile.phone}</p></div>
            <Button asChild className={styles.profileIdentityAction} size="sm" variant="secondary"><Link href="/profile/settings">Edit profile</Link></Button>
          </section>
          <section aria-labelledby="quick-access-title">
            <div className={styles.sectionTitle}><h2 id="quick-access-title">Quick access</h2></div>
            <div className={styles.shortcutGrid}>
              <Link className={styles.shortcut} href="/saved"><span><Bookmark aria-hidden="true" /></span>Saved meals</Link>
              <Link className={styles.shortcut} href="/following"><span><Heart aria-hidden="true" /></span>Following</Link>
              <Link className={styles.shortcut} href="/notifications"><span><Bell aria-hidden="true" /></span>Notifications</Link>
              <Link className={styles.shortcut} href="/profile/addresses"><span><MapPin aria-hidden="true" /></span>Addresses</Link>
            </div>
          </section>
          <section className="surface-section" aria-labelledby="account-links-title">
            <div className={styles.sectionTitle}><h2 id="account-links-title">Account</h2></div>
            <div className={styles.listLinks}>
              <Link className={styles.listLink} href="/profile/settings"><span><Settings aria-hidden="true" size={17} /></span>Preferences and privacy<ChevronRight aria-hidden="true" size={17} /></Link>
              <Link className={styles.listLink} href="/support"><span><HelpCircle aria-hidden="true" size={17} /></span>Help and support<ChevronRight aria-hidden="true" size={17} /></Link>
              <Dialog.Root>
                <Dialog.Trigger asChild><button className={`${styles.listLink} ${styles.danger}`} type="button"><span><LogOut aria-hidden="true" size={17} /></span>Sign out</button></Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className={styles.dialogOverlay} />
                  <Dialog.Content className={styles.confirmDialog} role="dialog" aria-modal="true" aria-describedby="signout-description">
                    <Dialog.Title>Sign out of MealHrs?</Dialog.Title>
                    <Dialog.Description id="signout-description">This only changes the local frontend preview. Your mock orders remain available.</Dialog.Description>
                    <div className={styles.dialogActions}>
                      <Dialog.Close asChild><Button variant="secondary">Stay signed in</Button></Dialog.Close>
                      <Dialog.Close asChild><Button variant="danger" onClick={signOut}>Sign out</Button></Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </section>
        </div>
        <aside className="stack" aria-label="Order and account summary">
          {activeOrder ? (
            <section className={styles.orderMini}>
              <div className="split"><Status>Preparing</Status><span className={`${styles.small} ${styles.muted}`}>{activeOrder.reference}</span></div>
              <h3>{activeOrder.vendorName}</h3>
              <p className={styles.small}>Expected {activeOrder.fulfillmentWindow.toLowerCase()}</p>
              <div className={styles.progress} aria-label="Order preparation progress"><span /></div>
              <Button asChild block size="sm" variant="secondary"><Link href={`/orders/${activeOrder.id}`}>Track order</Link></Button>
            </section>
          ) : null}
          <section className="surface-section">
            <div className={styles.sectionTitle}><h3>Recent activity</h3><Link href="/orders">View all</Link></div>
            <p className={styles.small} style={{ margin: 0 }}>Your Sunday Party Jollof drop is saved. Cutoff is Saturday at 6:00 PM WAT.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
