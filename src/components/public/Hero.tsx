"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import styles from "./Hero.module.css";

export default function Hero() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  
  const [hero, setHero] = useState({
    title: "",
    desc: ""
  });
  
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const snap = await getDoc(doc(db, "site_settings", "homepage"));
        if (snap.exists()) {
          const data = snap.data();
          if (locale === "ur") {
            setHero({
              title: data.heroTitleUr || t("title"),
              desc: data.heroDescUr || t("description")
            });
          } else if (locale === "ar") {
            setHero({
              title: data.heroTitleAr || t("title"),
              desc: data.heroDescAr || t("description")
            });
          } else {
            setHero({
              title: data.heroTitle || t("title"),
              desc: data.heroDesc || t("description")
            });
          }
        } else {
          setHero({ title: t("title"), desc: t("description") });
        }
      } catch (err) {
        console.error("Error fetching hero settings:", err);
        setHero({ title: t("title"), desc: t("description") });
      }
    };
    fetchHeroData();
  }, [locale, t]);

  return (
    <section className={styles.heroSection}>
      <div className={styles.overlay}>
        <div className={styles.content}>
          <h1 className={styles.title}>{hero.title}</h1>
          <p className={styles.subtitle}>{hero.desc}</p>
          <div className={styles.ctaGroup}>
            <Link href="/admissions" className={styles.primaryBtn}>
              {locale === "ur" ? "آن لائن داخلہ" : locale === "ar" ? "القبول الإلكتروني" : "Apply Now"}
            </Link>
            <Link href="/contact" className={styles.secondaryBtn}>
              {locale === "ur" ? "رابطہ کریں" : locale === "ar" ? "اتصل بنا" : "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
