"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "../about/page.module.css";

export default function CoursesPage() {
  const t = useTranslations("Navigation");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        const snap = await Promise.race([getDocs(collection(db, "courses")), timeoutPromise]) as any;
        setCourses(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Error fetching courses", err);
        setError("Failed to load courses. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>Courses & Academic Programs</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        {loading ? (
          <div className={styles.introSection}><p>Loading courses...</p></div>
        ) : (
          <div className={styles.missionVision}>
            {courses.map(course => (
              <div key={course.id} className={styles.card}>
                <h3>{course.title?.en || course.title?.ur || "Course Title"}</h3>
                <p>{course.description?.en || course.description?.ur || "Description not available."}</p>
              </div>
            ))}
            {error && (
              <div className={styles.card} style={{borderColor: 'red'}}>
                <p style={{color: 'red'}}>{error}</p>
              </div>
            )}
            {!error && courses.length === 0 && (
              <div className={styles.card}>
                <p>No courses available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
