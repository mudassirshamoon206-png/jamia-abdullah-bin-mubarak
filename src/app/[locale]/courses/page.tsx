"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "../about/page.module.css";

export default function CoursesPage() {
  const locale = useLocale();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const snap = await getDocs(collection(db, "courses"));
        const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setCourses(items);
      } catch (err: any) {
        console.error("Error fetching courses", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getTitle = (course: any) => {
    if (locale === "ur") return course.title?.ur || course.title?.en || "کورس";
    if (locale === "ar") return course.title?.ar || course.title?.en || "دورة";
    return course.title?.en || course.title?.ur || "Course Title";
  };

  const getDescription = (course: any) => {
    if (locale === "ur") return course.description?.ur || course.description?.en || "";
    if (locale === "ar") return course.description?.ar || course.description?.en || "";
    return course.description?.en || course.description?.ur || "";
  };

  const getDuration = (course: any) => {
    if (locale === "ur") return course.duration?.ur || course.duration?.en || "";
    if (locale === "ar") return course.duration?.ar || course.duration?.en || "";
    return course.duration?.en || course.duration?.ur || "";
  };

  const pageTitle =
    locale === "ur" ? "کورسز اور تعلیمی پروگرام" : locale === "ar" ? "الدورات والبرامج الأكاديمية" : "Courses & Academic Programs";
  const loadingText =
    locale === "ur" ? "کورسز لوڈ ہو رہے ہیں..." : locale === "ar" ? "جاري التحميل..." : "Loading courses...";
  const emptyText =
    locale === "ur" ? "ابھی تک کوئی کورس دستیاب نہیں۔" : locale === "ar" ? "لا توجد دورات متاحة حتى الآن." : "No courses available at the moment.";
  const durationLabel =
    locale === "ur" ? "مدت" : locale === "ar" ? "المدة" : "Duration";
  const statusLabel =
    locale === "ur" ? "داخلہ" : locale === "ar" ? "القبول" : "Admission";
  const openLabel =
    locale === "ur" ? "کھلا ہے" : locale === "ar" ? "مفتوح" : "Open";
  const closedLabel =
    locale === "ur" ? "بند ہے" : locale === "ar" ? "مغلق" : "Closed";

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{pageTitle}</h1>
        </div>
      </header>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.introSection}><p>{loadingText}</p></div>
        ) : (
          <div className={styles.missionVision}>
            {courses.length === 0 && (
              <div className={styles.card}>
                <p>{emptyText}</p>
              </div>
            )}
            {courses.map(course => (
              <div key={course.id} className={styles.card}>
                <h3>{getTitle(course)}</h3>
                <p>{getDescription(course)}</p>
                {getDuration(course) && (
                  <p style={{ fontSize: "0.9rem" }}>
                    <strong>{durationLabel}:</strong> {getDuration(course)}
                  </p>
                )}
                {course.admissionStatus && (
                  <p style={{ fontSize: "0.9rem" }}>
                    <strong>{statusLabel}:</strong>{" "}
                    <span style={{ color: course.admissionStatus === "open" ? "green" : "red", fontWeight: "bold" }}>
                      {course.admissionStatus === "open" ? openLabel : closedLabel}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
