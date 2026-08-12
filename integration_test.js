/**
 * integration_test.js
 *
 * Automated integration test script for Jamia Abdullah Bin Mubarak portal.
 * Run with: node --env-file=.env.local integration_test.js
 *
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD to be set in .env.local
 * DO NOT hardcode credentials in this file.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } = require('firebase/firestore');

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

async function runTests() {
  console.log("--- Starting Automated QA Testing ---");
  try {
    // 1. Test Authentication
    console.log("1. Testing Firebase Authentication...");
    const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("   ✅ Login successful for Super Admin: " + cred.user.uid);

    // 2. Test Admin CRUD (Create, Read, Update, Delete Department)
    console.log("2. Testing Admin Dashboard CRUD Operations...");
    const deptRef = await addDoc(collection(db, "departments"), {
      title: { en: "Test Dept", ur: "Test", ar: "Test" },
      description: { en: "QA Test", ur: "QA", ar: "QA" },
      isActive: true,
      isArchived: false,
      createdAt: new Date()
    });
    console.log("   ✅ Create successful. Document ID: " + deptRef.id);

    const snapshot = await getDocs(collection(db, "departments"));
    if (snapshot.empty) throw new Error("Could not read departments");
    console.log("   ✅ Read successful. Found " + snapshot.size + " departments.");

    await updateDoc(doc(db, "departments", deptRef.id), { isActive: false });
    console.log("   ✅ Update successful.");

    await deleteDoc(doc(db, "departments", deptRef.id));
    console.log("   ✅ Delete successful.");

    // 3. Test Public Data Fetching
    console.log("3. Testing Public Pages Data Connections...");
    await getDocs(collection(db, "news"));
    console.log("   ✅ Public News query successful.");

    await getDocs(collection(db, "events"));
    console.log("   ✅ Public Events query successful.");

    // 4. Test Public Contact Form Submission
    console.log("4. Testing Contact Form Submission...");
    const msgRef = await addDoc(collection(db, "messages"), {
      name: "QA Bot",
      email: "qa@bot.com",
      message: "This is an automated integration test.",
      createdAt: new Date()
    });
    console.log("   ✅ Contact form submission saved. Message ID: " + msgRef.id);
    await deleteDoc(doc(db, "messages", msgRef.id));

    console.log("--- All Automated QA Tests Passed Successfully! ---");
    process.exit(0);

  } catch (error) {
    console.error("❌ Test Failed:", error);
    process.exit(1);
  }
}

runTests();
