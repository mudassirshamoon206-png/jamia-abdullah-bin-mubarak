"use client";

import { useTranslations } from "next-intl";
import DepartmentsSection from "@/components/public/DepartmentsSection";
import styles from "./page.module.css";

export default function DepartmentsPage() {
  const t = useTranslations("Navigation");

  return (
    <main className={styles.departmentsPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{t("departments")}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        <DepartmentsSection />
      </div>
    </main>
  );
}
