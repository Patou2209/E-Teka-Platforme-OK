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



    