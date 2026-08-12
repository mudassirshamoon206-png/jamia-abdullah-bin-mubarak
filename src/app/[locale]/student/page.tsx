"use client";

import { useTranslations } from "next-intl";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ attendance: 0, courses: 0 });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    const fetchStudentData = async () => {
      try {
        // Fetch Attendance
        const attQuery = query(collection(db, "attendance"), where("userName", "==", user.email));
        const attSnap = await getDocs(attQuery);
        let presentDays = 0;
        let totalDays = attSnap.size;
        attSnap.forEach(doc => {
          if (doc.data().status === "Present") presentDays++;
        });
        const attPercentage = totalDays === 0 ? 100 : Math.round((presentDays / totalDays) * 100);

        // Fetch Courses
        const studentDoc = query(collection(db, "users"), where("email", "==", user.email));
        const userSnap = await getDocs(studentDoc);
        let enrolledCourses = 0;
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          enrolledCourses = userData.courses?.length || 0;
        }

        // Fetch Announcements
        const newsQuery = query(collection(db, "news"), orderBy("date", "desc"), limit(3));
        const newsSnap = await getDocs(newsQuery);
        const fetchedNews = newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStats({ attendance: attPercentage, courses: enrolledCourses });
        setAnnouncements(fetchedNews);
      } catch (error) {
        console.error("Error fetching student data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [user]);
  
  return (
    <div>
      <h1 className={styles.pageTitle}>Welcome back, {user?.email}</h1>
      
      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Attendance</h3>
              <p className={styles.statNumber}>{stats.attendance}%</p>
            </div>
            <div className={styles.statCard}>
              <h3>Active Courses</h3>
              <p className={styles.statNumber}>{stats.courses}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Next Exam</h3>
              <p className={styles.statNumber}>Pending</p>
            </div>
          </div>

          <div className={styles.recentActivity}>
            <h3>Recent Announcements</h3>
            {announcements.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {announcements.map((news) => (
                  <li key={news.id} style={{ marginBottom: "1rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--primary-color)" }}>{news.title?.en || news.title?.ur}</h4>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#555" }}>{news.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new announcements.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
