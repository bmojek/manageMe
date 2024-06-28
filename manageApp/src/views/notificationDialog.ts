// components/NotificationDialog.ts

import { Notification } from "../models/notification";
import { NotificationService } from "../services/notificationService";

export class NotificationDialog {
  static render(notify: NotificationService) {
    const dialogElement = document.createElement("dialog");
    dialogElement.id = "notificationDialog";
    dialogElement.classList.add(
      "bg-white",
      "dark:bg-gray-700",
      "p-4",
      "rounded-lg",
      "shadow-md"
    );

    dialogElement.innerHTML = `
            <h2 class="text-xl font-bold mb-4">Powiadomienia</h2>
            <div id="notification-container"><p class="text-center py-5">Pusto</p></div>
            <div class="flex justify-end space-x-2">
                <button id="closeNotificationButton" class="bg-gray-500 text-white py-2 px-4 rounded">Zamknij</button>
            </div>
        `;

    document.body.appendChild(dialogElement);

    const notificationContainer = dialogElement.querySelector(
      "#notification-container"
    );

    function renderNotifications(notifications: Notification[]) {
      if (notificationContainer) {
        notificationContainer.innerHTML = notifications
          .map(
            (notification) => `
                            <div class="notification border-2 cursor-pointer rounded-md p-4 my-1">
                                <h3>${notification.title}</h3>
                                <p>${notification.message}</p>
                                <div class="date">${new Date(
                                  notification.date
                                ).toLocaleString()}</div>
                            </div>
                        `
          )
          .join("");
      }
    }

    notify.list().subscribe(renderNotifications);

    const closeButton = dialogElement.querySelector("#closeNotificationButton");
    closeButton?.addEventListener("click", () => {
      dialogElement.close();
    });

    const alertBox = document.createElement("i");
    alertBox.className =
      "alertBox cursor-pointer text-orange-500 pr-2 fa fa-bell";
    alertBox.style.fontSize = "24px";
    alertBox.addEventListener("click", () => {
      dialogElement.showModal();
    });

    const counter = document.createElement("span");
    counter.id = "counter";
    counter.className =
      "absolute alertbox pl-[7px] pointer-events-none pt-0.5 font-bold";

    return dialogElement;
  }
}
