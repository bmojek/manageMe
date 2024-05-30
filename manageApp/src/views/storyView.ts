import {
  getProjectById,
  getStoryById,
  addTask,
  updateTask,
  deleteTask,
} from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status, Task } from "../models/task";
import { refreshProjects } from "../main";

export function renderStories(
  projectId: number,
  userManager: UserSessionManager
): string {
  const project = getProjectById(projectId);
  let story: Story | undefined = undefined;
  if (userManager.currentStoryId != null) {
    story = getStoryById(projectId, userManager.currentStoryId);
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
      const newTaskName = prompt("Enter the name of the new story:");
      const newTaskDescription = prompt(
        "Enter the description of the new story:"
      );

      const maxTaskID =
        getProjectById(projectId)?.stories?.reduce((max, story) => {
          if (story.tasks) {
            const maxInStory = story.tasks.reduce((maxID, task) => {
              return task.id > maxID ? task.id : maxID;
            }, -1);
            return maxInStory > max ? maxInStory : max;
          }
          return max;
        }, -1) ?? -1;
      if (
        newTaskName &&
        newTaskDescription &&
        userManager.loggedInUser &&
        story?.id != null
      ) {
        const newTask: Task = {
          id: maxTaskID + 1,
          name: newTaskName,
          description: newTaskDescription,
          priority: Priority.LOW,
          story: story.id,
          status: Status.TODO,
          addedDate: new Date(),
        };
        addTask(projectId, story.id, newTask);
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
            if (updatedTaskName && updatedTaskDescription) {
              const updatedTask: Partial<Task> = {
                id: taskId,
                name: updatedTaskName,
                description: updatedTaskDescription,
              };
              updateTask(projectId, story.id, updatedTask);
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
        deleteTask(projectId, story?.id, taskId);
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
              `<div class="taskCard">
          <h3>${task.name}</h3>
          <p>Description: ${task.description}</p>
          <p>Priority: ${task.priority}</p>
          <p>Status: ${task.status}</p>
          <p>Added Date: ${task.addedDate}</p>
          <p>User Assigned: ${task.userAssigned?.firstName}</p>
          <button class="editTask" data-task-id="${task.id}">Edit</button>
          <button class="deleteTask" data-task-id="${task.id}">Delete</button>
          </div> `
          )
          .join("")}`
      : "<p>No tasks found.</p>";

  return `
      <div class="inline-block ">
        <button class="exitStory backBtn">←</button>
        <h1>Story: ${story.name}</h1>
        <button class="addTask">Dodaj zadanie</button>
      </div>
      <dialog id="editTaskDialog">
  <h2>Edit Task</h2>
  <label for="editTaskName">Task Name:</label><br>
  <input type="text" id="editTaskName" name="editTaskName"><br>
  <label for="editTaskDescription">Task Description:</label><br>
  <textarea id="editTaskDescription" name="editTaskDescription"></textarea><br><br>
  <button id="saveTaskButton">Save</button>
  <button id="cancelEditTaskButton">Cancel</button>
</dialog>
      <div class="taskList">
        ${tasksList}
      </div>`;
}
