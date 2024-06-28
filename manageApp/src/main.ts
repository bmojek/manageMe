import "./style.css";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectById,
} from "./services/projectManager.ts";
import { ProjectList } from "./views/projectList.ts";
import { UserSessionManager } from "./services/userSessionManager.ts";
import { NotificationService } from "./services/notificationService.ts";
import { Notification } from "./models/notification.ts";

const userManager = new UserSessionManager();
const notify = new NotificationService();

function renderNotifications(notifications: Notification[]) {
  const container = document.getElementById("notification-container");
  if (container) {
    container.innerHTML = notifications
      .map(
        (notification) => `
      <div class="notification border-2 cursor-pointer rounded-md p-4 my-1">
        <h3>${notification.title}</h3>
        <p>${notification.message}</p>
        <div class="date">${new Date(notification.date).toLocaleString()}</div>
      </div>
    `
      )
      .join("");
  }
}
function renderCounter(count: number) {
  const counter = document.getElementById("counter");
  if (counter && count > 0) {
    counter.innerHTML = count.toString();
  }
}
notify.unreadCount().subscribe(renderCounter);
notify.list().subscribe(renderNotifications);

export async function refreshProjects() {
  const allProjects = await getAllProjects();
  const Projects = allProjects.filter((project) => {
    const isOwner = project.ownerId === userManager.loggedInUser?.id;
    const isAssignedToTask = project.stories?.some((story) =>
      story.tasks?.some(
        (task) =>
          task.userAssigned?.firstName ===
            userManager.loggedInUser?.firstName &&
          task.userAssigned?.lastName === userManager.loggedInUser?.lastName
      )
    );
    return isOwner || isAssignedToTask;
  });

  ProjectList(Projects, userManager);
}

refreshProjects();

document.addEventListener("click", handleClick);

async function handleClick(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains("addBtn")) {
    const newName = prompt("Podaj nazwe projektu:");
    const newDesc = prompt("Podaj opis projektu:");
    if (
      newName === null ||
      newDesc === null ||
      newName === "" ||
      newDesc === "" ||
      !userManager.loggedInUser
    ) {
      return;
    }

    await createProject({
      name: newName,
      desc: newDesc,
      ownerId: userManager.loggedInUser.id,
    });

    await refreshProjects();
    notify.send({
      title: "Nowy Projekt",
      message: `Nowy projekt ${newName} został dodany`,
      date: new Date().toISOString(),
      priority: "medium",
      read: false,
    });
  }

  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    await deleteProject(projectId);
    await refreshProjects();
  }
  if ((event.target as HTMLElement).classList.contains("alertBox")) {
    const dialog = document.getElementById(
      "notification"
    ) as HTMLDialogElement | null;
    dialog?.showModal();
  }
  if ((event.target as HTMLElement).classList.contains("modBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    const project = await getProjectById(projectId);
    if (!project) return;

    const newName = prompt("Podaj nazwe projektu:", project.name);
    const newDesc = prompt("Podaj opis projektu:", project.desc);

    if (
      newName === null ||
      newDesc === null ||
      newName === "" ||
      newDesc === ""
    ) {
      return;
    }

    await updateProject(projectId, { name: newName, desc: newDesc });
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("chooseBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    userManager.setCurrentProject(projectId);
    location.reload();
  }

  if ((event.target as HTMLElement).classList.contains("exitProject")) {
    userManager.setCurrentProject(null);
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("navStory")) {
    userManager.setCurrentStory(null);
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("navHome")) {
    userManager.setCurrentProject(null);
    userManager.setCurrentStory(null);
    await refreshProjects();
  }
}
