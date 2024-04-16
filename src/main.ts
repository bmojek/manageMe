import "./style.css";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectById,
} from "./services/projectManager.ts";
import { renderProjects } from "./views/projectView.ts";
import { User, mockUsers } from "./models/user.ts";
import { UserSessionManager } from "./services/userSessionManager.ts";

const users: User[] = [];
const userManager = new UserSessionManager();
users.push(...mockUsers());

userManager.login(users[0]);

let Projects = getAllProjects();

function refreshProjects() {
  Projects = getAllProjects();
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  if (appDiv) {
    appDiv.innerHTML = `

        <h1>MenageAPP</h1>
        <button class="addBtn">Stwórz nowy projekt</Button>
        <div>
          <p>Zalogowany użytkownik: ${userManager.loggedInUser?.firstName}</p>
          <p>Wybrany projekt: ${
            userManager.currentProjectId != null
              ? getProjectById(userManager.currentProjectId)?.name
              : "Nie wybrano projektu"
          } </p>
        </div>
        <div class="userList">
        <p>Lista użytkowników:</p>
        <ul>
          ${users
            .map(
              (user) =>
                `<li>${user.firstName} ${user.lastName} ${user.role}</li>`
            )
            .join("")}
          </ul>
        </div>
        <div class="projectContainer">
      ${
        userManager.currentProjectId == null
          ? Projects.map(
              (project) => `
          <div class="Project" data-id="${project.id}">
            <h2>${project.name}</h2>
            <p>${project.desc}</p>
            <button class="modBtn" data-id="${project.id}">Modify</button>
            <button class="delBtn" data-id="${project.id}">Delete</button>
            <button class="chooseBtn" data-id="${project.id}">Wybierz projekt</button>
          </div>
        `
            ).join("")
          : renderProjects(userManager.currentProjectId, userManager)
      }
    </div>

    `;
  }
}

refreshProjects();

document.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).classList.contains("addBtn")) {
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
  }

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
  if ((event.target as HTMLElement).classList.contains("chooseBtn")) {
    const projectId = parseInt(
      (event.target as HTMLElement).getAttribute("data-id") || ""
    );
    userManager.setCurrentProject(projectId);
    refreshProjects();
  }
  if ((event.target as HTMLElement).classList.contains("exitProject")) {
    userManager.setCurrentProject(null);
    refreshProjects();
  }
});
