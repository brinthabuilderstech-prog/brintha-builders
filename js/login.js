// ==========================================
// Brintha Builders - Admin Login
// js/login.js
// ==========================================

import { auth, signInWithEmailAndPassword, onAuthStateChanged } from "../firebase/firebase.js";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

// Show/hide password
if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.innerHTML = isHidden
      ? '<i class="fas fa-eye-slash"></i>'
      : '<i class="fas fa-eye"></i>';
  });
}

// If already logged in, skip straight to the dashboard
onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.includes("login.html")) {
    window.location.href = "dashboard.html";
  }
});

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const submitBtn = loginForm.querySelector("button[type='submit']");

    loginMessage.textContent = "";
    loginMessage.className = "mt-3 text-center";
    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginMessage.classList.add("text-success");
      loginMessage.textContent = "Login successful. Redirecting...";
      window.location.href = "dashboard.html";
    } catch (error) {
      loginMessage.classList.add("text-danger");
      loginMessage.textContent = friendlyAuthError(error.code);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

function friendlyAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return "Login failed. Please try again.";
  }
}
