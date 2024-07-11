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
  markAsRead(index: number): void {
    if (index >= 0 && index < this.notifications.length) {
      this.notifications[index].read = true;
      this.notificationsSubject.next([...this.notifications]);
      this.updateUnreadCount();
    }
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications.filter(
      (notif) => !notif.read
    ).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private openDialog(notification: Notification): void {
    const notificationDialog = document.getElementById("notificationDialog");
    const notificationTitle = document.getElementById("notificationTitle");
    const notificationMessage = document.getElementById("notificationMessage");

    if (notificationDialog && notificationTitle && notificationMessage) {
      notificationTitle.innerText = notification.title;
      notificationMessage.innerText = notification.message;
      notificationDialog.classList.remove("hidden");
      setTimeout(() => {
        notificationDialog.classList.add("hidden");
      }, 3000);
    } else {
      console.log("Notification dialog element not found.");
    }
  }
}
