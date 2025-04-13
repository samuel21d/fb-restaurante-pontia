import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordModal = document.getElementById('forgot-password-modal');
const closeModal = document.querySelector('.close-modal');
const recoveryForm = document.getElementById('forgot-password-form');
const recoveryMessage = document.getElementById('recovery-message');

// Manejar el inicio de sesión
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    alert('Inicio de sesión exitoso');
    window.location.href = 'admin.html'; // Redirigir al panel de administración
  } catch (error) {
    errorMessage.textContent = error.message; // Mostrar el mensaje de error
    errorMessage.style.display = 'block';
  }
});

// Abrir modal de recuperación de contraseña
forgotPasswordLink.addEventListener('click', (e) => {
  e.preventDefault();
  forgotPasswordModal.style.display = 'flex';
});

// Cerrar modal de recuperación de contraseña
closeModal.addEventListener('click', () => {
  forgotPasswordModal.style.display = 'none';
});

// Enviar correo de recuperación de contraseña
recoveryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('recovery-email').value;

  try {
    await sendPasswordResetEmail(auth, email);
    recoveryMessage.textContent = 'Se ha enviado un enlace de recuperación a tu correo.';
    recoveryMessage.style.display = 'block';
  } catch (error) {
    recoveryMessage.textContent = error.message;
    recoveryMessage.style.display = 'block';
  }
});