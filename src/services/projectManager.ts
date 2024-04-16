import { Story } from "../models/story";

export type Project = {
  id: number;
  name: string;
  desc: string;
  stories?: Story[];
};

export let Projects: Project[] = [];

const storedData = localStorage.getItem("projectData");
if (storedData) {
  Projects = JSON.parse(storedData);
} else {
  localStorage.setItem("projectData", JSON.stringify(Projects));
}

export function saveProjectsToLocalStorage() {
  localStorage.setItem("projectData", JSON.stringify(Projects));
}

export function createProject(project: Project) {
  Projects.push(project);
  saveProjectsToLocalStorage();
}

export function getProjectById(id: number): Project | undefined {
  return Projects.find((project) => project.id === id);
}

export function getAllProjects(): Project[] {
  return Projects;
}

export function updateProject(id: number, newData: Partial<Project>) {
  const index = Projects.findIndex((project) => project.id === id);
  if (index !== -1) {
    Projects[index] = { ...Projects[index], ...newData };
    saveProjectsToLocalStorage();
  }
}

export function deleteProject(id: number) {
  const index = Projects.findIndex((project) => project.id === id);
  if (index !== -1) {
    Projects.splice(index, 1);
    saveProjectsToLocalStorage();
  }
}

export function updateStory(
  projectId: number,
  updatedStory: Partial<Story>
): void {
  const project = getProjectById(projectId);
  if (project && project.stories) {
    const index = project.stories.findIndex(
      (story) => story.id === updatedStory.id
    );
    if (index !== -1) {
      project.stories[index] = { ...project.stories[index], ...updatedStory };
      saveProjectsToLocalStorage();
    } else {
      console.error("Story not found in project");
    }
  } else {
    console.error("Project or stories not found");
  }
}
export function deleteStory(projectId: number, storyId: number): void {
  const project = getProjectById(projectId);
  if (project && project.stories) {
    const index = project.stories.findIndex((story) => story.id === storyId);
    if (index !== -1) {
      project.stories.splice(index, 1);
      saveProjectsToLocalStorage();
    } else {
      console.error("Story not found in project");
    }
  } else {
    console.error("Project not found or no stories in project");
  }
}

export function addStory(projectId: number, story: Story): void {
  const projectIndex = Projects.findIndex(
    (project) => project.id === projectId
  );
  if (projectIndex !== -1) {
    if (!Projects[projectIndex].stories) {
      Projects[projectIndex].stories = [];
    }
    Projects[projectIndex].stories?.push(story);
    saveProjectsToLocalStorage();
  } else {
    console.error("Project not found");
  }
}
