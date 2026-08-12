/**
 * test_settings.js
 * 
 * End-to-end test for the Admin Settings page functionality.
 * Run with: node --env-file=.env.local test_settings.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider } = require('firebase/auth');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testSettings() {
  console.log("--- Starting Settings Page End-to-End Test ---");
  try {
    console.log("1. Logging in as Super Admin...");
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = cred.user;
    console.log("   ✅ Login successful.");

    console.log("2. Fetching Profile from Firestore...");
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) throw new Error("User document missing.");
    console.log("   ✅ Profile fetched. Role is: " + docSnap.data().role);

    console.log("3. Re-authenticating...");
    const credential = EmailAuthProvider.credential(user.email, adminPassword);
    await reauthenticateWithCredential(user, credential);
    console.log("   ✅ Re-authentication successful.");

    console.log("4. Updating Profile Data in Firestore...");
    await updateDoc(userRef, { name: "QA Admin", phone: "+92 000 0000000", bio: "Test Bio" });
    console.log("   ✅ Profile update successful.");

    console.log("--- Settings Test Passed Successfully ---");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

testSettings();
