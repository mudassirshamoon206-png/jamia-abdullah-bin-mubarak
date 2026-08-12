"use client";

import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import styles from "./page.module.css";

interface MediaItem {
  name: string;
  url: string;
  path: string;
}

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const listRef = ref(storage, "media/");
      const res = await listAll(listRef);
      const items = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            url,
            path: itemRef.fullPath
          };
        })
      );
      setMediaList(items);
    } catch (error) {
      console.error("Error fetching media:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed", error);
        setUploading(false);
      },
      () => {
        setUploading(false);
        setProgress(0);
        fetchMedia(); // Refresh list
      }
    );
  };

  const handleDelete = async (path: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
        fetchMedia();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <div className={styles.mediaContainer}>
      <div className={styles.header}>
        <h2>Media Library</h2>
        <div className={styles.uploadSection}>
          <label className={styles.uploadBtn}>
            Upload Image
            <input type="file" hidden accept="image/*" onChange={handleUpload} />
          </label>
          {uploading && <span className={styles.progressText}>Uploading... {Math.round(progress)}%</span>}
        </div>
      </div>

      {loading ? (
        <p>Loading media...</p>
      ) : (
        <div className={styles.mediaGrid}>
          {mediaList.map((item) => (
            <div key={item.path} className={styles.mediaCard}>
              <img src={item.url} alt={item.name} className={styles.mediaImage} />
              <div className={styles.mediaActions}>
                <span className={styles.mediaName} title={item.name}>{item.name}</span>
                <button className={styles.deleteBtn} onClick={() => handleDelete(item.path)}>Delete</button>
              </div>
            </div>
          ))}
          {mediaList.length === 0 && <p>No media found.</p>}
        </div>
      )}
    </div>
  );
}
