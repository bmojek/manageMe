import "./style.css";
import { getAllProjects } from "./services/projectManager.ts";
import { ProjectView } from "./views/ProjectView.ts";
import { UserSessionManager } from "./services/userSessionManager.ts";
import { NotificationService } from "./services/notificationService.ts";
import { Notification } from "./models/notification.ts";
import { ensureValidToken } from "./services/jwt.ts";

const userManager = new UserSessionManager();
const notify = new NotificationService();

export async function refreshProjects(notification?: Notification) {
  const allProjects = await getAllProjects();

  const Projects = allProjects.filter((project) => {
    const isOwner = project.ownerId === userManager.loggedInUser?.id;
    const isAssignedToTask = project.stories?.some((story) =>
      story.tasks?.some(
        (task) =>
          task.userAssigned?.firstName ===
            userManager.loggedInUser?.firstName &&
          task.userAssigned?.lastName === userManager.loggedInUser?.lastName
      )
    );
    return isOwner || isAssignedToTask;
  });

  ProjectView(Projects, userManager, notify);
  if (notification) notify.send(notification);
  if (userManager.loggedInUser) {
    if ((await ensureValidToken()) == 0) {
      userManager.logout();
      refreshProjects({
        title: "Sesja wygasła!",
        message: `Twoja sesja wygasła zaloguj się ponownie`,
        date: new Date().toISOString(),
        priority: "high",
        read: false,
      });
    }
  }
}

refreshProjects();
