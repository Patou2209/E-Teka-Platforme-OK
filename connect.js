import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword
    } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

    const appSettings = {
      databaseURL: "https://e-teka-default-rtdb.asia-southeast1.firebasedatabase.app/",
      apiKey: "AIzaSyCl74rSQwA-pW5WrG_9wpEcySStyyzTQKQ",
      authDomain: "e-teka.firebaseapp.com",
      projectId: "e-teka",
      storageBucket: "e-teka.firebasestorage.app",
      messagingSenderId: "472203805953",
      appId: "1:472203805953:web:3ae1061d2f51036e184700"
    };

    const app = initializeApp(appSettings);
    const auth = getAuth(app);

    // Connexion (corrigé : bons IDs)
    document.getElementById("login-btn").addEventListener("click", () => {
      const email = document.getElementById("email").value.trim(); 
      const password = document.getElementById("password").value.trim(); 
      const message = document.getElementById("message");

      if (!email || !password) {
        message.textContent = "Veuillez remplir tous les champs.";
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          message.style.color = "green";
          message.textContent = "Connexion réussie. Redirection...";
          setTimeout(() => {
            window.location.href = "dashboard.html"; // Redirection
          }, 1500);
        })
        .catch(error => {
          message.style.color = "red";
          if (error.code === 'auth/invalid-credential') {
            message.textContent = "Email ou mot de passe incorrect.";
          }
          else if (error.code === 'auth/user-not-found') {
            message.textContent = "Aucun utilisateur trouvé avec cet email.";
          } else {
            message.textContent = "Erreur de connexion : " + error.message;
          }
        });
    });


    // Inscription
    