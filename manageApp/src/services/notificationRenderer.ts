import { Notification } from "../models/notification.ts";
import { NotificationService } from "./notificationService.ts";

export function renderNotifications(
  notifications: Notification[],
  notify: NotificationService
) {
  const container = document.getElementById("notification-container");
  if (container) {
    container.innerHTML = notifications
      .map(
        (notification, index) => `
      <div class="notification ${
        notification.read ? "opacity-25" : ""
      } border-b-2 cursor-pointer p-4 my-5" data-index="${index}">
        <h3 class="text-lg font-bold">${notification.title}</h3>
        <p>${notification.message}</p>
        <div class="date float-end text-xs">${new Date(
          notification.date
        ).toLocaleString()}</div>
      </div>
    `
      )
      .join("");

    container
      .querySelectorAll(".notification")
      .forEach((notificationElement) => {
        notificationElement.addEventListener("click", (event) => {
          const index = (event.currentTarget as HTMLElement).getAttribute(
            "data-index"
          );
          if (index !== null) {
            notify.markAsRead(parseInt(index, 10));
          }
        });
      });
  }
}

export function renderCounter(count: number) {
  const counter = document.getElementById("counter");

  if (counter && count > 0) {
    counter.innerHTML = count.toString();
  } else if (counter) {
    counter.innerHTML = "";
  }
}
