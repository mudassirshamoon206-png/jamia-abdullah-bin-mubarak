"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState("Jamia Abdullah Bin Mubarak");

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const docRef = doc(db, "site_settings", "identity");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (locale === "ur" && data.urduName) {
            setSiteName(data.urduName);
          } else if (locale === "ar" && data.arabicName) {
            setSiteName(data.arabicName);
          } else {
            setSiteName(data.siteName || "Jamia Abdullah Bin Mubarak");
          }
        }
      } catch (err) {
        console.error("Error fetching identity:", err);
      }
    };
    fetchIdentity();
  }, [locale]);

  const switchLanguage = (newLocale: "en" | "ur" | "ar") => {
    router.replace(pathname, { locale: newLocale });
  };

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/departments", label: t("departments") },
    { href: "/courses", label: t("courses") },
    { href: "/teachers", label: t("teachers") },
    { href: "/admissions", label: t("admissions") },
    { href: "/news", label: t("news") },
    { href: "/events", label: t("events") },
    { href: "/gallery", label: t("gallery") },
    { href: "/donations", label: locale === "ur" ? "عطیات" : locale === "ar" ? "التبرعات" : "Donations" },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoArea}>
          <Link href="/" className={styles.logoText}>
            {siteName}
          </Link>
        </div>
        
        <div className={`${styles.navArea} ${mobileMenuOpen ? styles.mobileOpen : ""}`}>
          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={pathname === link.href ? styles.active : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.langSwitcher}>
            <button onClick={() => switchLanguage("en")} className={locale === "en" ? styles.activeLang : ""}>English</button>
            <span className={styles.divider}>|</span>
            <button onClick={() => switchLanguage("ur")} className={locale === "ur" ? styles.activeLang : ""}>اردو</button>
            <span className={styles.divider}>|</span>
            <button onClick={() => switchLanguage("ar")} className={locale === "ar" ? styles.activeLang : ""}>العربية</button>
          </div>
        </div>

        <button 
          className={styles.hamburger} 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
