"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "./DepartmentsSection.module.css"; // Reuse the same card styles

export default function TeachersSection() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as "ur" | "ar" | "en";
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch active teachers, limit to 4 for homepage
        const q = query(
          collection(db, "staff"),
          where("role", "in", ["leadership", "faculty", "teacher"]),
          where("status", "==", "active"),
          limit(4)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTeachers(data);
      } catch (err: any) {
        console.error("Error fetching teachers", err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <section className={styles.departmentsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t("teachers")}</h2>
        
        {loading ? (
          <p className={styles.loadingText}>Loading...</p>
        ) : teachers.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-dark)', opacity: 0.7, padding: '2rem 0'}}>
            {locale === "ur" ? "ابھی تک کوئی اساتذہ دستیاب نہیں۔" : locale === "ar" ? "لا يوجد معلمون متاحون في الوقت الحالي." : "No teachers available at the moment."}
          </p>
        ) : (
          <div className={styles.grid}>
            {teachers.map((teacher) => (
              <div key={teacher.id} className={styles.card}>
                <div className={styles.imagePlaceholder} style={{ height: '200px' }}>
                  {teacher.photoUrl ? (
                    <img src={teacher.photoUrl} alt={teacher.name[locale]} className={styles.image} style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className={styles.patternPlaceholder} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.2 }}>👤</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent} style={{ textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '0.25rem' }}>{teacher.name[locale] || teacher.name.ur}</h3>
                  <p style={{ color: 'var(--secondary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {teacher.designation[locale] || teacher.designation.ur}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
           <Link href={`/teachers`} className={styles.readMore} style={{ display: 'inline-block', padding: '0.75rem 2rem', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', textDecoration: 'none' }}>
             {locale === "ur" ? "تمام اساتذہ دیکھیں" : locale === "ar" ? "عرض جميع المعلمين" : "View All Faculty"}
           </Link>
        </div>
      </div>
    </section>
  );
}
