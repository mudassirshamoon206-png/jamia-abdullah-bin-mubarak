"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "../crud.module.css";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  profilePhoto: string;
  joiningDate: string;
  employmentStatus: "Active" | "On Leave" | "Inactive" | "Former Staff";
  role: "teacher";
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: "",
    email: "",
    phone: "",
    department: "",
    profilePhoto: "",
    joiningDate: "",
    employmentStatus: "Active",
    role: "teacher"
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users"), where("role", "==", "teacher"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "users", editingId), formData);
      } else {
        await addDoc(collection(db, "users"), { ...formData, role: "teacher" });
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setFormData(teacher);
    setEditingId(teacher.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        fetchTeachers();
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      profilePhoto: "",
      joiningDate: "",
      employmentStatus: "Active",
      role: "teacher"
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active": return styles.statusActive;
      case "On Leave": return styles.statusOnLeave;
      case "Inactive": return styles.statusInactive;
      case "Former Staff": return styles.statusFormerStaff;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teachers Management</h1>
        <button onClick={openAddModal} className={styles.addButton}>Add Teacher</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher.id}>
                  <td>
                    {teacher.profilePhoto ? (
                      <img src={teacher.profilePhoto} alt={teacher.name} className={styles.photoPreview} />
                    ) : (
                      <div className={styles.photoPreview} style={{ backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td>{teacher.name}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.department}</td>
                  <td>{teacher.joiningDate}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(teacher.employmentStatus)}`}>
                      {teacher.employmentStatus}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(teacher)} className={styles.actionButton}>Edit</button>
                    <button onClick={() => handleDelete(teacher.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? "Edit Teacher" : "Add Teacher"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Profile Photo URL</label>
                <input type="url" name="profilePhoto" value={formData.profilePhoto} onChange={handleInputChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Joining Date</label>
                <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Employment Status</label>
                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Former Staff">Former Staff</option>
                </select>
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
