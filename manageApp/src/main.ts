import "./style.css";
import {
  getAllProjects,
  createProject,
  deleteProject,
  updateProject,
  getProjectById,
  getStoryById,
} from "./services/projectManager.ts";
import { renderProjects } from "./views/projectView.ts";
import { User, mockUsers } from "./models/user.ts";
import { UserSessionManager } from "./services/userSessionManager.ts";
import { loginView } from "./views/loginView.ts";

const users: User[] = [];
const userManager = new UserSessionManager();
users.push(...mockUsers());
userManager.login(users[1]);

export async function refreshProjects() {
  const Projects = await getAllProjects();
  const appDiv = document.querySelector<HTMLDivElement>("#app");
  if (appDiv) {
    appDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-4">MenageAPP</h1>
        ${loginView(userManager)}
        <div>
          <p class="mb-2">Zalogowany użytkownik: ${
            userManager.loggedInUser?.firstName
          }</p>
          <a class="navBar navHome hover:text-cyan-500 ml-4">home</a>
          <b> / </b>
          <a class="navBar navStory hover:text-cyan-500">
           ${
             userManager.currentProjectId != null
               ? (await getProjectById(userManager.currentProjectId))?.name
               : ""
           } 
           </a>
           ${userManager.currentProjectId != null ? "<b> / </b>" : ""}
           <a class="navBar navTask hover:text-cyan-500">
           ${
             userManager.currentStoryId != null && userManager.currentProjectId
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
        <div class="absolute right-10 top-5">
        <label class="inline-flex items-center cursor-pointer">
        <input type="checkbox" value="" id="themeToggle" class="sr-only peer" checked>
        <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Ciemny Motyw</span>
        </label>
        </div>
        ${
          userManager.currentProjectId == null &&
          ` <div class="text-center text-3xl my-4"><button class="addBtn bg-blue-500 text-white py-2 px-4 rounded">+</Button></div>`
        }
       
        <div class="projectContainer">
      ${
        userManager.currentProjectId == null
          ? Projects.map(
              (project) => `
          <div class="Project border p-4 mb-4" data-id="${project.id}">
            <h2 class="text-xl font-semibold">${project.name}</h2>
            <p class="mb-2">${project.desc}</p>
            <button class="modBtn bg-yellow-500 text-white py-1 px-2 rounded mr-2" data-id="${project.id}">Edytuj</button>
            <button class="delBtn bg-red-500 text-white py-1 px-2 rounded mr-2" data-id="${project.id}">Usuń</button>
            <button class="chooseBtn bg-green-500 text-white py-1 px-2 rounded" data-id="${project.id}">Wybierz projekt</button>
          </div>
        `
            ).join("")
          : renderProjects(
              await getProjectById(userManager.currentProjectId),
              userManager
            )
      }
    </div>
    `;
  }
  const themeToggle = document.getElementById(
    "themeToggle"
  ) as HTMLInputElement;
  const isDarkMode = localStorage.getItem("theme") === "dark";
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  }
  themeToggle.checked = isDarkMode;

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
      newDesc === ""
    ) {
      return;
    }

    await createProject({ id: "", name: newName, desc: newDesc });
    await refreshProjects();
  }

  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    await deleteProject(projectId);
    await refreshProjects();
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
