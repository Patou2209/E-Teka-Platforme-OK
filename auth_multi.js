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
   


    // Inscription
    document.getElementById("signup-btn").addEventListener("click", () => {
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      const number = document.getElementById("signup-num").value.trim();
      const message = document.getElementById("signup-message");


      if (!email || !password || !number) {
        message.textContent = "Veuillez remplir tous les champs.";
        return;
      }
      

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
      message.textContent = "Adresse email invalide.";
      return;
    }


      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          const db = getDatabase();
          set(ref(db, 'users/' + user.uid), {
            email: email,
            number: number
          });
          message.style.color = "green";
          message.textContent = "Inscription réussie. Vous pouvez vous connecter.";
          window.location.href = "connexion.html"; // Redirection vers la page de connexion
        })
        .catch(error => {
          message.style.color = "red";
          if (error.code === 'auth/email-already-in-use') {
            message.textContent = "Cette adresse email est déjà utilisée.";
          } else {
            message.textContent = "Erreur : " + error.message;
          }
        });
    });



    