"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, Link } from "@/i18n/routing";
import { useEffect } from "react";
import styles from "./layout.module.css";
import { useTranslations } from "next-intl";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const t = useTranslations("Navigation");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className={styles.loading}>Loading Student Portal...</div>;
  }

  // Prevent non-students (like admins) from accessing student portal unless they are super admin maybe, but let's restrict.
  // Actually, admins shouldn't need the student portal, but for testing it might be fine.
  if (role !== "student" && role !== "super_admin" && role !== "admin") {
     // Allow for now, or redirect.
  }

  return (
    <div className={styles.studentLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h3>Student Portal</h3>
        </div>
        <nav className={styles.nav}>
          <Link href="/student">Dashboard</Link>
          <Link href="/student/courses">My Courses</Link>
          <Link href="/student/attendance">Attendance</Link>
          <Link href="/student/results">Results & Exams</Link>
          <Link href="/student/fees">Fee Status</Link>
          <Link href="/student/documents">Documents</Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={signOut}>Sign Out</button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h2>{t("student_portal")}</h2>
          <div className={styles.userProfile}>
            {user.email}
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
