import { Task } from "./task";

export enum Priority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

export enum Status {
  Todo = "Todo",
  Doing = "Doing",
  Done = "Done",
}

export class Story {
  id: number;
  name: string;
  description: string;
  priority: Priority;
  project: number;
  creationDate: Date;
  status: Status;
  owner: number;
  task?: Task[];

  constructor(
    id: number,
    name: string,
    description: string,
    priority: Priority,
    project: number,
    creationDate: Date,
    status: Status,
    owner: number
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.project = project;
    this.creationDate = creationDate;
    this.status = status;
    this.owner = owner;
  }
}
