import { getProjectById, getStoryById } from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { StoryView } from "./storyView";
import { Project } from "../models/project";
import { loginView } from "./loginView";
import { Notification } from "../models/notification";
import {
  renderCounter,
  renderNotifications,
} from "../services/notificationRenderer";
import { NotificationService } from "../services/notificationService";
import { handleClick } from "../services/handleClick";

var event = true;
export async function ProjectView(
  projects: Project[],
  userManager: UserSessionManager,
  notify: NotificationService
) {
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  if (appDiv) {
    appDiv.innerHTML = `
                <h1 class="text-2xl font-bold mb-4">MenageAPP</h1>
                ${loginView(userManager)}
                <div>
                    <a class="navBar navHome hover:text-cyan-500 hover:cursor-pointer ml-4">~</a>
                    <b> / </b>
                    <a class="navBar navStory hover:text-cyan-500 hover:cursor-pointer">
                        ${
                          userManager.currentProjectId != null
                            ? (
                                await getProjectById(
                                  userManager.currentProjectId
                                )
                              )?.name
                            : ""
                        } 
                    </a>
                    ${userManager.currentProjectId != null ? "<b> / </b>" : ""}
                    <a class="navBar navTask hover:text-cyan-500 hover:cursor-pointer">
                        ${
                          userManager.currentStoryId != null &&
                          userManager.currentProjectId
                            ? (
                                await getStoryById(
                                  userManager.currentProjectId,
                                  userManager.currentStoryId
                                )
                              )?.name
                            : ""
                        } 
                    </a>
                </div>
                <div>
                    <dialog id="notification" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
                        <h2 class="text-xl font-bold mb-4">Powiadomienia</h2>
                        <div id="notification-container"><p class="text-center py-5">Pusto</p></div>
                        <div class="flex justify-end space-x-2">
                            <button id="cancelRegisterButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('notification')?.close()">Zamknij</button>
                        </div>
                    </dialog>
                </div>
                 <div class="fixed right-3 top-25 w-80 bg-blue-900 text-white hidden rounded-xl shadow-lg p-4" id="notificationDialog">
                    <div class="font-bold text-lg" id="notificationTitle"></div>
                    <div class="mt-2" id="notificationMessage"></div>
                </div>
                <div class="absolute right-10 lg:right-[17%] top-5">
                    <span id="counter" class="absolute alertbox pl-[7.5px] pointer-events-none pt-0.5 font-bold"></span>
                    <i class="alertBox cursor-pointer text-orange-500 pr-2 fa fa-bell" style="font-size:24px"></i>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" id="themeToggle" class="sr-only peer" checked>
                        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>   
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ciemny Motyw</span>
                    </label>
                </div>
                ${
                  userManager.currentProjectId == null &&
                  userManager.loggedInUser
                    ? ` <div class="text-center text-3xl my-4"><button class="addBtn bg-blue-500 text-white py-2 px-4 rounded">+</Button></div>`
                    : ""
                }
                ${
                  !userManager.loggedInUser
                    ? `<div class="text-4xl hover:text-gray-400 text-center mt-[25%]">Zaloguj się zeby zobaczyć projekty</div>`
                    : ``
                }
                <div class="projectContainer flex-col  ${
                  !userManager.loggedInUser ? "hidden" : "flex"
                } ">
                    ${
                      userManager.currentProjectId == null
                        ? projects
                            .map(
                              (project) => `
                                    <div class="  border-r-8 rounded-md mx-auto w-1/2 bg-gray-300 dark:bg-gray-500 ${
                                      project.ownerId ===
                                      userManager.loggedInUser?.id
                                        ? `border-green-600`
                                        : `border-orange-500`
                                    } p-4 m-4" data-id="${project.id}">
                                        <h2 class="text-3xl font-semibold">${
                                          project.name
                                        }</h2>
                                        <p class="mb-2 py-2">${project.desc}</p>
                                        <button class="modBtn bg-yellow-500 text-white py-1 px-2 rounded mr-2" data-id="${
                                          project.id
                                        }">Edytuj</button>
                                        <button class="delBtn bg-red-500 text-white py-1 px-2 rounded mr-2" data-id="${
                                          project.id
                                        }">Usuń</button>
                                        <button class="chooseBtn bg-green-500 text-white py-1 px-2 rounded" data-id="${
                                          project.id
                                        }">Wybierz</button>
                                    </div>
                                `
                            )
                            .join("")
                        : StoryView(
                            await getProjectById(userManager.currentProjectId),
                            userManager
                          )
                    }
                </div>
            `;
    notify.unreadCount().subscribe(renderCounter);
    notify
      .list()
      .subscribe((notifications: Notification[]) =>
        renderNotifications(notifications, notify)
      );
    if (event) {
      event = false;
      document.addEventListener("click", (e) => handleClick(e, userManager));
    }
  }
  const themeToggle = document.getElementById(
    "themeToggle"
  ) as HTMLInputElement;
  const isDarkMode = localStorage.getItem("theme") === "dark";
  themeToggle.checked = isDarkMode;
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }
  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
}
