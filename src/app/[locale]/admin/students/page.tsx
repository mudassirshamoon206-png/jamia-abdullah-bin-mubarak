"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, query, orderBy, where, deleteDoc, updateDoc, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, Course, Department } from "@/lib/firebase/firestore";
import styles from "../crud.module.css";
import { useTranslations } from "next-intl";

export default function StudentsPage() {
  const t = useTranslations("AdminStudents");
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "student",
    enrolledCourseIds: [],
    departmentIds: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Courses and Departments for mapping
      const deptSnapshot = await getDocs(query(collection(db, "departments")));
      const deptData = deptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(deptData);

      const courseSnapshot = await getDocs(query(collection(db, "courses")));
      const courseData = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseData);

      // Fetch Students
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      
      // Sort in memory if needed, or rely on fetching order
      data.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      });

      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseNames = (courseIds?: string[]) => {
    if (!courseIds || courseIds.length === 0) return "-";
    return courseIds.map(id => courses.find(c => c.id === id)?.title?.en || "Unknown").join(", ");
  };

  const getDepartmentNames = (deptIds?: string[]) => {
    if (!deptIds || deptIds.length === 0) return "-";
    return deptIds.map(id => departments.find(d => d.id === id)?.title?.en || "Unknown").join(", ");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchData();
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      enrolledCourseIds: [],
      departmentIds: [],
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (student: User) => {
    setFormData({
      name: student.name || "",
      email: student.email || "",
      role: student.role || "student",
      enrolledCourseIds: student.enrolledCourseIds || [],
      departmentIds: student.departmentIds || [],
    });
    setEditingId(student.id!);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", editingId), {
          ...formData,
        });
      } else {
        await addDoc(collection(db, "users"), {
          ...formData,
          createdAt: Timestamp.now(),
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const toggleSelection = (id: string, list: string[]) => {
    if (list.includes(id)) {
      return list.filter(item => item !== id);
    }
    return [...list, id];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "Students Management"}</h1>
        <button onClick={openAddModal} className={styles.addButton}>{t("add") || "Add Student"}</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("name") || "Name"}</th>
                <th>{t("email") || "Email"}</th>
                <th>{t("courses") || "Enrolled Courses"}</th>
                <th>{t("departments") || "Departments"}</th>
                <th>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{getCourseNames(student.enrolledCourseIds)}</td>
                  <td>{getDepartmentNames(student.departmentIds)}</td>
                  <td>
                    <button onClick={() => handleEdit(student)} className={styles.actionButton}>{t("edit") || "Edit"}</button>
                    <button onClick={() => handleDelete(student.id!)} className={`${styles.actionButton} ${styles.deleteButton}`}>{t("delete") || "Delete"}</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>{t("noData") || "No students found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? (t("edit") || "Edit Student") : (t("add") || "Add Student")}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className={styles.formGroup}>
                <label>{t("name") || "Name"}</label>
                <input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t("email") || "Email"}</label>
                <input type="email" value={formData.email || ""} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className={styles.formGroup}>
                <label>{t("courses") || "Courses"}</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  {courses.map(course => (
                    <div key={course.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <input 
                        type="checkbox" 
                        id={`course-${course.id}`} 
                        checked={(formData.enrolledCourseIds || []).includes(course.id!)}
                        onChange={() => setFormData({...formData, enrolledCourseIds: toggleSelection(course.id!, formData.enrolledCourseIds || [])})}
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor={`course-${course.id}`} style={{ margin: 0, fontWeight: 'normal' }}>{course.title.en}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("departments") || "Departments"}</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  {departments.map(dept => (
                    <div key={dept.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <input 
                        type="checkbox" 
                        id={`dept-${dept.id}`} 
                        checked={(formData.departmentIds || []).includes(dept.id!)}
                        onChange={() => setFormData({...formData, departmentIds: toggleSelection(dept.id!, formData.departmentIds || [])})}
                        style={{ marginRight: '8px' }}
                      />
                      <label htmlFor={`dept-${dept.id}`} style={{ margin: 0, fontWeight: 'normal' }}>{dept.title.en}</label>
                    </div>
                  ))}
                </div>
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
