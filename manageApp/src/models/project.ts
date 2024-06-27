import { Story } from "./story";

export type Project = {
  id?: string;
  name: string;
  desc: string;
  ownerId: string;
  stories?: Story[];
};
