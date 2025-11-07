// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, doc, setDoc } 
  from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-SacqvtaogmRFH9Q1_d5JPzyk5NZhuPM",
  authDomain: "harmas-wear.firebaseapp.com",
  projectId: "harmas-wear",
  storageBucket: "harmas-wear.firebasestorage.app",
  messagingSenderId: "289926384971",
  appId: "1:289926384971:web:b18969e0bee6d669292cce",
  measurementId: "G-71D82GJRDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🌀 Toggle Login/Signup
document.getElementById("to-signup").onclick = () => {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
};

document.getElementById("to-login").onclick = () => {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
};

// 🧾 Sign up
document.getElementById("signupBtn").onclick = async () => {
  const name = document.getElementById("signupName").value;
  const phone = document.getElementById("signupPhone").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const city = document.getElementById("signupCity").value;
  const address = document.getElementById("signupAddress").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name, phone, email, city, address
    });

    alert("Signup successful ✅");
    localStorage.setItem("user", JSON.stringify({ name, phone, email, city, address }));
    window.location.href = "../main/index.html";
  } catch (error) {
    alert(error.message);
  }
};

// 🔐 Login
document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful 🎉");
    window.location.href = "../main/index.html";
  } catch (error) {
    alert("Login failed ❌ " + error.message);
  }
};
