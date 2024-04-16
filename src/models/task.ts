import { User } from "./user";

export enum Priority {
  LOW = "niski",
  MEDIUM = "średni",
  HIGH = "wysoki",
}

export enum Status {
  TODO = "todo",
  DOING = "doing",
  DONE = "done",
}

export class Task {
  id: number;
  name: string;
  description: string;
  priority: Priority;
  storyId: number;
  story: string;
  estimatedTime: number;
  status: Status;
  startDate?: Date;
  endDate?: Date;
  addedDate: Date;
  startWorkDate?: Date;
  userAssigned?: User;

  constructor(
    id: number,
    name: string,
    description: string,
    priority: Priority,
    storyId: number,
    story: string,
    estimatedTime: number,
    status: Status,
    addedDate: Date,
    startWorkDate?: Date,
    endDate?: Date,
    userAssigned?: User
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.priority = priority;
    this.storyId = storyId;
    this.story = story;
    this.estimatedTime = estimatedTime;
    this.status = status;
    this.addedDate = addedDate;
    this.startWorkDate = startWorkDate;
    this.endDate = endDate;
    this.userAssigned = userAssigned;
  }
}
