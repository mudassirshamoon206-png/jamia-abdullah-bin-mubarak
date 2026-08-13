"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getCourses, Course } from "@/lib/firebase/firestore";
import styles from "./DepartmentsSection.module.css"; // Reuse the same card styles for consistency

export default function CoursesSection() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as "ur" | "ar" | "en";
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCourses();
        // Get active courses, limit to 4 for homepage preview
        setCourses(data.filter((c: Course) => c.isActive).slice(0, 4));
      } catch (err: any) {
        console.error("Error fetching courses", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <section className={styles.departmentsSection} style={{ backgroundColor: "#f3f4f6" }}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t("courses")}</h2>
        
        {loading ? (
          <p className={styles.loadingText}>Loading...</p>
        ) : courses.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-dark)', opacity: 0.7, padding: '2rem 0'}}>
            {locale === "ur" ? "ابھی تک کوئی کورس دستیاب نہیں۔" : locale === "ar" ? "لا توجد دورات متاحة في الوقت الحالي." : "No courses available at the moment."}
          </p>
        ) : (
          <div className={styles.grid}>
            {courses.map((course) => (
              <div key={course.id} className={styles.card}>
                <div className={styles.cardContent}>
                  <h3>{course.title[locale] || course.title.ur}</h3>
                  <p>{course.description[locale]?.substring(0, 100)}...</p>
                  <p style={{fontSize: '0.85rem', color: '#666', marginTop: '0.5rem', marginBottom: '1rem'}}>
                    <strong>{locale === "ur" ? "دورانیہ:" : locale === "ar" ? "المدة:" : "Duration:"}</strong> {course.duration[locale] || course.duration.ur}
                  </p>
                  <Link href={`/courses`} className={styles.readMore}>
                    {locale === "ur" ? "مزید پڑھیں" : locale === "ar" ? "اقرأ المزيد" : "Read More"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
