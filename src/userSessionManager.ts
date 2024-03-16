import { User } from "./user";
import { Story, Priority, Status } from "./story";

export class UserSessionManager {
  private static readonly STORAGE_KEY = "userSessionManagerData";

  loggedInUser: User | null;
  currentProjectId: number | null;
  stories: Story[];

  constructor() {
    const data = localStorage.getItem(UserSessionManager.STORAGE_KEY);
    if (data) {
      const { loggedInUser, currentProjectId, stories } = JSON.parse(data);
      this.loggedInUser = loggedInUser;
      this.currentProjectId = currentProjectId;
      this.stories = stories;
    } else {
      this.loggedInUser = null;
      this.currentProjectId = null;
      this.stories = [];
    }
  }

  private saveToLocalStorage() {
    const data = {
      loggedInUser: this.loggedInUser,
      currentProjectId: this.currentProjectId,
      stories: this.stories,
    };
    localStorage.setItem(UserSessionManager.STORAGE_KEY, JSON.stringify(data));
  }

  login(user: User) {
    this.loggedInUser = user;
    this.saveToLocalStorage();
  }

  logout() {
    this.loggedInUser = null;
    this.currentProjectId = null;
    this.stories = [];
    this.saveToLocalStorage();
  }

  setCurrentProject(projectId: number | null) {
    this.currentProjectId = projectId;
    this.saveToLocalStorage();
  }

  createStory(name: string, description: string, priority: Priority) {
    if (this.currentProjectId && this.loggedInUser) {
      const storyId = this.stories.length + 1;
      const newStory = new Story(
        storyId,
        name,
        description,
        priority,
        this.currentProjectId,
        new Date(),
        Status.Todo,
        this.loggedInUser.id
      );
      this.stories.push(newStory);
      this.saveToLocalStorage();
      return newStory;
    }
    return null;
  }

  readStories(): Story[] {
    if (this.currentProjectId) {
      return this.stories.filter(
        (story) => story.project === this.currentProjectId
      );
    }
    return [];
  }

  updateStory(storyId: number, newData: Partial<Story>) {
    const storyIndex = this.stories.findIndex((story) => story.id === storyId);
    if (storyIndex !== -1) {
      this.stories[storyIndex] = { ...this.stories[storyIndex], ...newData };
      this.saveToLocalStorage();
    }
  }

  deleteStory(storyId: number) {
    this.stories = this.stories.filter((story) => story.id !== storyId);
    this.saveToLocalStorage();
  }
}
