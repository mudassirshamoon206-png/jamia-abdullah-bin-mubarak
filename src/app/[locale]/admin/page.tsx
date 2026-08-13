"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function AdminDashboard() {
  const t = useTranslations("Navigation");
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    departments: 0,
    courses: 0
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsSnap, teachersSnap, deptsSnap, coursesSnap, admissionsSnap] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "student"))),
          getDocs(query(collection(db, "users"), where("role", "==", "teacher"))),
          getDocs(collection(db, "departments")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "admissions"))
        ]);

        setStats({
          students: studentsSnap.size,
          teachers: teachersSnap.size,
          departments: deptsSnap.size,
          courses: coursesSnap.size
        });
        setRecentAdmissions(admissionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Total Students</h3>
            <p className={styles.statNumber}>{stats.students}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Total Teachers</h3>
            <p className={styles.statNumber}>{stats.teachers}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Departments</h3>
            <p className={styles.statNumber}>{stats.departments}</p>
          </div>
          <div className={styles.statCard}>
            <h3>Courses</h3>
            <p className={styles.statNumber}>{stats.courses}</p>
          </div>
        </div>
      )}

      <div className={styles.recentActivity}>
        <h3>Recent Admission Applications</h3>
        {recentAdmissions.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {recentAdmissions.map((app) => (
              <li key={app.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{app.studentName}</strong>
                  <span style={{ 
                    padding: "2px 8px", 
                    borderRadius: "12px", 
                    fontSize: "0.8rem",
                    backgroundColor: app.status === "pending" ? "#fff3cd" : app.status === "approved" ? "#d1e7dd" : "#f8d7da",
                    color: app.status === "pending" ? "#856404" : app.status === "approved" ? "#0f5132" : "#842029"
                  }}>{app.status}</span>
                </div>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.9rem", color: "#666" }}>Applied for {app.desiredDepartment} on {new Date(app.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activity found.</p>
        )}
      </div>
    </div>
  );
}
