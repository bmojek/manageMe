import { User } from "../models/user";

export class UserSessionManager {
  private static readonly STORAGE_KEY = "userSessionManagerData";

  loggedInUser: User | null;
  currentProjectId: number | null;

  constructor() {
    const data = localStorage.getItem(UserSessionManager.STORAGE_KEY);
    if (data) {
      const { loggedInUser, currentProjectId } = JSON.parse(data);
      this.loggedInUser = loggedInUser;
      this.currentProjectId = currentProjectId;
    } else {
      this.loggedInUser = null;
      this.currentProjectId = null;
    }
  }

  private saveToLocalStorage() {
    const data = {
      loggedInUser: this.loggedInUser,
      currentProjectId: this.currentProjectId,
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
    this.saveToLocalStorage();
  }

  setCurrentProject(projectId: number | null) {
    this.currentProjectId = projectId;
    this.saveToLocalStorage();
  }
}
