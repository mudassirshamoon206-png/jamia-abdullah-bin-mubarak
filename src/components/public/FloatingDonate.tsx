"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import styles from "./FloatingDonate.module.css";

export default function FloatingDonate() {
  const locale = useLocale();

  const label =
    locale === "ur" ? "عطیات\nو صدقات" :
    locale === "ar" ? "تبرع\nالآن" :
    "Donate";

  const ariaLabel =
    locale === "ur" ? "عطیات اور صدقات" :
    locale === "ar" ? "تبرع الآن" :
    "Donate / Support";

  return (
    <Link
      href="/donations"
      className={styles.floatingDonate}
      aria-label={ariaLabel}
    >
      {/* Heart + hand SVG */}
      <span className={styles.icon} aria-hidden="true">🤲</span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}
