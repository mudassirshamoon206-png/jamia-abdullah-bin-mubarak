"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import styles from "./page.module.css";

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  
  const [aboutData, setAboutData] = useState({
    intro: "Jamia Abdullah Bin Mubarak is an Islamic educational institution committed to providing quality religious and contemporary education. The institution focuses on Islamic learning while also giving importance to contemporary education and the intellectual and educational development of its students.",
    mission: "To nurture individuals with profound Islamic knowledge, moral integrity, and practical contemporary skills.",
    vision: "To be a leading beacon of balanced religious and contemporary education.",
    objectives: "Provide quality Islamic and contemporary education; foster spiritual and ethical growth; develop leadership qualities in students.",
    services: "Hifz-ul-Quran, Dars-e-Nizami, modern schooling facilities, computer education.",
    futurePlans: "Expansion of academic blocks, introduction of specialized research programs, digital classroom transformation."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const docRef = doc(db, "site_settings", "about");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (locale === "ur") {
            setAboutData({
              intro: data.introUr || "",
              mission: data.missionUr || "",
              vision: data.visionUr || "",
              objectives: data.objectivesUr || "",
              services: data.servicesUr || "",
              futurePlans: data.futurePlansUr || ""
            });
          } else if (locale === "ar") {
            setAboutData({
              intro: data.introAr || "",
              mission: data.missionAr || "",
              vision: data.visionAr || "",
              objectives: data.objectivesAr || "",
              services: data.servicesAr || "",
              futurePlans: data.futurePlansAr || ""
            });
          } else {
            setAboutData({
              intro: data.introEn || "",
              mission: data.missionEn || "",
              vision: data.visionEn || "",
              objectives: data.objectivesEn || "",
              services: data.servicesEn || "",
              futurePlans: data.futurePlansEn || ""
            });
          }
        }
      } catch (err) {
        console.error("Error fetching about page settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAboutData();
  }, [locale]);

  const labels = {
    ur: {
      intro: "تعارف",
      mission: "ہمارا مقصد (Mission)",
      vision: "ہمارا وژن (Vision)",
      objectives: "مقاصد",
      services: "خدمات",
      futurePlans: "مستقبل کے منصوبے"
    },
    ar: {
      intro: "المقدمة",
      mission: "رسالتنا",
      vision: "رؤيتنا",
      objectives: "الأهداف",
      services: "الخدمات",
      futurePlans: "الخطط المستقبلية"
    },
    en: {
      intro: "Introduction",
      mission: "Our Mission",
      vision: "Our Vision",
      objectives: "Objectives",
      services: "Services",
      futurePlans: "Future Plans"
    }
  }[locale] || {
    intro: "Introduction",
    mission: "Our Mission",
    vision: "Our Vision",
    objectives: "Objectives",
    services: "Services",
    futurePlans: "Future Plans"
  };

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{t("about")}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        {loading ? (
          <div className={styles.introSection}>
            <p>Loading details...</p>
          </div>
        ) : (
          <>
            <section className={styles.introSection}>
              <h2>{labels.intro}</h2>
              <p style={{ whiteSpace: "pre-line" }}>{aboutData.intro}</p>
            </section>

            <section className={styles.missionVision}>
              {aboutData.mission && (
                <div className={styles.card}>
                  <h3>{labels.mission}</h3>
                  <p>{aboutData.mission}</p>
                </div>
              )}
              {aboutData.vision && (
                <div className={styles.card}>
                  <h3>{labels.vision}</h3>
                  <p>{aboutData.vision}</p>
                </div>
              )}
            </section>

            {(aboutData.objectives || aboutData.services || aboutData.futurePlans) && (
              <section className={styles.introSection} style={{ marginTop: "2rem" }}>
                {aboutData.objectives && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2>{labels.objectives}</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{aboutData.objectives}</p>
                  </div>
                )}
                {aboutData.services && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2>{labels.services}</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{aboutData.services}</p>
                  </div>
                )}
                {aboutData.futurePlans && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2>{labels.futurePlans}</h2>
                    <p style={{ whiteSpace: "pre-line" }}>{aboutData.futurePlans}</p>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
