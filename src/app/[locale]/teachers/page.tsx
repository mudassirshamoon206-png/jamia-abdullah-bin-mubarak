"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../about/page.module.css";

export default function TeachersPage() {
  const locale = useLocale();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const defaultLeaders = [
    {
      name: "Mufti Azhar-ul-Haq",
      nameUr: "مفتی اظہر الحق",
      nameAr: "مفتي أظهر الحق",
      designation: "Director",
      designationUr: "ڈائریکٹر",
      designationAr: "المدير",
      phone: "0300-8751075",
      specialization: "Islamic Jurisprudence / Fiqh"
    },
    {
      name: "Muhammad Tayyab Mahmood",
      nameUr: "محمد طیب محمود",
      nameAr: "محمد طيب محمود",
      designation: "Director / Administration",
      designationUr: "ڈائریکٹر / انتظامیہ",
      designationAr: "المدير / الإدارة",
      phone: "0303-7516220",
      specialization: "Islamic Administration & Education Management"
    },
    {
      name: "Rana Muhammad Khalil Ahmad",
      nameUr: "رانا محمد خلیل احمد",
      nameAr: "رانا محمد خليل أحمد",
      designation: "General Secretary",
      designationUr: "جنرل سیکرٹری",
      designationAr: "الأمين العام",
      phone: "0300-7837535",
      specialization: "External Affairs & Social Services"
    }
  ];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "teacher"));
        const snap = await getDocs(q);
        setTeachers(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Error fetching teachers", err);
        setError("Failed to load teachers. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const getLocalizedName = (member: any) => {
    if (locale === "ur" && member.nameUr) return member.nameUr;
    if (locale === "ar" && member.nameAr) return member.nameAr;
    return member.name || member.displayName || member.email;
  };

  const getLocalizedDesignation = (member: any) => {
    if (locale === "ur" && member.designationUr) return member.designationUr;
    if (locale === "ar" && member.designationAr) return member.designationAr;
    return member.designation || "Faculty Member";
  };

  const labels = {
    ur: {
      leadership: "جامعہ کی قیادت",
      faculty: "تدریسی عملہ (اساتذہ)",
      loading: "تدریسی عملے کی فہرست لوڈ ہو رہی ہے...",
      noFaculty: "ابھی تک کوئی تدریسی عملہ درج نہیں کیا گیا۔",
      specialization: "خاص مہارت"
    },
    ar: {
      leadership: "قيادة الجامعة",
      faculty: "أعضاء هيئة التدريس",
      loading: "جاري تحميل قائمة المعلمين...",
      noFaculty: "لم يتم تسجيل أي أعضاء هيئة تدريس بعد.",
      specialization: "التخصص"
    },
    en: {
      leadership: "Jamia Leadership & Administration",
      faculty: "Faculty Members",
      loading: "Loading faculty list...",
      noFaculty: "No faculty members listed yet.",
      specialization: "Specialization"
    }
  }[locale] || {
    leadership: "Jamia Leadership",
    faculty: "Faculty Members",
    loading: "Loading...",
    noFaculty: "No faculty members listed yet.",
    specialization: "Specialization"
  };

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{locale === "ur" ? "اساتذہ اور عملہ" : locale === "ar" ? "المعلمون والموظفون" : "Teachers & Staff"}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        {/* Section 1: Leadership */}
        <section className={styles.introSection} style={{ marginBottom: "3rem" }}>
          <h2>{labels.leadership}</h2>
          <div className={styles.missionVision}>
            {defaultLeaders.map((leader, index) => (
              <div key={index} className={styles.card}>
                <h3>{getLocalizedName(leader)}</h3>
                <p><strong>{getLocalizedDesignation(leader)}</strong></p>
                <p>{labels.specialization}: {leader.specialization}</p>
                <p>
                  Contact: <a href={`tel:${leader.phone}`} style={{ color: "var(--primary-color)", fontWeight: "bold" }}>{leader.phone}</a>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: General Faculty */}
        <section className={styles.introSection}>
          <h2>{labels.faculty}</h2>
          {loading ? (
            <p>{labels.loading}</p>
          ) : (
            <div className={styles.missionVision}>
              {teachers.map(teacher => (
                <div key={teacher.id} className={styles.card}>
                  <h3>{getLocalizedName(teacher)}</h3>
                  <p><strong>{getLocalizedDesignation(teacher)}</strong></p>
                  {teacher.specialization && <p>{labels.specialization}: {teacher.specialization}</p>}
                  <p>Department: {teacher.department || "General / Islamic Studies"}</p>
                </div>
              ))}
              {!error && teachers.length === 0 && (
                <div className={styles.card}>
                  <p>{labels.noFaculty}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
