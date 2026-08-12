"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc, query, orderBy, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Admission, Course, Department } from "@/lib/firebase/firestore";
import styles from "../crud.module.css";
import { useTranslations } from "next-intl";

export default function AdmissionsPage() {
  const t = useTranslations("AdminAdmissions");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const deptSnapshot = await getDocs(query(collection(db, "departments")));
      const deptData = deptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Department));
      setDepartments(deptData);

      const courseSnapshot = await getDocs(query(collection(db, "courses")));
      const courseData = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(courseData);

      const admissionsSnapshot = await getDocs(query(collection(db, "admissions"), orderBy("submittedAt", "desc")));
      const admissionsData = admissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Admission));
      
      setAdmissions(admissionsData);
    } catch (error) {
      console.error("Error fetching admissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "admissions", id), {
        status: newStatus,
        reviewedAt: Timestamp.now(),
      });
      fetchData();
    } catch (error) {
      console.error("Error updating admission status:", error);
    }
  };

  const getCourseName = (id: string) => {
    return courses.find(c => c.id === id)?.title?.en || "Unknown";
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.title?.en || "Unknown";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title") || "Admissions Review"}</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("applicantName") || "Applicant Name"}</th>
                <th>{t("applicantEmail") || "Email"}</th>
                <th>{t("course") || "Course"}</th>
                <th>{t("department") || "Department"}</th>
                <th>{t("status") || "Status"}</th>
                <th>{t("submittedAt") || "Submitted At"}</th>
                <th>{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map(admission => (
                <tr key={admission.id}>
                  <td>{admission.applicantName}</td>
                  <td>{admission.applicantEmail}</td>
                  <td>{getCourseName(admission.courseId)}</td>
                  <td>{getDepartmentName(admission.departmentId)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${admission.status === 'approved' ? styles.statusActive : admission.status === 'rejected' ? styles.statusInactive : ''}`} style={{ backgroundColor: admission.status === 'pending' ? '#f59e0b' : undefined, color: admission.status === 'pending' ? 'white' : undefined }}>
                      {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {admission.submittedAt ? new Date(admission.submittedAt.toMillis()).toLocaleDateString() : "-"}
                  </td>
                  <td>
                    {admission.status === 'pending' && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => handleUpdateStatus(admission.id!, "approved")} className={styles.actionButton} style={{ backgroundColor: '#10b981', color: 'white' }}>{t("approve") || "Approve"}</button>
                        <button onClick={() => handleUpdateStatus(admission.id!, "rejected")} className={styles.actionButton} style={{ backgroundColor: '#ef4444', color: 'white' }}>{t("reject") || "Reject"}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {admissions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>{t("noData") || "No admissions found."}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
