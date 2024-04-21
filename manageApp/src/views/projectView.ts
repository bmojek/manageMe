import { getProjectById } from "../services/projectManager";
import { UserSessionManager } from "../services/userSessionManager";
import { Story } from "../models/story";
import { Priority, Status } from "../models/story";
import { addStory, deleteStory, updateStory } from "../services/projectManager";
import { refreshProjects } from "../main";
import { renderStories } from "./storyView";

let userId = 0;
export function renderProjects(
  projectId: number,
  userManager: UserSessionManager
): string {
  if (userManager.loggedInUser) userId = userManager.loggedInUser?.id;

  const project = getProjectById(projectId);
  if (!project) {
    return "";
  }

  document.addEventListener("click", handleClick2);

  function handleClick2(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains("addStoryBtn")) {
      const projectId = parseInt(
        target.closest(".projectInfo")?.getAttribute("data-id") || ""
      );
      if (!isNaN(projectId)) {
        const newStoryName = prompt("Enter the name of the new story:");
        const newStoryDescription = prompt(
          "Enter the description of the new story:"
        );

        const maxID =
          getProjectById(projectId)?.stories?.reduce((max, story) => {
            return story.id > max ? story.id : max;
          }, -1) ?? -1;

        if (newStoryName && newStoryDescription) {
          const newStory: Story = {
            id: maxID + 1,
            name: newStoryName,
            description: newStoryDescription,
            priority: Priority.Low,
            project: projectId,
            creationDate: new Date(),
            status: Status.Doing,
            owner: userId,
          };

          if (newStory) {
            addStory(projectId, newStory);
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

        if (updatedStoryName && updatedStoryDescription) {
          const updatedStory: Partial<Story> = {
            name: updatedStoryName,
            description: updatedStoryDescription,
            id: storyId,
          };

          updateStory(projectId, updatedStory);
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
        if (confirmDelete) {
          deleteStory(projectId, storyId);
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
      <td>${story.name}</td>
      <td>${story.description}</td>
      <td>${story.owner}</td>
      <td>${story.priority}</td>
      <td>${story.status}</td>
      <td>${story.creationDate}</td>
      <td>
        <button class="editStoryBtn">Edytuj</button>
        <button class="deleteStoryBtn">Usuń</button>
        <button class="selectBtn">Wybierz</button>

      </td>
    </tr>
  `;
  const storyItems = project.stories
    ?.map((story) => renderStoryItem(story))
    .join("");

  return `${
    userManager.currentStoryId == null
      ? `<div class="projectDetails">
  <div class="projectInfo" data-id="${projectId}">   
    <button class="exitProject backBtn">←</button>    
    <h2>Nazwa: ${project.name}</h2>
    <p>Opis: ${project.desc}</p>
    <button class="addStoryBtn">Dodaj story</button>
  </div>
  <table class="storyTable">
    <thead>
      <tr>
        <th>Nazwa</th>
        <th>Opis</th>
        <th>Właściciel</th>
        <th>Priorytet</th>
        <th>Status</th>
        <th>Data utworzenia</th>
        <th>Akcje</th>
      </tr>
    </thead>
    <tbody>
      ${storyItems}
    </tbody>
  </table>
</div>`
      : renderStories(projectId, userManager)
  }
  `;
}
