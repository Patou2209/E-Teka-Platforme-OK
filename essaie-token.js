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

  const category = document.getElementById("ad-category").value;
  const title = document.getElementById("ad-title").value;
  const price = document.getElementById("ad-price").value;

  if (!category || !title || !price) {
    alert("Veuillez remplir tous les champs !");
    return;
  }

  const user = auth.currentUser;
  const adKey = push(adsRef).key;

  // Sauvegarde des données de l'annonce
  const adData = {
    category,
    title,
    price,
    userEmail: user.email
  };
  await update(ref(database, `ads/${adKey}`), adData);
  document.getElementById("ad-form").reset();

  // Création d’un élément temporaire pour le rendu PDF
  const tempDiv = document.createElement("div");
  tempDiv.classList.add("pdf-container");
  tempDiv.innerHTML = `
    <h2>${title}</h2>
    <p>Catégorie: ${category}</p>
    <p>Prix: ${price}€</p>
  `;
  document.body.appendChild(tempDiv);

  // Sauvegarde de la largeur originale
  const originalWidth = tempDiv.style.width;


  try {
    // Fixe largeur A4 pour capture
    tempDiv.style.width = "794px";
    tempDiv.style.padding = "20px "

    const canvas = await html2canvas(tempDiv, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    const pdfBlob = pdf.output("blob");

    // Téléchargement automatique local
    const localURL = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = localURL;
    downloadLink.download = `${title}.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Upload vers Firebase Storage
    const pdfRef = storageRef(storage, `ads/${adKey}/ad.pdf`);
    await uploadBytes(pdfRef, pdfBlob);
    const pdfURL = await getDownloadURL(pdfRef);

    // Mise à jour dans la base avec l'URL du PDF
    await update(ref(database, `ads/${adKey}`), { pdfURL });

    // Affiche immédiatement dans la liste
    addAdToDOM({ ...adData, pdfURL }, adKey);

  } catch (e) {
    console.error("Erreur génération PDF:", e);
  }

  // Rétablir largeur originale et nettoyer
  tempDiv.style.width = originalWidth || "100%";
  document.body.removeChild(tempDiv);

  alert("Annonce ajoutée avec PDF !");
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
        addAdToDOM(ad, adId);
      }
    });
  });
}

// Fonction utilitaire pour ajouter une annonce dans le DOM
function addAdToDOM(ad, adId) {
  const adsContainer = document.getElementById("product1");

  const adBox = document.createElement("div");
  adBox.classList.add("pro");

  adBox.innerHTML = `
    <div class="des">
      <span>${ad.category}</span>
      <h5>${ad.title}</h5>
      <h4>${ad.price}€</h4>
      ${ad.pdfURL ? `<p><a href="${ad.pdfURL}" target="_blank" class="normal" id="blue">📄 Télécharger PDF</a></p>` : ""}
    </div>
    <button class="normal" id="green" onclick="editAd('${adId}')">Modifier</button>
    <button class="normal" id="red" onclick="deleteAd('${adId}')">Supprimer</button>
  `;

  adsContainer.appendChild(adBox);
}

// ===================== Delete Ad =====================
window.deleteAd = async function (adId) {
  if (confirm("Supprimer cette annonce ?")) {
    await remove(ref(database, `ads/${adId}`));
  }
};
