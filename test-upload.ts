import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "markaz-abdullah-bin-mubarak.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function testUpload() {
  try {
    const fileRef = ref(storage, "test/dummy.txt");
    const buffer = Buffer.from("Hello World", "utf8");
    const arrayBuffer = new Uint8Array(buffer).buffer;

    console.log("Starting upload...");
    const snapshot = await uploadBytes(fileRef, arrayBuffer);
    console.log("Upload successful!", snapshot.metadata.fullPath);
    const url = await getDownloadURL(fileRef);
    console.log("URL:", url);
  } catch (error: any) {
    console.error("Upload failed with error:", error.code, error.message);
  }
}

testUpload();
