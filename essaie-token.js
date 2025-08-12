// ===================== Imports Firebase =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase, ref, push, onValue, remove, update
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// ===================== Firebase Config =====================
const appSettings = {
  databaseURL: "https://e-teka-default-rtdb.asia-southeast1.firebasedatabase.app/",
  apiKey: "AIzaSyCl74rSQwA-pW5WrG_9wpEcySStyyzTQKQ",
  authDomain: "e-teka.firebaseapp.com",
  projectId: "e-teka",
  storageBucket: "e-teka.appspot.com",
  messagingSenderId: "472203805953",
  appId: "1:472203805953:web:3ae1061d2f51036e184700"
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const storage = getStorage(app);
const adsRef = ref(database, "ads");
const auth = getAuth(app);

// ===================== Auth =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "connexion.html";
  } else {
    document.getElementById("user-name").textContent = user.email;
    displayAds();
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  signOut(auth);
});

// ===================== Add Ad =====================
document.getElementById("ad-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = document.getElementById("ad-category").value.trim();
  const title = document.getElementById("ad-title").value.trim();
  const price = document.getElementById("ad-price").value.trim();

  if (!category || !title || !price) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  try {
    const user = auth.currentUser;
    const adKey = push(adsRef).key;

    // Crée un élément DOM temporaire pour le PDF
    const tempDiv = document.createElement("div");
    tempDiv.style.width = "400px";
    tempDiv.style.padding = "10px";
    tempDiv.style.border = "1px solid #ccc";
    tempDiv.innerHTML = `
      <h2>${title}</h2>
      <p>Catégorie: ${category}</p>
      <p>Prix: ${price}€</p>
    `;
    document.body.appendChild(tempDiv);

    // Génération du PDF AVANT enregistrement
    const canvas = await html2canvas(tempDiv);
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
    const pdfBlob = pdf.output("blob");

    // Téléchargement automatique du PDF sur PC
    const pdfFileName = `${title.replace(/\s+/g, "_")}.pdf`;
    const pdfURLLocal = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = pdfURLLocal;
    a.download = pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Upload vers Firebase Storage
    const pdfRef = storageRef(storage, `ads/${adKey}/ad.pdf`);
    await uploadBytes(pdfRef, pdfBlob);
    const pdfURL = await getDownloadURL(pdfRef);

    document.body.removeChild(tempDiv);

    // Enregistrement dans la base AVEC pdfURL dès le départ
    const adData = {
      category,
      title,
      price,
      userEmail: user.email,
      pdfURL
    };
    await update(ref(database, `ads/${adKey}`), adData);

    alert("Annonce ajoutée avec PDF !");
  } catch (err) {
    console.error("Erreur ajout annonce:", err);
    alert("Erreur lors de l'ajout de l'annonce.");
  }
});

// ===================== Display Ads =====================
function displayAds() {
  const adsContainer = document.getElementById("product1");
  adsContainer.innerHTML = "";

  onValue(adsRef, (snapshot) => {
    adsContainer.innerHTML = "";
    snapshot.forEach(childSnap => {
      const ad = childSnap.val();
      const adId = childSnap.key;

      if (ad.userEmail === auth.currentUser.email) {
        const adBox = document.createElement("div");
        adBox.classList.add("pro");
        adBox.id = `ad-${adId}`;

        adBox.innerHTML = `
          <div class="des">
            <span>${ad.category}</span>
            <h5>${ad.title}</h5>
            <h4>${ad.price}€</h4>
          </div>
          <div class="actions">
            <button class="normal" id="green" onclick="editAd('${adId}')">Modifier</button>
            <button class="normal" id="red" onclick="deleteAd('${adId}')">Supprimer</button>
            ${ad.pdfURL ? `<a href="${ad.pdfURL}" target="_blank" class="normal" id="blue">📄 Télécharger</a>` : ""}
          </div>
        `;

        adsContainer.appendChild(adBox);
      }
    });
  });
}

// ===================== Delete Ad =====================
window.deleteAd = async function (adId) {
  if (confirm("Supprimer cette annonce ?")) {
    await remove(ref(database, `ads/${adId}`));
  }
};

// Placeholder for editAd (if needed)
window.editAd = function (adId) {
  alert("Fonction d'édition à implémenter pour l'annonce: " + adId);
};
