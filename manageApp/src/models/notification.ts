export type ISOString = string;

export type Notification = {
  title: string;
  message: string;
  date: ISOString;
  priority: "low" | "medium" | "high";
  read: boolean;
};
