import {
  getProjectById,
  getStoryById,
  createProject,
  deleteProject,
  updateProject,
  addStory,
  deleteStory,
  updateStory,
  addTask,
  updateTask,
  deleteTask,
} from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { refreshProjects } from "../main";
import { Priority, Status, Story } from "../models/story";
import { Task } from "../models/task";

export async function handleClick(
  event: MouseEvent,
  userManager: UserSessionManager
) {
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

    await refreshProjects({
      title: "Projekt stworzony!",
      message: `Nowy projekt ${newName} został dodany`,
      date: new Date().toISOString(),
      priority: "medium",
      read: false,
    });
  }

  if ((event.target as HTMLElement).classList.contains("delBtn")) {
    const projectId = (event.target as HTMLElement).getAttribute("data-id");
    if (!projectId) return;

    const confirmDelete = confirm("Napewno chcesz usunąć ten projekt?");
    if (confirmDelete) {
      await deleteProject(projectId);
    }
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
    await refreshProjects();
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
  if ((event.target as HTMLElement).classList.contains("exitStory")) {
    userManager.setCurrentStory(null);
  }
  if ((event.target as HTMLElement).classList.contains("selectBtn")) {
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".storyItem")
        ?.getAttribute("data-id") || ""
    );
    if (!isNaN(storyId)) {
      userManager.setCurrentStory(storyId);
    }
    refreshProjects();
  }
  if ((event.target as HTMLElement).classList.contains("deleteStoryBtn")) {
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectDetails")
        ?.querySelector(".projectInfo")
        ?.getAttribute("data-id") || "";
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".storyItem")
        ?.getAttribute("data-id") || ""
    );
    if (!isNaN(storyId)) {
      const confirmDelete = confirm("Napewno chcesz usunąć to story?");
      if (confirmDelete && projectId) {
        deleteStory(projectId, storyId);
      }
      refreshProjects();
    }
  }
  if ((event.target as HTMLElement).classList.contains("editStoryBtn")) {
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".storyItem")
        ?.getAttribute("data-id") || ""
    );
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectDetails")
        ?.querySelector(".projectInfo")
        ?.getAttribute("data-id") || "";
    const editDialog = document.getElementById(
      "editStoryDialog"
    ) as HTMLDialogElement;
    if (storyId != undefined && projectId != undefined) {
      const storyToEdit = await getStoryById(projectId, storyId);
      if (!isNaN(storyId) && storyToEdit != null) {
        const editStoryNameInput = document.getElementById(
          "editStoryName"
        ) as HTMLInputElement;
        const editStoryDescriptionInput = document.getElementById(
          "editStoryDescription"
        ) as HTMLTextAreaElement;
        const editStoryPrioritySelect = document.getElementById(
          "editStoryPriority"
        ) as HTMLSelectElement;
        const editStoryStatusSelect = document.getElementById(
          "editStoryStatus"
        ) as HTMLSelectElement;
        editStoryNameInput.value = storyToEdit.name;
        editStoryDescriptionInput.value = storyToEdit.description;
        editStoryPrioritySelect.value = storyToEdit.priority;
        editStoryStatusSelect.value = storyToEdit.status;
        editDialog?.showModal();
        const saveButton = document.getElementById(
          "saveStoryButton"
        ) as HTMLButtonElement;
        const saveListener = () => {
          const updatedStoryName = editStoryNameInput.value;
          const updatedStoryDescription = editStoryDescriptionInput.value;
          const updatedStoryPriority =
            editStoryPrioritySelect.value as Priority;
          const updatedStoryStatus = editStoryStatusSelect.value as Status;
          if (
            updatedStoryName &&
            updatedStoryDescription &&
            storyId != undefined &&
            userManager.loggedInUser &&
            projectId
          ) {
            const updatedStory: Partial<Story> = {
              id: storyId,
              name: updatedStoryName,
              description: updatedStoryDescription,
              priority: updatedStoryPriority,
              status: updatedStoryStatus,
            };
            updateStory(projectId, updatedStory);
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
  }
  if ((event.target as HTMLElement).classList.contains("addStoryBtn")) {
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectDetails")
        ?.querySelector(".projectInfo")
        ?.getAttribute("data-id") || "";
    const project = await getProjectById(projectId);
    if (projectId && project != undefined) {
      const newStoryName = prompt("Enter the name of the new story:");
      const newStoryDescription = prompt(
        "Enter the description of the new story:"
      );

      let maxID = -1;
      project.stories?.forEach((story) => {
        if (story.id != undefined && story.id > maxID) {
          maxID = story.id;
        }
      });
      if (newStoryName && newStoryDescription && userManager.loggedInUser) {
        const newStory: Story = {
          id: maxID + 1,
          name: newStoryName,
          description: newStoryDescription,
          priority: Priority.LOW,
          project: projectId,
          creationDate: Date.now(),
          status: Status.TODO,
          owner: userManager.loggedInUser,
        };
        if (newStory && projectId) {
          addStory(projectId, newStory);
        }
        refreshProjects({
          title: "Nowe Story!",
          message: `Story ${newStoryName} zostało dodane`,
          date: new Date().toISOString(),
          priority: "low",
          read: false,
        });
      }
    }
  }
  if ((event.target as HTMLElement).classList.contains("addTask")) {
    const projectId =
      (event.target as HTMLElement)
        .closest(".taskContainer")
        ?.getAttribute("data-project") || "";
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".taskContainer")
        ?.getAttribute("data-story") || ""
    );

    const story = await getStoryById(projectId, storyId);
    const newTaskName = prompt("Enter the name of the new task:");
    const newTaskDescription = prompt("Enter the description of the new task:");
    let maxTaskID = -1;
    story?.tasks?.forEach((task) => {
      if (task.id != undefined && task.id > maxTaskID) {
        maxTaskID = task.id;
      }
    });

    if (newTaskName && newTaskDescription && story?.id != null && projectId) {
      const newTask: Task = {
        id: maxTaskID + 1,
        name: newTaskName,
        description: newTaskDescription,
        priority: Priority.LOW,
        story: story.id,
        status: Status.TODO,
        addedDate: Date.now(),
      };

      addTask(projectId, story.id, newTask);

      refreshProjects({
        title: "Nowe Zadanie!",
        message: `Zadanie ${newTaskName} zostało dodane`,
        date: new Date().toISOString(),
        priority: "low",
        read: false,
      });
    }
  }
  if ((event.target as HTMLElement).classList.contains("deleteTask")) {
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-project") || "";
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-story") || ""
    );

    const story = await getStoryById(projectId, storyId);
    const project = await getProjectById(projectId);

    const taskId = parseInt(
      (event.target as HTMLElement).getAttribute("data-task-id") || ""
    );

    if (
      !isNaN(taskId) &&
      story?.id != null &&
      project != undefined &&
      project.id != undefined
    ) {
      const confirmDelete = confirm("Napewno chcesz usunąć to zadanie?");
      if (confirmDelete) {
        deleteTask(project.id, story?.id, taskId);
      }
      refreshProjects();
    }
  }
  if ((event.target as HTMLElement).classList.contains("endTask")) {
    const taskId = parseInt(
      (event.target as HTMLElement).getAttribute("data-task-id") || ""
    );
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-project") || "";
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-story") || ""
    );

    const story = await getStoryById(projectId, storyId);
    const project = await getProjectById(projectId);
    if (
      !isNaN(taskId) &&
      story?.id != null &&
      story.tasks != null &&
      project != undefined &&
      project.id != undefined
    ) {
      const taskToEnd = story.tasks.find((task) => task.id === taskId);
      if (taskToEnd) {
        let updatedTask: Partial<Task>;
        if (taskToEnd.status === Status.DONE) {
          updatedTask = {
            id: taskId,
            status: Status.DOING,
            endDate: 0,
          };
        } else {
          updatedTask = {
            id: taskId,
            status: Status.DONE,
            endDate: Date.now(),
          };
        }

        updateTask(project.id, story.id, updatedTask);
        refreshProjects();
      }
    }
  }
  if ((event.target as HTMLElement).classList.contains("exitStoryIn")) {
    userManager.setCurrentStory(null);
    refreshProjects();
  }
  if ((event.target as HTMLElement).classList.contains("editTask")) {
    const projectId =
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-project") || "";
    const storyId = parseInt(
      (event.target as HTMLElement)
        .closest(".projectContainer")
        ?.querySelector(".taskContainer")
        ?.getAttribute("data-story") || ""
    );

    const story = await getStoryById(projectId, storyId);

    const taskId = parseInt(
      (event.target as HTMLElement).getAttribute("data-task-id") || ""
    );
    const editDialog = document.getElementById(
      "editTaskDialog"
    ) as HTMLDialogElement;
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
        const editTaskEstimatedTimeInput = document.getElementById(
          "editTaskEstimatedTime"
        ) as HTMLInputElement;

        editTaskNameInput.value = taskToEdit.name;
        editTaskDescriptionInput.value = taskToEdit.description;
        editTaskPrioritySelect.value = taskToEdit.priority;
        editTaskEstimatedTimeInput.value =
          taskToEdit.estimatedTime?.toString() || "";

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
          const updatedTaskPriority = editTaskPrioritySelect.value as Priority;
          const updatedTaskUserAssigned = editTaskUserAssignedInput.value;
          const updatedTaskEstimatedTime =
            new Date(editTaskEstimatedTimeInput.value) > new Date(Date.now())
              ? editTaskEstimatedTimeInput.value
              : undefined;
          let updatedTaskStatus = Status.TODO;

          if (updatedTaskUserAssigned != undefined)
            updatedTaskStatus = Status.DOING;

          if (
            updatedTaskName &&
            updatedTaskDescription &&
            story != undefined &&
            projectId &&
            story.id != undefined
          ) {
            const updatedTask: Partial<Task> = {
              id: taskId,
              name: updatedTaskName,
              description: updatedTaskDescription,
              startWorkDate: updatedTaskUserAssigned ? Date.now() : undefined,
              priority: updatedTaskPriority,
              status: updatedTaskStatus,
              userAssigned: JSON.parse(updatedTaskUserAssigned),
              estimatedTime: updatedTaskEstimatedTime,
            };
            updateTask(projectId, story.id, updatedTask);
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
  }
}
