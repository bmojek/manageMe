import { UserSessionManager } from "../services/userSessionManager";
import { UserRole } from "../models/user";
import {
  collection,
  addDoc,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "../firebase";

export function loginView(userManager: UserSessionManager): string {
  async function handleLogin() {
    const loginInput = document.getElementById(
      "loginInput"
    ) as HTMLInputElement | null;
    const passwordInput = document.getElementById(
      "passwordInput"
    ) as HTMLInputElement | null;

    if (!loginInput || !passwordInput) {
      console.error("Login or password input element not found");
      return;
    }

    const login = loginInput.value;
    const password = passwordInput.value;

    const db = getFirestore(app);
    const usersCollectionRef = collection(db, "users");

    const q = query(
      usersCollectionRef,
      where("login", "==", login),
      where("password", "==", password)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
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

          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          userManager.logout();
          userManager.login({
            id: userDoc.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role as UserRole,
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

  async function handleRegister() {
    const loginElement = document.getElementById("login") as HTMLInputElement;
    const passwordElement = document.getElementById(
      "password"
    ) as HTMLInputElement;
    const firstNameElement = document.getElementById(
      "firstName"
    ) as HTMLInputElement;
    const lastNameElement = document.getElementById(
      "lastName"
    ) as HTMLInputElement;
    const roleElement = document.getElementById("role") as HTMLSelectElement;

    if (
      !loginElement &&
      !passwordElement &&
      !firstNameElement &&
      !lastNameElement &&
      !roleElement
    ) {
      alert("Uzupełni wszystkie pola");
      return;
    }

    const login = loginElement.value;
    const password = passwordElement.value;
    const firstName = firstNameElement.value;
    const lastName = lastNameElement.value;
    const role = roleElement.value;

    const db = getFirestore(app);
    try {
      const usersCollectionRef = collection(db, "users");
      await addDoc(usersCollectionRef, {
        login: login,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: role,
      });
      const registerDialog = document.getElementById(
        "registerDialog"
      ) as HTMLDialogElement | null;
      if (registerDialog) {
        registerDialog.close();
      }
    } catch (error) {
      console.error("Error creating project and saving to Firebase:", error);
    }
  }

  window.addEventListener("mouseup", () => {
    const btn = document.getElementById("loginBtn");
    btn?.addEventListener("click", handleLogin);
    const inputPass = document.getElementById("passwordInput");
    inputPass?.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        btn?.click();
      }
    });
    const btnR = document.getElementById("registerBtn");
    btnR?.addEventListener("click", () => {
      const registerDialog = document.getElementById(
        "registerDialog"
      ) as HTMLDialogElement | null;
      registerDialog?.showModal();
    });
    const saveBtn = document.getElementById("saveRegisterButton");
    saveBtn?.addEventListener("click", handleRegister);
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", () => {
      userManager.logout();
      location.reload();
    });
  });

  return `
    <div class="loginContainer text-right">${
      userManager.loggedInUser == undefined
        ? `<input class="pl-3" type="text" id="loginInput" placeholder="Login">
    <input class="pl-3" type="password" id="passwordInput" placeholder="Hasło">
    <button class="bg-green-300 text-black font-bold" id="loginBtn">Zaloguj</button>
    <button class="bg-green-500 text-black font-bold" id="registerBtn">Rejestracja</button>`
        : `
        
        <p class="inline-block">Witaj ${userManager.loggedInUser.firstName}!</p>
        <button class="bg-red-500 text-black font-bold" id="logoutBtn">Wyloguj</button>`
    }
    </div>
    <dialog id="registerDialog" class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
        <h2 class="text-xl font-bold mb-4">Rejestracja</h2>
        <label for="login" class="block mb-2">Login:</label>
        <input type="text" id="login" name="login" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="password" class="block mb-2">Hasło:</label>
        <input type="password" id="password" name="password" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="firstName" class="block mb-2">Imię:</label>
        <input type="text" id="firstName" name="firstName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="lastName" class="block mb-2">Nazwisko:</label>
        <input type="text" id="lastName" name="lastName" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
        <label for="role" class="block mb-2">Rola:</label>
        <select id="role" name="role" class="w-full p-2 mb-4 border rounded-lg dark:bg-gray-800">
          <option value="${UserRole.ADMIN}">Admin</option>
          <option value="${UserRole.DEVELOPER}">Developer</option>
          <option value="${UserRole.DEVOPS}">DevOps</option>
        </select>
        <div class="flex justify-end space-x-2">
          <button id="saveRegisterButton" class="bg-green-500 text-white py-2 px-4 rounded">Rejestruj</button>
          <button id="cancelRegisterButton" class="bg-gray-500 text-white py-2 px-4 rounded" onclick="document.getElementById('registerDialog')?.close()">Cancel</button>
        </div>
      </dialog>
  `;
}
