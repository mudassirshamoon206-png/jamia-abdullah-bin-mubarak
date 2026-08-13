"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "../crud.module.css";

type News = {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<News>>({
    title: "",
    content: "",
    date: "",
    author: ""
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const q = collection(db, "news");
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as News));
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "news", editingId), formData);
      } else {
        await addDoc(collection(db, "news"), formData);
      }
      setIsModalOpen(false);
      fetchNews();
    } catch (error) {
      console.error("Error saving news:", error);
    }
  };

  const handleEdit = (item: News) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this news item?")) {
      try {
        await deleteDoc(doc(db, "news", id));
        fetchNews();
      } catch (error) {
        console.error("Error deleting news:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      content: "",
      date: new Date().toISOString().split('T')[0],
      author: ""
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>News Management</h1>
        <button onClick={openAddModal} className={styles.addButton}>Add News</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.author}</td>
                  <td>{item.date}</td>
                  <td>
                    <button onClick={() => handleEdit(item)} className={styles.actionButton}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No news found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? "Edit News" : "Add News"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Author</label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Content</label>
                <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={5} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>Cancel</button>
                <button type="submit" className={styles.submitButton}>{editingId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
