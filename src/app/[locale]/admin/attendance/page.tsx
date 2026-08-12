"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "../crud.module.css";

type Attendance = {
  id: string;
  date: string;
  userName: string;
  userRole: "Teacher" | "Staff" | "Student";
  status: "Present" | "Absent" | "Leave" | "Late";
  remarks: string;
};

export default function AttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Attendance>>({
    date: new Date().toISOString().split('T')[0],
    userName: "",
    userRole: "Teacher",
    status: "Present",
    remarks: ""
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "attendance"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance));
      setAttendanceRecords(data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "attendance", editingId), formData);
      } else {
        await addDoc(collection(db, "attendance"), formData);
      }
      setIsModalOpen(false);
      fetchAttendance();
    } catch (error) {
      console.error("Error saving attendance:", error);
    }
  };

  const handleEdit = (record: Attendance) => {
    setFormData(record);
    setEditingId(record.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await deleteDoc(doc(db, "attendance", id));
        fetchAttendance();
      } catch (error) {
        console.error("Error deleting attendance:", error);
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      userName: "",
      userRole: "Teacher",
      status: "Present",
      remarks: ""
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Present": return styles.statusPresent;
      case "Absent": return styles.statusAbsent;
      case "Leave": return styles.statusLeave;
      case "Late": return styles.statusLate;
      default: return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Attendance Management</h1>
        <button onClick={openAddModal} className={styles.addButton}>Add Record</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record.id}>
                  <td>{record.date}</td>
                  <td>{record.userName}</td>
                  <td>{record.userRole}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.remarks}</td>
                  <td>
                    <button onClick={() => handleEdit(record)} className={styles.actionButton}>Edit</button>
                    <button onClick={() => handleDelete(record.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Delete</button>
                  </td>
                </tr>
              ))}
              {attendanceRecords.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>{editingId ? "Edit Record" : "Add Record"}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>User Name</label>
                <input type="text" name="userName" value={formData.userName} onChange={handleInputChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>User Role</label>
                <select name="userRole" value={formData.userRole} onChange={handleInputChange}>
                  <option value="Teacher">Teacher</option>
                  <option value="Staff">Staff</option>
                  <option value="Student">Student</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Remarks</label>
                <textarea 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit' }}
                />
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
