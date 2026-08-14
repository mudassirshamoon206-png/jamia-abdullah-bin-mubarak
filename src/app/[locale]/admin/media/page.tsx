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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, arrayBuffer, { contentType: file.type });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(prog);
        },
        (error) => {
          console.error("Upload failed", error);
          alert("Upload failed: " + error.message);
          setUploading(false);
          setProgress(0);
        },
        () => {
          setUploading(false);
          setProgress(0);
          alert("File uploaded successfully!");
          fetchMedia(); // Refresh list
        }
      );
    } catch (err: any) {
      console.error("Error during upload preparation", err);
      alert("Error preparing upload: " + err.message);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (path: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      try {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
        alert("File deleted successfully!");
        fetchMedia();
      } catch (error: any) {
        console.error("Delete failed", error);
        alert("Delete failed: " + error.message);
      }
    }
  };

  // Helper to determine if media is a video
  const isVideo = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    return ext === 'mp4' || ext === 'mov' || ext === 'webm';
  };

  return (
    <div className={styles.mediaContainer}>
      <div className={styles.header}>
        <h2>Media Library</h2>
        <div className={styles.uploadSection}>
          <label className={styles.uploadBtn}>
            Upload File
            <input 
              type="file" 
              hidden 
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" 
              onChange={handleUpload} 
            />
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
              {isVideo(item.name) ? (
                <video src={item.url} className={styles.mediaImage} controls preload="metadata" />
              ) : (
                <img src={item.url} alt={item.name} className={styles.mediaImage} />
              )}
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
