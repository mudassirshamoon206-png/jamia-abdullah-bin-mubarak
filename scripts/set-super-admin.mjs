/**
 * scripts/set-super-admin.mjs
 *
 * One-time setup: creates a super_admin user in Firebase.
 * Run with: node --env-file=.env.local scripts/set-super-admin.mjs
 *
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in .env.local
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function setupSuperAdmin() {
  try {
    console.log(`Creating super admin user: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Setting role in Firestore...");
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "super_admin",
      createdAt: new Date(),
    });

    console.log("✅ Super Admin account created successfully!");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️  Super Admin user already exists.");
    } else {
      console.error("❌ Error creating super admin:", error);
    }
  }
}

setupSuperAdmin();
