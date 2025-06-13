import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, update, get, child } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";


const appSettings = {
  databaseURL: "https://platform-ecommerce-df85c-default-rtdb.asia-southeast1.firebasedatabase.app",
  apiKey: "AIzaSyCTr5mfSr6aDgC8ekkmHxCHGg8BhmnWhpA",
  authDomain: "platform-ecommerce-df85c.firebaseapp.com",
  projectId: "platform-ecommerce-df85c",
  storageBucket: "platform-ecommerce-df85c.firebasestorage.app",
  messagingSenderId: "968655514470",
  appId: "1:968655514470:web:81105c9790d5c8c68976a7"
};



const app = initializeApp(appSettings);
const database = getDatabase(app);
const adsRef = ref(database, "ads");
const auth = getAuth(app);

let editingAdId = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("user-name").textContent = user.email;

  document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "index.html";
    });
  });

  const adForm = document.getElementById("ad-form");

  adForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("ad-title").value;
    const category = document.getElementById("ad-category").value;
    const price = document.getElementById("ad-price").value;
    const imageInput = document.getElementById("ad-image").files[0];

    const userId = auth.currentUser.uid;
    const dbRef = ref(getDatabase());
    const userSnap = await get(child(dbRef, `users/${userId}`));
    let number = "";
    if (userSnap.exists()) {
      number = userSnap.val().number || "";
    }

    const saveAd = async (imageData) => {
      const ad = {
        category,
        title,
        price,
        image: imageData || null,
        userEmail: user.email,
        createdAt: Date.now(),
        number
      };

      // Validate form fields
      if (!title || !category || !price || !imageData) {
        alert("Please fill in all fields.");
        return;
      } // Validate price
      if (isNaN(price) || price <= 0) {
        alert("Please enter a valid price.");
        return;
      }

      if (editingAdId) {
        await update(ref(database, `ads/${editingAdId}`), ad);
        editingAdId = null;
      } else {
        await push(adsRef, ad);
      }

      adForm.reset();
      displayAds();
    };

    if (imageInput) {
      const reader = new FileReader();
      reader.onload = () => saveAd(reader.result);
      reader.readAsDataURL(imageInput);
    } else {
      saveAd();
    }
  });

  function displayAds() {
    const adsContainer = document.getElementById("product1");
    adsContainer.innerHTML = "";

    onValue(adsRef, (snapshot) => {
      adsContainer.innerHTML = "";
      snapshot.forEach(childSnap => {
        const ad = childSnap.val();
        const adId = childSnap.key;
        if (ad.userEmail === user.email) {
          const adBox = document.createElement("div");
          adBox.classList.add("pro");
          adBox.innerHTML = `
            <img src="${ad.image || ''}" alt="${ad.title}" loading="lazy">
            <div class="des">
              <span>${ad.category}</span>
              <h5>${ad.title}</h5>
              <div class="star">
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i><i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
              </div>
              <h4>${ad.price}€</h4>
              <p>Numéro: ${ad.number ? `<a href="tel:${ad.number}">${ad.number}</a>` : "Non renseigné"}</p>
            </div>
            <button class="normal" id="green" onclick="editAd('${adId}')">Modifier</button>
            <button class="normal" id="red" onclick="deleteAd('${adId}')">Supprimer</button>
          `;
          adsContainer.appendChild(adBox);
        }
      });
    });
  }

  window.deleteAd = async function(adId) {
    await remove(ref(database, `ads/${adId}`));
  };

  window.editAd = async function(adId) {
    const adSnap = await get(child(ref(database), `ads/${adId}`));
    if (adSnap.exists()) {
      const ad = adSnap.val();
      document.getElementById("ad-category").value = ad.category;
      document.getElementById("ad-title").value = ad.title;
      document.getElementById("ad-price").value = ad.price;
      editingAdId = adId;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  displayAds();
});