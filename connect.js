import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword
    } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
    import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

    const firebaseConfig = {
      databaseURL: "https://platform-ecommerce-df85c-default-rtdb.asia-southeast1.firebasedatabase.app",
      apiKey: "AIzaSyCTr5mfSr6aDgC8ekkmHxCHGg8BhmnWhpA",
      authDomain: "platform-ecommerce-df85c.firebaseapp.com",
      projectId: "platform-ecommerce-df85c",
      storageBucket: "platform-ecommerce-df85c.firebasestorage.app",
      messagingSenderId: "968655514470",
      appId: "1:968655514470:web:81105c9790d5c8c68976a7"
  };

    const app = initializeApp(firebaseConfig);
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
          message.textContent = "Erreur : " + error.message;
        });
    });


    // Inscription
    