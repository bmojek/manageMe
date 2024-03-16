import { User } from "./user";
import { Story, Priority, Status } from "./story";

export class UserSessionManager {
  loggedInUser: User | null;
  currentProjectId: number | null;
  stories: Story[];

  constructor() {
    this.loggedInUser = null;
    this.currentProjectId = null;
    this.stories = [];
  }

  login(user: User) {
    this.loggedInUser = user;
  }

  logout() {
    this.loggedInUser = null;
    this.currentProjectId = null;
    this.stories = [];
  }

  setCurrentProject(projectId: number) {
    this.currentProjectId = projectId;
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
    }
  }

  deleteStory(storyId: number) {
    this.stories = this.stories.filter((story) => story.id !== storyId);
  }
}
