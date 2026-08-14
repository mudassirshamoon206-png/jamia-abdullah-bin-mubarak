import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/config";

/**
 * Robust utility to upload media to Firebase Storage.
 * Handles timeouts, ArrayBuffer conversion (to avoid Next.js fetch bugs), and explicit error handling.
 */
export async function uploadMediaFile(
  file: File,
  folder: "media" | "gallery" | "departments",
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert to ArrayBuffer to bypass Next.js client-side fetch hanging bug
      const arrayBuffer = await file.arrayBuffer();
      
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = `${folder}/${fileName}`;
      const storageRef = ref(storage, filePath);
      
      const uploadTask = uploadBytesResumable(storageRef, arrayBuffer, {
        contentType: file.type,
      });

      uploadTask.on(
        "state_changed",
        (snapshot: any) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error: any) => {
          console.error("Firebase Storage Upload Error:", error);
          if (error.code === 'storage/unknown' || error.code === 'storage/object-not-found') {
            reject(new Error("Storage bucket not found. Please enable Firebase Storage in your Firebase Console."));
          } else {
            reject(new Error(`Upload failed: ${error.message}`));
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err) {
            reject(err);
          }
        }
      );
    } catch (err: any) {
      reject(err);
    }
  });
}
