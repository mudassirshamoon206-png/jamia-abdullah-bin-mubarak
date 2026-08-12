"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, Link } from "@/i18n/routing";
import { useEffect } from "react";
import styles from "./layout.module.css";
import { useTranslations } from "next-intl";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const t = useTranslations("Navigation");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className={styles.loading}>Loading Admin...</div>;
  }

  // Prevent students from accessing admin panel
  if (role === "student") {
    return (
      <div className={styles.unauthorized}>
        <h2>Unauthorized Access</h2>
        <p>You do not have permission to view this page.</p>
        <button onClick={() => router.push("/student")}>Go to Student Portal</button>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h3>Jamia Admin</h3>
          <p className={styles.roleBadge}>{role?.replace("_", " ").toUpperCase()}</p>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin">📊 Dashboard</Link>

          {/* CMS / Website */}
          {(role === "super_admin" || role === "admin" || role === "content_manager") && (
            <>
              <span className={styles.navSectionLabel}>🌐 Website CMS</span>
              <Link href="/admin/settings">⚙️ Site Settings</Link>
              <Link href="/admin/news">{t("news")}</Link>
              <Link href="/admin/events">{t("events")}</Link>
              <Link href="/admin/gallery">{t("gallery")}</Link>
              <Link href="/admin/media">Media Library</Link>
            </>
          )}

          {/* Academics */}
          {(role === "super_admin" || role === "admin" || role === "content_manager") && (
            <>
              <span className={styles.navSectionLabel}>📚 Academics</span>
              <Link href="/admin/departments">{t("departments")}</Link>
              <Link href="/admin/courses">{t("courses")}</Link>
            </>
          )}

          {/* HR */}
          {(role === "super_admin" || role === "admin" || role === "hr_manager") && (
            <>
              <span className={styles.navSectionLabel}>👥 HR</span>
              <Link href="/admin/teachers">Teachers</Link>
              <Link href="/admin/staff">Staff</Link>
              <Link href="/admin/attendance">Attendance</Link>
            </>
          )}

          {/* Finance */}
          {(role === "super_admin" || role === "admin" || role === "accountant" || role === "hr_manager") && (
            <>
              <span className={styles.navSectionLabel}>💰 Finance</span>
              <Link href="/admin/finance">Salary & Finance</Link>
            </>
          )}

          {/* Admissions */}
          {(role === "super_admin" || role === "admin" || role === "admission_manager") && (
            <>
              <span className={styles.navSectionLabel}>📝 Admissions</span>
              <Link href="/admin/admissions">{t("admissions")}</Link>
              <Link href="/admin/students">Students</Link>
            </>
          )}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={signOut}>Sign Out</button>
        </div>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <h2>{t("home")}</h2>
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
