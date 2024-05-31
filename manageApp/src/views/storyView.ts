import { addTask, updateTask, deleteTask } from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status, Task } from "../models/task";
import { refreshProjects } from "../main";
import { Project } from "../models/project";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../firebase";

export function renderStories(
  project: Project,
  userManager: UserSessionManager
): string {
  let story: Story | undefined = undefined;
  let populate = true;
  if (userManager.currentStoryId != null && project.stories) {
    story = project.stories.find(
      (story) => story.id === userManager.currentStoryId
    );
  }

  if (!project || !story) {
    return "";
  }

  document.addEventListener("click", handleClick);

  async function populateUserAssignedDropdown() {
    const db = getFirestore(app);
    const usersCollectionRef = collection(db, "users");
    const querySnapshot = await getDocs(usersCollectionRef);
    const userAssignedDropdown = document.getElementById(
      "editTaskUserAssigned"
    ) as HTMLSelectElement;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const option = document.createElement("option");
      option.value = JSON.stringify({
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      });
      option.textContent = userData.firstName;
      userAssignedDropdown.appendChild(option);
    });
  }

  async function handleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const editDialog = document.getElementById(
      "editTaskDialog"
    ) as HTMLDialogElement;

    if (target.classList.contains("addTask")) {
      const newTaskName = prompt("Enter the name of the new task:");
      const newTaskDescription = prompt(
        "Enter the description of the new task:"
      );
      let maxTaskID = -1;
      story?.tasks?.forEach((task) => {
        if (task.id != undefined && task.id > maxTaskID) {
          maxTaskID = task.id;
        }
      });

      if (newTaskName && newTaskDescription && story?.id != null) {
        const newTask: Task = {
          id: maxTaskID + 1,
          name: newTaskName,
          description: newTaskDescription,
          priority: Priority.LOW,
          story: story.id,
          status: Status.TODO,
          addedDate: Date.now(),
        };

        addTask(project.id, story.id, newTask);
        document.removeEventListener("click", handleClick);
        refreshProjects();
      }
    } else if (target.classList.contains("exitStory")) {
      userManager.setCurrentStory(null);
      document.removeEventListener("click", handleClick);
      refreshProjects();
    } else if (target.classList.contains("editTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null && story.tasks != null) {
        const taskToEdit = story.tasks.find((task) => task.id === taskId);
        if (taskToEdit) {
          const editTaskNameInput = document.getElementById(
            "editTaskName"
          ) as HTMLInputElement;
          const editTaskDescriptionInput = document.getElementById(
            "editTaskDescription"
          ) as HTMLTextAreaElement;
          const editTaskPrioritySelect = document.getElementById(
            "editTaskPriority"
          ) as HTMLSelectElement;
          const editTaskUserAssignedInput = document.getElementById(
            "editTaskUserAssigned"
          ) as HTMLSelectElement;

          if (populate) await populateUserAssignedDropdown();
          populate = false;
          editTaskNameInput.value = taskToEdit.name;
          editTaskDescriptionInput.value = taskToEdit.description;
          editTaskPrioritySelect.value = taskToEdit.priority;

          if (taskToEdit.userAssigned) {
            editTaskUserAssignedInput.value = JSON.stringify(
              taskToEdit.userAssigned
            );
          }

          editDialog?.showModal();

          const saveButton = document.getElementById(
            "saveTaskButton"
          ) as HTMLButtonElement;

          const saveListener = () => {
            const updatedTaskName = editTaskNameInput.value;
            const updatedTaskDescription = editTaskDescriptionInput.value;
            const updatedTaskPriority =
              editTaskPrioritySelect.value as Priority;
            const updatedTaskStatus = Status.TODO;
            const updatedTaskUserAssigned = editTaskUserAssignedInput.value;
            if (
              updatedTaskName &&
              updatedTaskDescription &&
              story.id != undefined
            ) {
              const updatedTask: Partial<Task> = {
                id: taskId,
                name: updatedTaskName,
                description: updatedTaskDescription,
                priority: updatedTaskPriority,
                status: updatedTaskStatus,
                userAssigned: JSON.parse(updatedTaskUserAssigned),
              };
              updateTask(project.id, story.id, updatedTask);
              editDialog?.close();
              refreshProjects();
            }
          };

          saveButton?.addEventListener("click", saveListener);
          editDialog?.addEventListener("close", () => {
            saveButton?.removeEventListener("click", saveListener);
          });
        }
      }
    } else if (target.classList.contains("deleteTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null) {
        deleteTask(project.id, story?.id, taskId);
        document.removeEventListener("click", handleClick);
        refreshProjects();
      }
    }
  }

  const tasksList =
    story.tasks && story.tasks.length > 0
      ? `${story.tasks
          .map(
            (task) =>
              `<div class="p-4 w-80  m-4 bg-white dark:bg-gray-700 shadow-md rounded-lg mb-4">
          <h3 class="text-xl font-semibold mb-2">${task.name}</h3>
          <p class="mb-2">Opis: ${task.description}</p>
          <p class="mb-2">Priorytet: ${task.priority}</p>
          <p class="mb-2">Status: ${task.status}</p>
          <p class="mb-2">Data Utworzenia: ${new Date(
            task.addedDate
          ).toLocaleString()}</p>
          <p class="mb-2">Wykonawca: ${
            task.userAssigned ? task.userAssigned?.firstName : "<i>brak</i>"
          }</p>
          <div class="flex space-x-2">
            <button class="editTask bg-yellow-500 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Edytuj</button>
            <button class="deleteTask bg-red-500 text-white py-1 px-2 rounded" data-task-id="${
              task.id
            }">Usuń</button>
            
          </div>
        </div>`
          )
          .join("")}`
      : "<p class='text-gray-500 dark:text-gray-300'>No tasks found.</p>";

  return `
    <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <div class="inline-block mb-4">
        <button class="exitStory  px-10 text-lg font-bold mb-2">←</button>
        <h1 class="text-2xl font-bold mb-4">Story: ${story.name}</h1>
        <button class="addTask bg-blue-500 text-white py-2 px-4 rounded">Dodaj Zadanie</button>
      </div>
      <dialog id="editTaskDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Edit Task</h2>
        <label for="editTaskName" class="block mb-2">Task Name:</label>
        <input type="text" id="editTaskName" name="editTaskName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="editTaskDescription" class="block mb-2">Task Description:</label>
        <textarea id="editTaskDescription" name="editTaskDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
        <label for="editTaskPriority" class="block mb-2">Task Priority:</label>
        <select id="editTaskPriority" name="editTaskPriority" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${Priority.LOW}">Low</option>
          <option value="${Priority.MEDIUM}">Medium</option>
          <option value="${Priority.HIGH}">High</option>
        </select>
        <label for="editTaskUserAssigned" class="block mb-2">User Assigned:</label>
        <select id="editTaskUserAssigned" name="editTaskUserAssigned" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        </select>
        <div class="flex justify-end space-x-2">
          <button id="saveTaskButton" class="bg-green-500 text-white py-2 px-4 rounded">Save</button>
          <button id="cancelEditTaskButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('editTaskDialog').close()">Cancel</button>
          <button class="endTask bg-green-700 text-white py-1 px-2 rounded">Zakończ Zadanie</button>
        </div>
      </dialog>
      <div class="taskList flex flex-wrap">
        ${tasksList}
      </div>
    </div>`;
}
