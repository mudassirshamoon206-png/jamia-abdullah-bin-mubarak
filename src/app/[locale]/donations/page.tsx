"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import styles from "./page.module.css";

export default function DonationsPage() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonationSettings = async () => {
      try {
        const snap = await getDoc(doc(db, "site_settings", "donation"));
        if (snap.exists()) {
          setDonation(snap.data());
        }
      } catch (err) {
        console.error("Error loading donations config:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonationSettings();
  }, []);

  const hasPaymentDetails = donation && (
    donation.bankName ||
    donation.accountNumber ||
    donation.easypaisaNumber ||
    donation.jazzcashNumber ||
    donation.raastId
  );

  const getLocalizedInstructions = () => {
    if (!donation) return "";
    if (locale === "ur" && donation.instructionsUr) return donation.instructionsUr;
    if (locale === "ar" && donation.instructionsAr) return donation.instructionsAr;
    return donation.instructionsEn || "";
  };

  const labels = {
    ur: {
      title: "عطیات اور مالی تعاون",
      subtitle: "جامعہ کے تعلیمی و تعمیراتی منصوبوں میں اپنا حصہ ملائیں۔",
      bank: "بینک ٹرانسفر",
      easypaisa: "ایزی پیسہ",
      jazzcash: "جاز کیش",
      raast: "راست آئی ڈی",
      noDetails: "برائے مہربانی عطیات یا تعمیراتی تعاون کی تفصیلات حاصل کرنے کے لیے جامعہ کی انتظامیہ سے براہ راست رابطہ کریں۔",
      bankTitle: "بینک کا نام",
      titleLabel: "اکاؤنٹ ٹائٹل",
      numberLabel: "اکاؤنٹ نمبر",
      ibanLabel: "IBAN",
      instructions: "ہدایات"
    },
    ar: {
      title: "التبرعات والدعم المالي",
      subtitle: "ساهم في المشاريع التعليمية والإنشائية للجامعة.",
      bank: "تحويل بنكي",
      easypaisa: "إيزي بيسا",
      jazzcash: "جاز كاش",
      raast: "معرّف راست",
      noDetails: "يرجى الاتصال بإدارة الجامعة مباشرة للحصول على تفاصيل التبرع والدعم.",
      bankTitle: "اسم البنك",
      titleLabel: "اسم الحساب",
      numberLabel: "رقم الحساب",
      ibanLabel: "IBAN",
      instructions: "تعليمات"
    },
    en: {
      title: "Donations & Support",
      subtitle: "Contribute to the educational and construction projects of the Jamia.",
      bank: "Bank Transfer",
      easypaisa: "EasyPaisa",
      jazzcash: "JazzCash",
      raast: "Raast ID",
      noDetails: "Please contact the Jamia administration directly for donation or payment details.",
      bankTitle: "Bank Name",
      titleLabel: "Account Title",
      numberLabel: "Account Number",
      ibanLabel: "IBAN",
      instructions: "Instructions"
    }
  }[locale] || {
    title: "Donations & Support",
    subtitle: "Contribute to the educational and construction projects.",
    bank: "Bank Transfer",
    easypaisa: "EasyPaisa",
    jazzcash: "JazzCash",
    raast: "Raast ID",
    noDetails: "Please contact the administration directly.",
    bankTitle: "Bank Name",
    titleLabel: "Account Title",
    numberLabel: "Account Number",
    ibanLabel: "IBAN",
    instructions: "Instructions"
  };

  return (
    <main className={styles.donationsPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{labels.title}</h1>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.introSection}>
          <p>{labels.subtitle}</p>
          {donation && getLocalizedInstructions() && (
            <div className={styles.instructionsBox}>
              <h3>{labels.instructions}</h3>
              <p style={{ whiteSpace: "pre-line" }}>{getLocalizedInstructions()}</p>
            </div>
          )}
        </div>

        {loading ? (
          <p className={styles.loading}>Loading donation details...</p>
        ) : !hasPaymentDetails ? (
          <div className={styles.noDataCard}>
            <p>{labels.noDetails}</p>
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {/* Bank Card */}
            {donation.bankName && (
              <div className={styles.card}>
                <h3>{labels.bank}</h3>
                <p><strong>{labels.bankTitle}:</strong> {donation.bankName}</p>
                <p><strong>{labels.titleLabel}:</strong> {donation.accountTitle}</p>
                <p><strong>{labels.numberLabel}:</strong> {donation.accountNumber}</p>
                {donation.iban && <p><strong>{labels.ibanLabel}:</strong> {donation.iban}</p>}
              </div>
            )}

            {/* EasyPaisa Card */}
            {donation.easypaisaNumber && (
              <div className={styles.card} style={{ borderTopColor: "#22c55e" }}>
                <h3>{labels.easypaisa}</h3>
                <p><strong>{labels.numberLabel}:</strong> {donation.easypaisaNumber}</p>
                <p><strong>{labels.titleLabel}:</strong> {donation.easypaisaTitle}</p>
              </div>
            )}

            {/* JazzCash Card */}
            {donation.jazzcashNumber && (
              <div className={styles.card} style={{ borderTopColor: "#eab308" }}>
                <h3>{labels.jazzcash}</h3>
                <p><strong>{labels.numberLabel}:</strong> {donation.jazzcashNumber}</p>
                <p><strong>{labels.titleLabel}:</strong> {donation.jazzcashTitle}</p>
              </div>
            )}

            {/* Raast Card */}
            {donation.raastId && (
              <div className={styles.card} style={{ borderTopColor: "#06b6d4" }}>
                <h3>{labels.raast}</h3>
                <p><strong>Raast ID:</strong> {donation.raastId}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
