import { BehaviorSubject, Observable } from "rxjs";
import { Notification } from "../models/notification";

export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  send(notification: Notification): void {
    this.notifications.unshift(notification);
    this.notificationsSubject.next([...this.notifications]);
    this.updateUnreadCount();
    if (
      notification.priority === "medium" ||
      notification.priority === "high"
    ) {
      this.openDialog(notification);
    }
  }

  list(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  unreadCount(): Observable<number> {
    return this.unreadCountSubject.asObservable();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter(
      (notif) => !notif.read
    ).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private openDialog(notification: Notification): void {
    console.log("Dialog opened for notification:", notification);
  }
}
