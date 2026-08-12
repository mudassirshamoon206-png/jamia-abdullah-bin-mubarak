"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import styles from "./Footer.module.css";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations("Navigation");
  const [identity, setIdentity] = useState({ name: "Jamia Abdullah Bin Mubarak", urName: "جامعہ عبداللہ بن مبارک", arName: "جامعة عبد الله بن مبارک" });
  const [contact, setContact] = useState({ address: "Near City Hospital, Nagina Chowk, Pakpattan, 57400, Pakistan", phone: "0328-7423123", whatsapp: "03037516220" });
  const [social, setSocial] = useState({ facebook: "", youtube: "" });

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [idSnap, contactSnap, socialSnap] = await Promise.all([
          getDoc(doc(db, "site_settings", "identity")),
          getDoc(doc(db, "site_settings", "contact")),
          getDoc(doc(db, "site_settings", "social"))
        ]);

        if (idSnap.exists()) {
          const data = idSnap.data();
          setIdentity({
            name: data.siteName || "Jamia Abdullah Bin Mubarak",
            urName: data.urduName || "جامعہ عبداللہ بن مبارک",
            arName: data.arabicName || "جامعة عبد الله بن مبارک"
          });
        }
        if (contactSnap.exists()) {
          const data = contactSnap.data();
          setContact({
            address: data.address || "Near City Hospital, Nagina Chowk, Pakpattan, 57400, Pakistan",
            phone: data.phoneGeneral || data.phone || "0328-7423123",
            whatsapp: data.whatsapp || "03037516220"
          });
        }
        if (socialSnap.exists()) {
          const data = socialSnap.data();
          setSocial({
            facebook: data.facebook || "",
            youtube: data.youtube || ""
          });
        }
      } catch (err) {
        console.error("Error fetching footer data:", err);
      }
    };
    fetchFooterData();
  }, []);

  const getLocalizedName = () => {
    if (locale === "ur") return identity.urName;
    if (locale === "ar") return identity.arName;
    return identity.name;
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Column 1: Intro */}
          <div className={styles.column}>
            <h3 className={styles.logoText}>{getLocalizedName()}</h3>
            <p className={styles.introText}>
              {locale === "ur" 
                ? "جامعہ عبداللہ بن مبارک ایک اسلامی تعلیمی ادارہ ہے جو دینی و عصری علوم کی معیاری تعلیم فراہم کرنے کے لیے قائم ہے۔"
                : locale === "ar"
                ? "جامعة عبد الله بن مبارك هي مؤسسة تعليمية إسلامية ملتزمة بتقديم تعليم ديني ومعاصر متميز."
                : "Jamia Abdullah Bin Mubarak is an Islamic educational institution committed to providing quality religious and contemporary education."
              }
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles.column}>
            <h4>{locale === "ur" ? "اہم لنکس" : locale === "ar" ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className={styles.links}>
              <li><Link href="/">{t("home")}</Link></li>
              <li><Link href="/about">{t("about")}</Link></li>
              <li><Link href="/departments">{t("departments")}</Link></li>
              <li><Link href="/admissions">{t("admissions")}</Link></li>
              <li><Link href="/contact">{t("contact")}</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className={styles.column}>
            <h4>{locale === "ur" ? "رابطہ کریں" : locale === "ar" ? "اتصل بنا" : "Contact Us"}</h4>
            <p className={styles.contactItem}>
              <strong>{locale === "ur" ? "پتہ:" : locale === "ar" ? "العنوان:" : "Address:"}</strong><br/>
              {contact.address}
            </p>
            <p className={styles.contactItem}>
              <strong>{locale === "ur" ? "فون:" : locale === "ar" ? "الهاتف:" : "Phone:"}</strong><br/>
              <a href={`tel:${contact.phone}`} className={styles.clickableLink}>{contact.phone}</a>
            </p>
          </div>

          {/* Column 4: Social Links & Actions */}
          <div className={styles.column}>
            <h4>{locale === "ur" ? "سوشل میڈیا" : locale === "ar" ? "وسائل التواصل" : "Social Media"}</h4>
            <div className={styles.socials}>
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  Facebook
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                  YouTube
                </a>
              )}
              {contact.whatsapp && (
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; {currentYear} {getLocalizedName()}. {locale === "ur" ? "جملہ حقوق محفوظ ہیں۔" : locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
