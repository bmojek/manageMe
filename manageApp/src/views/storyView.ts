import {
  addTask,
  updateTask,
  deleteTask,
  Project,
} from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status, Task } from "../models/task";
import { refreshProjects } from "../main";

export function renderStories(
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

  document.addEventListener("click", handleClick3);

  function handleClick3(event: MouseEvent) {
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
      story?.tasks?.map((task) =>
        task.id ? (task.id > maxTaskID ? (maxTaskID = task.id) : "") : ""
      );

      if (newTaskName && newTaskDescription && story?.id != null) {
        const newTask: Task = {
          id: maxTaskID + 1,
          name: newTaskName,
          description: newTaskDescription,
          priority: Priority.LOW,
          story: story.id,
          status: Status.TODO,
          addedDate: new Date(),
        };

        addTask(project.id, story.id, newTask);
        document.removeEventListener("click", handleClick3);
        refreshProjects();
      }
    } else if (target.classList.contains("exitStory")) {
      userManager.setCurrentStory(null);
      document.removeEventListener("click", handleClick3);
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
          editTaskNameInput.value = taskToEdit.name;
          editTaskDescriptionInput.value = taskToEdit.description;

          editDialog?.showModal();
          const saveButton = document.getElementById(
            "saveTaskButton"
          ) as HTMLButtonElement;
          saveButton?.addEventListener("click", () => {
            const updatedTaskName = editTaskNameInput.value;
            const updatedTaskDescription = editTaskDescriptionInput.value;
            if (updatedTaskName && updatedTaskDescription && story.id) {
              const updatedTask: Partial<Task> = {
                id: taskId,
                name: updatedTaskName,
                description: updatedTaskDescription,
              };
              updateTask(project.id, story.id, updatedTask);
              editDialog?.close();
              refreshProjects();
            }
          });
          editDialog?.addEventListener("close", () => {
            saveButton?.removeEventListener("click", () => {
              editDialog.close();
            });
          });
        }
      }
    } else if (target.classList.contains("deleteTask")) {
      const taskId = parseInt(target.getAttribute("data-task-id") || "");
      if (!isNaN(taskId) && story?.id != null) {
        deleteTask(project.id, story?.id, taskId);
        document.removeEventListener("click", handleClick3);
        refreshProjects();
      }
    }
  }

  const tasksList =
    story.tasks && story.tasks.length > 0
      ? `${story.tasks
          .map(
            (task) =>
              `<div class="p-4 w-[100%] m-4 bg-white dark:bg-gray-700 shadow-md rounded-lg mb-4">
          <h3 class="text-xl font-semibold mb-2">${task.name}</h3>
          <p class="mb-2">Description: ${task.description}</p>
          <p class="mb-2">Priority: ${task.priority}</p>
          <p class="mb-2">Status: ${task.status}</p>
          <p class="mb-2">Added Date: ${task.addedDate}</p>
          <p class="mb-2">User Assigned: ${task.userAssigned?.firstName}</p>
          <div class="flex space-x-2">
            <button class="editTask bg-yellow-500 text-white py-1 px-2 rounded" data-task-id="${task.id}">Edit</button>
            <button class="deleteTask bg-red-500 text-white py-1 px-2 rounded" data-task-id="${task.id}">Delete</button>
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
        <button class="addTask bg-blue-500 text-white py-2 px-4 rounded">Dodaj zadanie</button>
      </div>
      <dialog id="editTaskDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Edit Task</h2>
        <label for="editTaskName" class="block mb-2">Task Name:</label>
        <input type="text" id="editTaskName" name="editTaskName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="editTaskDescription" class="block mb-2">Task Description:</label>
        <textarea id="editTaskDescription" name="editTaskDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
        <div class="flex justify-end space-x-2">
          <button id="saveTaskButton" class="bg-green-500 text-white py-2 px-4 rounded">Save</button>
          <button id="cancelEditTaskButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('editTaskDialog').close()">Cancel</button>
        </div>
      </dialog>
      <div class="taskList flex flex-wrap">
        ${tasksList}
      </div>
    </div>`;
}
