import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: "markaz-abdullah-bin-mubarak",
  storageBucket: "markaz-abdullah-bin-mubarak.appspot.com",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
storage.maxUploadRetryTime = 5000; // 5 seconds timeout

async function testUpload() {
  const fileRef = ref(storage, "test/dummy.txt");
  const buffer = Buffer.from("Hello World", "utf8");
  const arrayBuffer = new Uint8Array(buffer).buffer;

  console.log("Starting upload...");
  const uploadTask = uploadBytesResumable(fileRef, arrayBuffer);
  
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      console.log("Progress:", snapshot.bytesTransferred / snapshot.totalBytes);
    },
    (error) => {
      console.error("Upload failed with error:", error.code, error.message);
    },
    () => {
      console.log("Upload successful!");
    }
  );
}

testUpload();
