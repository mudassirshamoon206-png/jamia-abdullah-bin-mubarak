"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "./DonationStrip.module.css";

interface DonationStripProps {
  /** pass true to always render even when toggle is off (for admin preview) */
  forceShow?: boolean;
}

export default function DonationStrip({ forceShow }: DonationStripProps) {
  const locale = useLocale();
  const [stripData, setStripData] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeSnap, donSnap] = await Promise.all([
          getDoc(doc(db, "site_settings", "homepage")),
          getDoc(doc(db, "site_settings", "donation")),
        ]);

        const homepageData = homeSnap.exists() ? homeSnap.data() : {};
        const donationData = donSnap.exists() ? donSnap.data() : {};

        const enabled = forceShow || (homepageData.enableDonations !== false);
        setShow(enabled);
        setStripData({
          // CMS overrides first, fall back to sensible defaults
          titleEn: donationData.stripTitleEn || "Support Jamia Abdullah Bin Mubarak",
          titleUr: donationData.stripTitleUr || "جامعہ کی تعمیر و تعلیم میں اپنا حصہ شامل کریں",
          titleAr: donationData.stripTitleAr || "ادعم جامعة عبد الله بن مبارك",
          descEn: donationData.stripDescEn || "Contribute your donations and financial support towards the Jamia's construction and educational initiatives.",
          descUr: donationData.stripDescUr || "اپنے عطیات، صدقات اور دیگر مالی تعاون کے ذریعے جامعہ عبداللہ بن مبارک کا ساتھ دیں۔",
          descAr: donationData.stripDescAr || "ساهم بتبرعاتك ودعمك المالي في مشاريع بناء الجامعة ومبادراتها التعليمية.",
          btnEn: donationData.stripBtnEn || "Donate Now",
          btnUr: donationData.stripBtnUr || "عطیہ کریں",
          btnAr: donationData.stripBtnAr || "تبرع الآن",
          showBtn: donationData.stripShowBtn !== false,
          hasPaymentMethods: !!(
            donationData.bankName ||
            donationData.accountNumber ||
            donationData.easypaisaNumber ||
            donationData.jazzcashNumber ||
            donationData.raastId
          ),
        });
      } catch (err) {
        console.error("DonationStrip: error fetching settings", err);
      }
    };
    fetchData();
  }, [locale, forceShow]);

  if (!show || !stripData) return null;

  const title =
    locale === "ur" ? stripData.titleUr :
    locale === "ar" ? stripData.titleAr :
    stripData.titleEn;

  const desc =
    locale === "ur" ? stripData.descUr :
    locale === "ar" ? stripData.descAr :
    stripData.descEn;

  const btn =
    locale === "ur" ? stripData.btnUr :
    locale === "ar" ? stripData.btnAr :
    stripData.btnEn;

  return (
    <div className={styles.strip}>
      <div className={styles.inner}>
        {/* Decorative left accent */}
        <span className={styles.accentLeft} aria-hidden="true">✦</span>

        <div className={styles.textGroup}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{desc}</p>
        </div>

        {stripData.showBtn && (
          <Link href="/donations" className={styles.btn}>
            <span className={styles.btnIcon}>🤲</span>
            {btn}
          </Link>
        )}

        {/* Decorative right accent */}
        <span className={styles.accentRight} aria-hidden="true">✦</span>
      </div>
    </div>
  );
}
