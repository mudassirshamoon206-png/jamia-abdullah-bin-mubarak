/**
 * create_admin.js
 * 
 * One-time setup script to create the Super Admin account in Firebase.
 * Run with: node --env-file=.env.local create_admin.js
 * 
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD to be set in .env.local
 * DO NOT hardcode credentials in this file.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function createAdmin() {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('✅ User created:', userCred.user.uid);
    await setDoc(doc(db, 'users', userCred.user.uid), {
      email: adminEmail,
      role: 'super_admin',
      createdAt: new Date()
    });
    console.log('✅ Super Admin role assigned in Firestore.');
    process.exit(0);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists. Updating role to super_admin...');
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: adminEmail,
          role: 'super_admin',
          createdAt: new Date()
        }, { merge: true });
        console.log('✅ Role updated to super_admin.');
        process.exit(0);
      } catch (signInErr) {
        console.error('❌ Failed to sign in to existing account:', signInErr);
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to create account:', e);
      process.exit(1);
    }
  }
}

createAdmin();
