import { Project } from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story, Priority, Status } from "../models/story";
import { addStory, deleteStory, updateStory } from "../services/projectManager";
import { refreshProjects } from "../main";
import { renderStories } from "./storyView";

let userId = 0;

export function renderProjects(
  project: Project | undefined,
  userManager: UserSessionManager
): string {
  if (userManager.loggedInUser) userId = userManager.loggedInUser?.id;

  if (!project) {
    return "";
  }

  document.addEventListener("click", handleClick2);

  function handleClick2(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("addStoryBtn")) {
      if (project?.id) {
        const newStoryName = prompt("Enter the name of the new story:");
        const newStoryDescription = prompt(
          "Enter the description of the new story:"
        );
        let maxID = -1;

        project.stories?.map((story) =>
          story.id ? (story.id > maxID ? (maxID = story.id) : "") : ""
        );

        if (newStoryName && newStoryDescription) {
          const newStory: Story = {
            id: maxID + 1,
            name: newStoryName,
            description: newStoryDescription,
            priority: Priority.Low,
            project: project.id,
            creationDate: new Date(),
            status: Status.Doing,
            owner: userId,
          };

          if (newStory && project.id) {
            addStory(project.id, newStory);
          }
          document.removeEventListener("click", handleClick2);
          refreshProjects();
        }
      }
    } else if (target.classList.contains("editStoryBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );
      if (!isNaN(storyId)) {
        const updatedStoryName = prompt("Enter the new name for the story:");
        const updatedStoryDescription = prompt(
          "Enter the new description for the story:"
        );

        if (updatedStoryName && updatedStoryDescription && project?.id) {
          const updatedStory: Partial<Story> = {
            name: updatedStoryName,
            description: updatedStoryDescription,
            id: storyId,
          };

          updateStory(project.id, updatedStory);
        }
        document.removeEventListener("click", handleClick2);
        refreshProjects();
      }
    } else if (target.classList.contains("deleteStoryBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );
      if (!isNaN(storyId)) {
        const confirmDelete = confirm(
          "Are you sure you want to delete this story?"
        );
        if (confirmDelete && project?.id) {
          deleteStory(project.id, storyId);
        }
        document.removeEventListener("click", handleClick2);
        refreshProjects();
      }
    } else if (target.classList.contains("selectBtn")) {
      const storyId = parseInt(
        target.closest(".storyItem")?.getAttribute("data-id") || ""
      );

      if (!isNaN(storyId)) {
        userManager.setCurrentStory(storyId);
      }
      document.removeEventListener("click", handleClick2);
      refreshProjects();
    } else if (target.classList.contains("exitStory")) {
      document.removeEventListener("click", handleClick2);
      userManager.setCurrentStory(null);
    }
  }

  const renderStoryItem = (story: Story): string => `
    <tr class="storyItem" data-id="${story.id}">
      <td class="border px-4 py-2">${story.name}</td>
      <td class="border px-4 py-2">${story.description}</td>
      <td class="border px-4 py-2">${story.owner}</td>
      <td class="border px-4 py-2">${story.priority}</td>
      <td class="border px-4 py-2">${story.status}</td>
      <td class="border px-4 py-2">${story.creationDate}</td>
      <td class="border px-4 py-2">
        <button class="editStoryBtn bg-yellow-500 text-white py-1 px-2 rounded mr-2">Edytuj</button>
        <button class="deleteStoryBtn bg-red-500 text-white py-1 px-2 rounded mr-2">Usuń</button>
        <button class="selectBtn bg-green-500 text-white py-1 px-2 rounded">Wybierz</button>
      </td>
    </tr>
  `;
  const storyItems = project.stories
    ?.map((story) => renderStoryItem(story))
    .join("");

  return `${
    userManager.currentStoryId == null
      ? `<div class="projectDetails p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
  <div class="projectInfo" data-id="${project.id}">   
    <button class="exitProject px-10 text-lg font-bold mb-2">←</button>    
    <h2 class="text-2xl font-bold mb-4">Nazwa: ${project.name}</h2>
    <p class="mb-4">Opis: ${project.desc}</p>
    <button class="addStoryBtn bg-blue-500 text-white py-2 px-4 rounded mb-4">Dodaj story</button>
  </div>
  <table class="storyTable min-w-full bg-white dark:bg-gray-700">
    <thead class="bg-gray-200 dark:bg-gray-600">
      <tr>
        <th class="border px-4 py-2">Nazwa</th>
        <th class="border px-4 py-2">Opis</th>
        <th class="border px-4 py-2">Właściciel</th>
        <th class="border px-4 py-2">Priorytet</th>
        <th class="border px-4 py-2">Status</th>
        <th class="border px-4 py-2">Data utworzenia</th>
        <th class="border px-4 py-2">Akcje</th>
      </tr>
    </thead>
    <tbody>
      ${storyItems}
    </tbody>
  </table>
</div>`
      : renderStories(project, userManager)
  }
  `;
}
