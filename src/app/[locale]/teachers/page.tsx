"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "./page.module.css";

export default function TeachersPage() {
  const locale = useLocale() as "ur" | "ar" | "en";
  const [leadership, setLeadership] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const q = query(collection(db, "staff"), where("status", "==", "active"));
        const snap = await getDocs(q);
        const allStaff = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        
        setLeadership(allStaff.filter(s => s.role === "leadership"));
        setFaculty(allStaff.filter(s => s.role === "faculty" || s.role === "teacher"));
        setStaff(allStaff.filter(s => s.role === "staff" || s.role === "admin"));
      } catch (err: any) {
        console.error("Error fetching staff", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const getLocalized = (obj: any, field: string) => {
    if (!obj || !obj[field]) return "";
    return obj[field][locale] || obj[field]["ur"] || "";
  };

  const labels = {
    ur: {
      title: "اساتذہ اور عملہ",
      leadership: "جامعہ کی قیادت",
      faculty: "تدریسی عملہ (اساتذہ)",
      staff: "انتظامی عملہ",
      loading: "لوڈ ہو رہا ہے...",
      noData: "کوئی ریکارڈ دستیاب نہیں۔",
      designation: "عہدہ",
      phone: "رابطہ نمبر",
      joined: "تاریخ شمولیت"
    },
    ar: {
      title: "المعلمون والموظفون",
      leadership: "قيادة الجامعة",
      faculty: "أعضاء هيئة التدريس",
      staff: "الموظفون الإداريون",
      loading: "جاري التحميل...",
      noData: "لا توجد سجلات.",
      designation: "المنصب",
      phone: "رقم الهاتف",
      joined: "تاريخ الانضمام"
    },
    en: {
      title: "Teachers & Staff",
      leadership: "Leadership",
      faculty: "Faculty Members",
      staff: "Administrative Staff",
      loading: "Loading...",
      noData: "No records available.",
      designation: "Designation",
      phone: "Phone",
      joined: "Joined"
    }
  }[locale];

  const renderGrid = (members: any[]) => {
    if (loading) return <p className={styles.loading}>{labels.loading}</p>;
    if (members.length === 0) return <p className={styles.noData}>{labels.noData}</p>;

    return (
      <div className={styles.grid}>
        {members.map(member => (
          <div key={member.id} className={styles.card}>
            <div className={styles.imageContainer}>
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={getLocalized(member, "name")} className={styles.image} />
              ) : (
                <div className={styles.placeholder}>👤</div>
              )}
            </div>
            <div className={styles.cardContent}>
              <h3>{getLocalized(member, "name")}</h3>
              <p className={styles.designation}>{getLocalized(member, "designation")}</p>
              {member.phone && <p><strong>{labels.phone}:</strong> <a href={`tel:${member.phone}`}>{member.phone}</a></p>}
              {member.joiningDate && <p><strong>{labels.joined}:</strong> {new Date(member.joiningDate).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{labels.title}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{labels.leadership}</h2>
          {renderGrid(leadership)}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{labels.faculty}</h2>
          {renderGrid(faculty)}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{labels.staff}</h2>
          {renderGrid(staff)}
        </section>
      </div>
    </main>
  );
}
