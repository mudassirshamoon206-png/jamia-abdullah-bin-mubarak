"use client";

import { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Department } from "@/lib/firebase/firestore";
import styles from "../crud.module.css";
import { useTranslations } from "next-intl";

export default function DepartmentsPage() {
  const t = useTranslations("AdminDepartments");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Department>>({
    title: { en: "", ar: "", ur: "" },
    description: { en: "", ar: "", ur: "" },
    imagePath: "",
    isActive: true,
    isArchived: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "departments"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultilingualChange = (field: "title" | "description", lang: "en" | "ar" | "ur", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const storageRef = ref(storage, `departments/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, imagePath: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "departments", editingId), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "departments"), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  const handleEdit = (dept: Department) => {
    setFormData({
      title: dept.title || { en: "", ar: "", ur: "" },
      description: dept.description || { en: "", ar: "", ur: "" },
      imagePath: dept.imagePath || "",
      isActive: dept.isActive ?? true,
      isArchived: dept.isArchived ?? false,
    });
    setEditingId(dept.id!);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDoc(doc(db, "departments", id));
        fetchDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      title: { en: "", ar: "", ur: "" },
      description: { en: "", ar: "", ur: "" },
      imagePath: "",
      isActive: true,
      isArchived: false,
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "Departments Management"}</h1>
        <button onClick={openAddModal} className={styles.addButton}>{t("add") || "Add Department"}</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("image") || "Image"}</th>
                <th>{t("nameEn") || "Name (English)"}</th>
                <th>{t("nameAr") || "Name (Arabic)"}</th>
                <th>{t("nameUr") || "Name (Urdu)"}</th>
                <th>{t("status") || "Status"}</th>
                <th>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dept => (
                <tr key={dept.id}>
                  <td>
                    {dept.imagePath ? (
                      <img src={dept.imagePath} alt={dept.title?.en} className={styles.photoPreview} />
                    ) : (
                      <div className={styles.photoPreview} style={{ backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td>{dept.title?.en}</td>
                  <td>{dept.title?.ar}</td>
                  <td>{dept.title?.ur}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${dept.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {dept.isActive ? (t("isActive") || "Active") : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(dept)} className={styles.actionButton}>{t("edit") || "Edit"}</button>
                    <button onClick={() => handleDelete(dept.id!)} className={`${styles.actionButton} ${styles.deleteButton}`}>{t("delete") || "Delete"}</button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>{t("noData") || "No departments found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? (t("edit") || "Edit Department") : (t("add") || "Add Department")}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>{t("nameEn") || "Name (English)"}</label>
                <input type="text" value={formData.title?.en || ""} onChange={(e) => handleMultilingualChange("title", "en", e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("nameAr") || "Name (Arabic)"}</label>
                <input type="text" value={formData.title?.ar || ""} onChange={(e) => handleMultilingualChange("title", "ar", e.target.value)} required dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t("nameUr") || "Name (Urdu)"}</label>
                <input type="text" value={formData.title?.ur || ""} onChange={(e) => handleMultilingualChange("title", "ur", e.target.value)} required dir="rtl" />
              </div>

              <div className={styles.formGroup}>
                <label>{t("descEn") || "Description (English)"}</label>
                <input type="text" value={formData.description?.en || ""} onChange={(e) => handleMultilingualChange("description", "en", e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("descAr") || "Description (Arabic)"}</label>
                <input type="text" value={formData.description?.ar || ""} onChange={(e) => handleMultilingualChange("description", "ar", e.target.value)} required dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t("descUr") || "Description (Urdu)"}</label>
                <input type="text" value={formData.description?.ur || ""} onChange={(e) => handleMultilingualChange("description", "ur", e.target.value)} required dir="rtl" />
              </div>

              <div className={styles.formGroup}>
                <label>{t("image") || "Image"}</label>
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
                {uploading && <span>Uploading...</span>}
                {formData.imagePath && !uploading && <img src={formData.imagePath} alt="Preview" style={{ width: 100, marginTop: 10 }} />}
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} style={{ width: 'auto' }} />
                <label htmlFor="isActive" style={{ margin: 0 }}>{t("isActive") || "Active"}</label>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isArchived" checked={formData.isArchived} onChange={(e) => setFormData({...formData, isArchived: e.target.checked})} style={{ width: 'auto' }} />
                <label htmlFor="isArchived" style={{ margin: 0 }}>{t("isArchived") || "Archived"}</label>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>{t("cancel") || "Cancel"}</button>
                <button type="submit" className={styles.submitButton} disabled={uploading}>{editingId ? (t("update") || "Update") : (t("save") || "Save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
