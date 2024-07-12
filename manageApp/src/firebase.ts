import { initializeApp } from "firebase/app";
const pass = "passapikey";
let firebaseConfig = {};
try {
  const response = await fetch("http://localhost:3000/apikey", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pass }),
  });

  const data = await response.json();

  if (response.ok) {
    firebaseConfig = {
      apiKey: data.apiKey,
      authDomain: data.authDomain,
      projectId: data.projectId,
      storageBucket: data.storageBucket,
      messagingSenderId: data.messagingSenderId,
      appId: data.appId,
    };
  } else {
    console.error(data.error);
  }
} catch (error) {
  console.error("Error:", error);
}

export const app = initializeApp(firebaseConfig);
