import "./style.css";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectById,
} from "./project.ts";
import { User } from "./user";
import { UserSessionManager } from "./userSessionManager";

const userManager = new UserSessionManager();
const user = new User(1, "Bartek", "Mojek");
userManager.login(user);

let Projects = getAllProjects();

function refreshProjects() {
  Projects = getAllProjects();
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  if (appDiv) {
    appDiv.innerHTML = `
      <div>
        <h1>MenageAPP</h1>
        <button id="addBtn">Stwórz nowy projekt</Button>
        <div>
          <p>Zalogowany użytkownik: ${userManager.loggedInUser?.firstName}</p>
          <p>Wybrany projekt: ${userManager.currentProjectId} </p>
        </div>
        <div class="projectContainer">
        ${Projects.map(
          (project) => `
            <div class="Project" data-id="${project.id}">
              <h2>${project.name}</h2>
              <p>${project.desc}</p>
              <button class="modBtn" data-id="${project.id}">Modify</button>
              <button class="delBtn" data-id="${project.id}">Delete</button>
            </div>
          `
        ).join("")}
      </div>
      </div>
    `;
  }
}

refreshProjects();

document.querySelector("#addBtn")?.addEventListener("click", () => {
  const newName = prompt("Podaj nazwe projektu:");
  const newDesc = prompt("Podaj opis projektu:");

  if (
    newName === null ||
    newDesc === null ||
    newName === "" ||
    newDesc === ""
  ) {
    return;
  }

  const maxId =
    Projects.length > 0
      ? Math.max(...Projects.map((project) => project.id))
      : 0;
  const newId = maxId + 1;
  createProject({ id: newId, name: newName, desc: newDesc });
  refreshProjects();
});

document.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = parseInt(
      (event.target as HTMLElement).getAttribute("data-id") || ""
    );
    deleteProject(projectId);
    refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("modBtn")) {
    const projectId = parseInt(
      (event.target as HTMLElement).getAttribute("data-id") || ""
    );
    modifyProject(projectId);
  }
});

function modifyProject(projectId: number) {
  const project = getProjectById(projectId);
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

  updateProject(projectId, { name: newName, desc: newDesc });
  refreshProjects();
}
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (
    target.classList.contains("modBtn") ||
    target.classList.contains("delBtn")
  ) {
    const projectId = parseInt(target.getAttribute("data-id") || "");
    modifyProject(projectId);
  } else if (target.classList.contains("Project")) {
    const projectId = parseInt(target.getAttribute("data-id") || "");
    setCurrentProject(projectId);
  }
});

function setCurrentProject(projectId: number) {
  userManager.setCurrentProject(projectId);
  console.log(userManager.currentProjectId);
  refreshProjects();
}
