"use client";

import { useState, useEffect } from "react";
import { ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { uploadMediaFile } from "@/lib/uploadMedia";
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
    setProgress(0);
    try {
      await uploadMediaFile(
        file,
        "media",
        (prog) => setProgress(prog)
      );
      alert("File uploaded successfully!");
      fetchMedia();
    } catch (err: any) {
      console.error("Upload failed", err);
      alert(err.message || "Error uploading file");
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = ""; // Reset input
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
