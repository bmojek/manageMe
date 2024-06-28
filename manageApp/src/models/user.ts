export class User {
  id: string;
  login?: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;

  constructor(
    id: string,
    login: string,
    password: string,
    firstName: string,
    lastName: string,
    role: UserRole
  ) {
    this.id = id;
    this.login = login;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
  }
}

export enum UserRole {
  ADMIN = "admin",
  DEVOPS = "devops",
  DEVELOPER = "developer",
}
