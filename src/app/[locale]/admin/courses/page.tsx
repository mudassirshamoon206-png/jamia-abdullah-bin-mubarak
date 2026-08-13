"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Course, Department } from "@/lib/firebase/firestore";
import styles from "../crud.module.css";
import { useTranslations } from "next-intl";

export default function CoursesPage() {
  const t = useTranslations("AdminCourses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Course>>({
    departmentId: "",
    title: { en: "", ar: "", ur: "" },
    description: { en: "", ar: "", ur: "" },
    duration: { en: "", ar: "", ur: "" },
    eligibility: { en: "", ar: "", ur: "" },
    admissionStatus: "open",
    assignedTeacherIds: [],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Departments
      const deptSnapshot = await getDocs(collection(db, "departments"));
      const deptData = deptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(deptData);

      // Fetch Courses
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMultilingualChange = (field: "title" | "description" | "duration" | "eligibility", lang: "en" | "ar" | "ur", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "courses", editingId), {
          ...formData,
          updatedAt: Timestamp.now(),
        });
      } else {
        await addDoc(collection(db, "courses"), {
          ...formData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleEdit = (course: Course) => {
    setFormData({
      departmentId: course.departmentId || "",
      title: course.title || { en: "", ar: "", ur: "" },
      description: course.description || { en: "", ar: "", ur: "" },
      duration: course.duration || { en: "", ar: "", ur: "" },
      eligibility: course.eligibility || { en: "", ar: "", ur: "" },
      admissionStatus: course.admissionStatus || "open",
      assignedTeacherIds: course.assignedTeacherIds || [],
      isActive: course.isActive ?? true,
    });
    setEditingId(course.id!);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteDoc(doc(db, "courses", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      departmentId: departments.length > 0 ? departments[0].id : "",
      title: { en: "", ar: "", ur: "" },
      description: { en: "", ar: "", ur: "" },
      duration: { en: "", ar: "", ur: "" },
      eligibility: { en: "", ar: "", ur: "" },
      admissionStatus: "open",
      assignedTeacherIds: [],
      isActive: true,
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const getDepartmentName = (id: string) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.title.en : "Unknown";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "Courses Management"}</h1>
        <button onClick={openAddModal} className={styles.addButton}>{t("add") || "Add Course"}</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("titleEn") || "Title"}</th>
                <th>{t("department") || "Department"}</th>
                <th>{t("durationEn") || "Duration"}</th>
                <th>{t("admissionStatus") || "Admission"}</th>
                <th>{t("status") || "Status"}</th>
                <th>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.title?.en}</td>
                  <td>{getDepartmentName(course.departmentId)}</td>
                  <td>{course.duration?.en}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${course.admissionStatus === 'open' ? styles.statusActive : styles.statusInactive}`}>
                      {course.admissionStatus === 'open' ? (t("open") || "Open") : (t("closed") || "Closed")}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${course.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {course.isActive ? (t("isActive") || "Active") : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(course)} className={styles.actionButton}>{t("edit") || "Edit"}</button>
                    <button onClick={() => handleDelete(course.id!)} className={`${styles.actionButton} ${styles.deleteButton}`}>{t("delete") || "Delete"}</button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>{t("noData") || "No courses found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? (t("edit") || "Edit Course") : (t("add") || "Add Course")}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className={styles.formGroup}>
                <label>{t("department") || "Department"}</label>
                <select value={formData.departmentId} onChange={(e) => setFormData({...formData, departmentId: e.target.value})} required>
                  <option value="" disabled>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.title.en}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>{t("titleEn") || "Title (English)"}</label>
                <input type="text" value={formData.title?.en || ""} onChange={(e) => handleMultilingualChange("title", "en", e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("titleAr") || "Title (Arabic)"}</label>
                <input type="text" value={formData.title?.ar || ""} onChange={(e) => handleMultilingualChange("title", "ar", e.target.value)} required dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t("titleUr") || "Title (Urdu)"}</label>
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
                <label>{t("durationEn") || "Duration (English)"}</label>
                <input type="text" value={formData.duration?.en || ""} onChange={(e) => handleMultilingualChange("duration", "en", e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("durationAr") || "Duration (Arabic)"}</label>
                <input type="text" value={formData.duration?.ar || ""} onChange={(e) => handleMultilingualChange("duration", "ar", e.target.value)} required dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t("durationUr") || "Duration (Urdu)"}</label>
                <input type="text" value={formData.duration?.ur || ""} onChange={(e) => handleMultilingualChange("duration", "ur", e.target.value)} required dir="rtl" />
              </div>

              <div className={styles.formGroup}>
                <label>{t("eligibilityEn") || "Eligibility (English)"}</label>
                <input type="text" value={formData.eligibility?.en || ""} onChange={(e) => handleMultilingualChange("eligibility", "en", e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("eligibilityAr") || "Eligibility (Arabic)"}</label>
                <input type="text" value={formData.eligibility?.ar || ""} onChange={(e) => handleMultilingualChange("eligibility", "ar", e.target.value)} required dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t("eligibilityUr") || "Eligibility (Urdu)"}</label>
                <input type="text" value={formData.eligibility?.ur || ""} onChange={(e) => handleMultilingualChange("eligibility", "ur", e.target.value)} required dir="rtl" />
              </div>

              <div className={styles.formGroup}>
                <label>{t("admissionStatus") || "Admission Status"}</label>
                <select value={formData.admissionStatus} onChange={(e) => setFormData({...formData, admissionStatus: e.target.value as "open" | "closed"})} required>
                  <option value="open">{t("open") || "Open"}</option>
                  <option value="closed">{t("closed") || "Closed"}</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} style={{ width: 'auto' }} />
                <label htmlFor="isActive" style={{ margin: 0 }}>{t("isActive") || "Active"}</label>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>{t("cancel") || "Cancel"}</button>
                <button type="submit" className={styles.submitButton}>{editingId ? (t("update") || "Update") : (t("save") || "Save")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
