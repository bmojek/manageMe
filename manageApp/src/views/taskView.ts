import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status, Task } from "../models/task";
import { Project } from "../models/project";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { UserRole } from "../models/user";

export function TaskView(
  project: Project,
  userManager: UserSessionManager
): string {
  let story: Story | undefined = undefined;
  if (userManager.currentStoryId != null && project.stories) {
    story = project.stories.find(
      (story) => story.id === userManager.currentStoryId
    );
  }

  if (!project || !story) {
    return "";
  }

  async function populateUserAssignedDropdown() {
    const db = getFirestore(app);
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const userAssignedDropdown = document.getElementById(
      "editTaskUserAssigned"
    ) as HTMLSelectElement;
    userAssignedDropdown.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role != UserRole.ADMIN) {
        const option = document.createElement("option");
        option.value = JSON.stringify({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
        });

        option.textContent = userData.firstName + " (" + userData.role + ")";
        userAssignedDropdown.appendChild(option);
      }
    });
  }

  populateUserAssignedDropdown();

  const tasksByStatus = {
    [Status.TODO]:
      story.tasks?.filter((task) => task.status === Status.TODO) || [],
    [Status.DOING]:
      story.tasks?.filter((task) => task.status === Status.DOING) || [],
    [Status.DONE]:
      story.tasks?.filter((task) => task.status === Status.DONE) || [],
  };

  const renderTasks = (tasks: Task[]) => {
    return tasks
      .map(
        (task) =>
          `<div class="p-4 w-[17em] mx-auto m-4 bg-white dark:bg-gray-700 shadow-md rounded-lg mb-4">
            <h3 class="text-xl font-semibold mb-2">${task.name}</h3>
            <p class="mb-2">Opis: ${task.description}</p>
            <p class="mb-2">Priorytet: ${task.priority}</p>
            <p class="mb-2">Status: ${task.status}</p>
            <p class="mb-2">Data Utworzenia: ${new Date(
              task.addedDate
            ).toLocaleString()}</p>
            ${
              task.startWorkDate == undefined
                ? ``
                : `<p class="mb-2">Data Startu: ${new Date(
                    task.startWorkDate
                  ).toLocaleString()}</p>`
            }
            ${
              task.endDate === undefined || task.endDate === 0
                ? ``
                : `<p class="mb-2">Data Zakończenia: ${new Date(
                    task.endDate
                  ).toLocaleString()}</p>`
            }
            <p class="mb-2">Wykonawca: ${
              task.userAssigned ? task.userAssigned?.firstName : "<i>brak</i>"
            }</p>
            <p class="mb-2">Przewidywany czas wykonania: ${
              task.estimatedTime ? task.estimatedTime : "<i>brak</i>"
            }</            ><div class="flex space-x-2">
            <button class="editTask bg-yellow-500 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Edytuj</button>
            <button class="deleteTask bg-red-500 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Usuń</button>
            ${
              task.userAssigned === undefined
                ? ""
                : ` <button class="endTask bg-green-700 text-white py-1 px-2 rounded" data-task-id="${
                    task.id
                  }">${
                    task.endDate == 0 || task.endDate == undefined
                      ? `Zakończ`
                      : "Wznów"
                  }</button>`
            }
          </div>
        </div>`
      )
      .join("");
  };

  const tasksList = `
  <div class="py-10 grid grid-cols-1 xl:grid-cols-3 gap-4">
    <div class="col-span-1">
      <h2 class="text-lg text-center font-semibold mb-4">TODO</h2>
      ${renderTasks(tasksByStatus[Status.TODO])}
    </div>
    <div class="col-span-1 ">
      <h2 class="text-lg text-center font-semibold mb-4">DOING</h2>
      ${renderTasks(tasksByStatus[Status.DOING])}
    </div>
    <div class="col-span-1">
      <h2 class="text-lg text-center font-semibold mb-4">DONE</h2>
      ${renderTasks(tasksByStatus[Status.DONE])}
    </div>
  </div>
`;

  return `
  <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
    <div class=taskContainer inline-block data-project=${project.id} data-story=${story.id} mb-4">
      <button class="exitStoryIn px-10 text-lg font-bold mb-2">←</button>
      <h1 class="text-2xl font-bold mb-4">Story: ${story.name}</h1>
      <button class="addTask bg-blue-500 text-white py-2 px-4 rounded">Dodaj Zadanie</button>
    </div>
    <dialog id="editTaskDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Edytuj Zadanie</h2>
      <label for="editTaskName" class="block mb-2">Nazwa zadania:</label>
      <input type="text" id="editTaskName" name="editTaskName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      <label for="editTaskDescription" class="block mb-2">Opis:</label>
      <textarea id="editTaskDescription" name="editTaskDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
      <label for="editTaskPriority" class="block mb-2">Priorytet:</label>
      <select id="editTaskPriority" name="editTaskPriority" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <option value="${Priority.LOW}">Low</option>
        <option value="${Priority.MEDIUM}">Medium</option>
        <option value="${Priority.HIGH}">High</option>
      </select>
      <label for="editTaskUserAssigned" class="block mb-2">Wykonawca:</label>
      <select id="editTaskUserAssigned" name="editTaskUserAssigned" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      
      </select>
      <label for="editTaskEstimatedTime" class="block mb-2">Przewidywany czas wykonania (dni):</label>
      <input type="date" id="editTaskEstimatedTime" name="editTaskEstimatedTime" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
      <div class="flex justify-end space-x-2">
        <button id="saveTaskButton" class="bg-green-500 text-white py-2 px-4 rounded">Save</button>
        <button id="cancelEditTaskButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('editTaskDialog').close()">Cancel</button>
      </div>
    </dialog>
    <div class="taskList">
      ${tasksList}
    </div>
  </div>`;
}
