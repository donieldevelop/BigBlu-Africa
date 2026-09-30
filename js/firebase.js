// Configuration Firebase partagée (ces clés sont publiques par nature ; la sécurité est assurée par les règles Firestore).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyC4diWmtqDYU1p0NPEJhQPufe2io-M_NgM",
  authDomain: "bigbluafrica.firebaseapp.com",
  projectId: "bigbluafrica",
  storageBucket: "bigbluafrica.firebasestorage.app",
  messagingSenderId: "19405508702",
  appId: "1:19405508702:web:c71e076be88df48adfe4cf"
};
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
