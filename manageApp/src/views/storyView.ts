import { Project } from "../models/project";
import { UserSessionManager } from "../services/userSessionManager";
import { Story, Priority, Status } from "../models/story";
import { TaskView } from "./taskView";

export function StoryView(
  project: Project | undefined,
  userManager: UserSessionManager
): string {
  if (!project) {
    return "";
  }

  const renderStoryItem = (story: Story): string => `
    <tr class="storyItem" data-id="${story.id}">
      <td class="border px-4 py-2">${story.name}</td>
      <td class="border px-4 py-2">${story.description}</td>
      <td class="border px-4 py-2">${story.owner.lastName}</td>
      <td class="border px-4 py-2">${story.priority}</td>
      <td class="border px-4 py-2">${story.status}</td>
      <td class="border px-4 py-2">${new Date(
        story.creationDate
      ).toLocaleString()}</td>
      <td class="border px-4 py-2">
        <button class="editStoryBtn bg-yellow-500 text-white py-1 px-2 rounded mr-2">Edytuj</button>
        <button class="deleteStoryBtn bg-red-500 text-white py-1 px-2 rounded mr-2">Usuń</button>
        <button class="selectBtn bg-green-500 text-white py-1 px-2 rounded">Wybierz</button>
      </td>
    </tr>
  `;
  const filterStories = project.stories?.filter((story) => story);

  const storyItems = filterStories
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
  <dialog id="editStoryDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md w-1/2">
        <h2 class="text-xl font-bold mb-4">Edytuj Story</h2>
        <label for="editStoryName" class="block mb-2">Nazwa:</label>
        <input type="text" id="editStoryName" name="editStoryName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="editStoryDescription" class="block mb-2">Opis:</label>
        <textarea id="editStoryDescription" name="editStoryDescription" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800"></textarea>
        <label for="editStoryPriority" class="block mb-2">Priorytet:</label>
        <select id="editStoryPriority" name="editStoryPriority" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${Priority.LOW}">Low</option>
          <option value="${Priority.MEDIUM}">Medium</option>
          <option value="${Priority.HIGH}">High</option>
        </select>
        <label for="editStoryStatus" class="block mb-2">Status:</label>
        <select id="editStoryStatus" name="editStoryStatus" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${Status.TODO}">To Do</option>
          <option value="${Status.DOING}">In Progress</option>
          <option value="${Status.DONE}">Done</option>
        </select>
        
        <div class="flex justify-end space-x-2">
          <button id="saveStoryButton" class="bg-green-500 text-white py-2 px-4 rounded">Edytuj</button>
          <button id="cancelEditStoryButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('editStoryDialog').close()">Anuluj</button>
        </div>
      </dialog>
  <table class="storyTable  w-full bg-white dark:bg-gray-700">
    <thead class="bg-gray-200 dark:bg-gray-600">
      <tr>
        <th class="border  py-2">Nazwa</th>
        <th class="border  py-2">Opis</th>
        <th class="border  py-2">Właściciel</th>
        <th class="border  py-2">Priorytet</th>
        <th class="border  py-2">Status</th>
        <th class="border  py-2">Data utworzenia</th>
        <th class="border  py-2">Akcje</th>
      </tr>
    </thead>
    <tbody>
      ${storyItems}
    </tbody>
  </table>
  
</div>`
      : TaskView(project, userManager)
  }
  `;
}
