export const apiUrl = "http://localhost:3000";

export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, exp: 60 }),
    });

    if (!response.ok) {
      throw new Error("Failed to login");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    console.log("Login successful:", data);
  } catch (error) {
    console.error("Error during login:", error);
  }
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.log("No refresh token available");
    return 0;
  }

  try {
    const response = await fetch(`${apiUrl}/refreshToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.status === 400) {
      console.log("Bad refresh token");
      return 0;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);

    console.log("Token refreshed");
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
}
export async function ensureValidToken() {
  let token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    if ((await refreshToken()) == 0) return 0;
    token = localStorage.getItem("token");
  }

  return token;
}
export function isTokenExpired(token: string): boolean {
  const payload = JSON.parse(atob(token.split(".")[1]));
  return Date.now() >= payload.exp * 1000;
}
