"use client";

import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import styles from "../discovery/discovery.module.css";

const items=[{href:"/orders/order-mh-20481",title:"Your order is preparing",copy:"Amaka's Kitchen started preparing order MH-20481.",time:"12 minutes ago",unread:true},{href:"/drops/drop-sunday-jollof",title:"Sunday Party Jollof is open",copy:"Pre-order before Saturday at 6:00 PM WAT.",time:"2 hours ago",unread:true},{href:"/dishes/dish-jollof-chicken",title:"A saved meal is available",copy:"Jollof Rice & Chicken is accepting orders now.",time:"Yesterday",unread:false}];
export function NotificationsList(){const [error,setError]=useState(false);const [read,setRead]=useState(false);return <><div className={styles.stateTools}><label className={styles.field}><span className="sr-only">Preview state</span><select className={styles.select} value={error?"error":"content"} onChange={e=>setError(e.target.value==="error")} aria-label="Preview notifications state"><option value="content">Notifications</option><option value="error">Error</option></select></label><Button variant="ghost" size="sm" onClick={()=>setRead(true)}>Mark all read</Button></div>{error?<EmptyState icon={<Bell/>} title="We couldn't load updates" description="Your notifications are safe. Check your connection and try again." action={<Button onClick={()=>setError(false)}>Try again</Button>}/>:<section aria-live="polite"><h2 style={{fontSize:'.8rem'}}>Today</h2>{items.map(item=><Link className={`${styles.notification} ${item.unread&&!read?styles.unread:""}`} href={item.href} key={item.title}><div className={styles.notificationCopy}><strong>{item.title}</strong><p>{item.copy}</p><time>{item.time}</time></div><ChevronRight/></Link>)}</section>}</>}
