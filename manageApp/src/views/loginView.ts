import { loginCredentials } from "../services/loginDetails";
import { UserSessionManager } from "../services/userSessionManager";
import { UserRole } from "../models/user";

export function loginView(userManager: UserSessionManager): string {
  async function handleLogin() {
    const loginInput = document.getElementById(
      "loginInput"
    ) as HTMLInputElement;
    const passwordInput = document.getElementById(
      "passwordInput"
    ) as HTMLInputElement;

    const login = loginInput.value;
    const password = passwordInput.value;

    const user = loginCredentials.users.find(
      (user) => user.username === login && user.password === password
    );

    if (user) {
      try {
        const response = await fetch("http://localhost:3000/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ login, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          userManager.login({
            id: 0,
            firstName: user.username,
            lastName: user.password,
            role: UserRole.ADMIN,
          });
          location.reload();
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      alert("nie ma takiego użytkownika");
    }
    loginInput.value = "";
    passwordInput.value = "";
  }
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("loginBtn");
    btn?.addEventListener("click", handleLogin);
  });
  return `
    <div class="loginContainer">
      <input type="text" id="loginInput" placeholder="Login">
      <input type="password" id="passwordInput" placeholder="Hasło">
      <button id="loginBtn">Zaloguj</button>
    </div>
  `;
}
