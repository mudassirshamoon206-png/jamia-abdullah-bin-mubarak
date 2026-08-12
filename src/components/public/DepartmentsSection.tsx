"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getDepartments, Department } from "@/lib/firebase/firestore";
import styles from "./DepartmentsSection.module.css";

export default function DepartmentsSection() {
  const t = useTranslations("Navigation");
  const locale = useLocale() as "ur" | "ar" | "en";
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        const data = await Promise.race([getDepartments(), timeoutPromise]) as Department[];
        // Get active departments only for public facing
        setDepartments(data.filter((d: Department) => d.isActive));
      } catch (err: any) {
        console.error("Error fetching departments", err);
        setError(err?.message?.includes("index") 
          ? "Departments are loading. Please refresh the page."
          : "Unable to load departments at this time. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <section className={styles.departmentsSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>{t("departments")}</h2>
        
        {loading ? (
          <p className={styles.loadingText}>Loading...</p>
        ) : error ? (
          <p style={{color: 'red', textAlign: 'center'}}>{error}</p>
        ) : departments.length === 0 ? (
          <p style={{textAlign: 'center', color: 'var(--text-dark)', opacity: 0.7, padding: '2rem 0'}}>
            {locale === "ur" ? "ابھی تک کوئی شعبہ دستیاب نہیں۔" : locale === "ar" ? "لا توجد أقسام متاحة في الوقت الحالي." : "No departments available at the moment."}
          </p>
        ) : (
          <div className={styles.grid}>
            {departments.map((dept) => (
              <div key={dept.id} className={styles.card}>
                <div className={styles.imagePlaceholder}>
                  {dept.imagePath ? (
                    <img src={dept.imagePath} alt={dept.title[locale]} className={styles.image} />
                  ) : (
                    <div className={styles.patternPlaceholder}></div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3>{dept.title[locale] || dept.title.ur}</h3>
                  <p>{dept.description[locale]?.substring(0, 100)}...</p>
                  <Link href={`/departments/${dept.id}`} className={styles.readMore}>
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
