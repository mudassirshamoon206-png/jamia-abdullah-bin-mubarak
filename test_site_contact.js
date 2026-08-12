/**
 * test_site_contact.js
 *
 * Integration test: Admin writes contact settings → public page reads them.
 * Run with: node --env-file=.env.local test_site_contact.js
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

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

async function testContactSettings() {
  console.log("--- Starting Site Settings Integration Test ---");
  try {
    console.log("0. Authenticating...");
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    const siteRef = doc(db, "site_settings", "contact");

    console.log("1. Writing mock contact settings...");
    await setDoc(siteRef, {
      phone: "+92 300 0000000",
      whatsapp: "923000000000"
    }, { merge: true });
    console.log("   ✅ Write successful.");

    console.log("2. Reading contact settings...");
    const snap = await getDoc(siteRef);
    if (!snap.exists()) throw new Error("Document not found");
    console.log("   ✅ Read successful:", snap.data());

    console.log("--- Site Settings Test Passed Successfully ---");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

testContactSettings();
