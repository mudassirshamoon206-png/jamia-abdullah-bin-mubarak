"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import styles from "../crud.module.css";

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  imagePath: string;
  createdAt: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<{ title: string; image: File | null }>({
    title: "",
    image: null
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
      setItems(data);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.title) return;

    try {
      setUploading(true);
      
      // Upload image to Storage
      const imagePath = `gallery/${Date.now()}_${formData.image.name}`;
      const imageRef = ref(storage, imagePath);
      await uploadBytes(imageRef, formData.image);
      const imageUrl = await getDownloadURL(imageRef);

      // Save to Firestore
      await addDoc(collection(db, "gallery"), {
        title: formData.title,
        imageUrl,
        imagePath,
        createdAt: new Date().toISOString()
      });

      setIsModalOpen(false);
      fetchGallery();
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "gallery", item.id));
        
        // Delete from Storage if we stored imagePath
        if (item.imagePath) {
          const imageRef = ref(storage, item.imagePath);
          try {
            await deleteObject(imageRef);
          } catch (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }
        }

        fetchGallery();
      } catch (error) {
        console.error("Error deleting gallery item:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      image: null
    });
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gallery Management</h1>
        <button onClick={openAddModal} className={styles.addButton}>Add Image</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Date Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <img src={item.imageUrl} alt={item.title} className={styles.photoPreview} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td>{item.title}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleDelete(item)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No gallery items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Add New Image</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Image File</label>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton} disabled={uploading}>Cancel</button>
                <button type="submit" className={styles.submitButton} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
