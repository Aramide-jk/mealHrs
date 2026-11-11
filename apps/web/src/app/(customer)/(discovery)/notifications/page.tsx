import { NotificationsList } from "@/features/notifications/notifications-list";
import styles from "@/features/discovery/discovery.module.css";

export default function NotificationsPage(){return <div className="page page--narrow"><div className="page-head"><div><p className={styles.eyebrow}>Updates</p><h1>Notifications</h1></div></div><NotificationsList/></div>}
