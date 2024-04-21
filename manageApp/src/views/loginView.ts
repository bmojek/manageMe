import fetch from "node-fetch";

export function loginView(): string {
  return `
    <div class="loginContainer">
      <input type="text" id="loginInput" placeholder="Login">
      <input type="password" id="passwordInput" placeholder="Hasło">
      <button onclick="handleLoginForm()">Zaloguj</button>
    </div>
  `;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
}

async function apiLogin(
  login: string,
  password: string
): Promise<AuthResponse | null> {
  try {
    const response = await fetch("http://localhost:3000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    if (response.ok) {
      const data = (await response.json()) as AuthResponse;
      return data;
    } else {
      console.error("Błąd logowania:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas logowania:", error);
    return null;
  }
}

async function handleLoginForm() {
  const loginInput = document.getElementById("loginInput") as HTMLInputElement;
  const passwordInput = document.getElementById(
    "passwordInput"
  ) as HTMLInputElement;

  const login = loginInput.value;
  const password = passwordInput.value;

  const authResult = { token: "123", refreshToken: "321" }; //await apiLogin(login, password);

  if (authResult) {
    console.log("Zalogowano pomyślnie!");
    console.log("Token:", authResult.token);
    console.log("Refresh Token:", authResult.refreshToken);
    // Tutaj możesz przekierować użytkownika lub wykonać inne czynności po zalogowaniu
  } else {
    console.log("Nie udało się zalogować. Sprawdź dane logowania.");
    // Tutaj możesz wyświetlić komunikat o błędzie lub podjąć inne działania w przypadku nieudanego logowania
  }
}
