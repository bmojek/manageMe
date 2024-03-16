type Project = {
  id: number;
  name: string;
  desc: string;
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
