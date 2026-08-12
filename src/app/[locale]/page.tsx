"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import Hero from "@/components/public/Hero";
import DepartmentsSection from "@/components/public/DepartmentsSection";
import DonationStrip from "@/components/public/DonationStrip";
import styles from "./page.module.css";


export default function HomePage() {
  const locale = useLocale();
  const t = useTranslations("Navigation");

  // CMS Visibility Toggles & Data
  const [toggles, setToggles] = useState({
    enableHero: true,
    enableAbout: true,
    enableDepartments: true,
    enableAnnouncements: true,
    enableNews: true,
    enableGallery: true,
    enableDonations: true,
    enableContact: true
  });

  const [aboutText, setAboutText] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        // 1. Fetch toggles & identity
        const homeSnap = await getDoc(doc(db, "site_settings", "homepage"));
        if (homeSnap.exists()) {
          const data = homeSnap.data();
          setToggles({
            enableHero: data.enableHero ?? true,
            enableAbout: data.enableAbout ?? true,
            enableDepartments: data.enableDepartments ?? true,
            enableAnnouncements: data.enableAnnouncements ?? true,
            enableNews: data.enableNews ?? true,
            enableGallery: data.enableGallery ?? true,
            enableDonations: data.enableDonations ?? true,
            enableContact: data.enableContact ?? true
          });
        }

        // 2. Fetch About Intro
        const aboutSnap = await getDoc(doc(db, "site_settings", "about"));
        if (aboutSnap.exists()) {
          const data = aboutSnap.data();
          setAboutText(
            locale === "ur" ? data.introUr : locale === "ar" ? data.introAr : data.introEn
          );
        }

        // 3. Fetch contact info
        const contactSnap = await getDoc(doc(db, "site_settings", "contact"));
        if (contactSnap.exists()) {
          setContactInfo(contactSnap.data());
        }

        // 4. Fetch dynamic content lists
        const [announceSnap, newsSnap, gallerySnap] = await Promise.all([
          getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3))),
          getDocs(query(collection(db, "news"), orderBy("createdAt", "desc"), limit(3))),
          getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc"), limit(4)))
        ]);

        setAnnouncements(announceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setNewsList(newsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setGalleryImages(gallerySnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Error loading homepage CMS details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomepageData();
  }, [locale]);

  const labels = {
    ur: {
      aboutTitle: "جامعہ کے بارے میں",
      readMore: "مزید پڑھیں",
      announcements: "تازہ ترین اعلانات",
      news: "سرگرمیاں اور خبریں",
      gallery: "تصویری گیلری",
      donations: "عطیات اور مالی تعاون",
      donationsSub: "تعلیمی اور تعمیراتی فنڈ میں اپنا حصہ ملائیں۔",
      donateBtn: "تعاون کریں",
      contactTitle: "رابطہ کی معلومات",
      address: "پتہ",
      phone: "فون نمبرز"
    },
    ar: {
      aboutTitle: "عن الجامعة",
      readMore: "اقرأ المزيد",
      announcements: "آخر الإعلانات",
      news: "الأخبار والفعاليات",
      gallery: "معرض الصور",
      donations: "التبرعات والدعم المالي",
      donationsSub: "ساهم في الصناديق التعليمية والإنشائية.",
      donateBtn: "تبرع الآن",
      contactTitle: "معلومات الاتصال",
      address: "العنوان",
      phone: "أرقام الهواتف"
    },
    en: {
      aboutTitle: "About Jamia",
      readMore: "Read More",
      announcements: "Latest Announcements",
      news: "Activities & News",
      gallery: "Gallery Showcase",
      donations: "Donations & Construction Support",
      donationsSub: "Contribute to the academic and developmental initiatives of Jamia.",
      donateBtn: "Support Us",
      contactTitle: "Contact Information",
      address: "Address",
      phone: "Phone Numbers"
    }
  }[locale] || {
    aboutTitle: "About Jamia",
    readMore: "Read More",
    announcements: "Latest Announcements",
    news: "Activities & News",
    gallery: "Gallery Showcase",
    donations: "Donations Support",
    donationsSub: "Contribute to the academic initiatives.",
    donateBtn: "Support Us",
    contactTitle: "Contact Information",
    address: "Address",
    phone: "Phone"
  };

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      {toggles.enableHero && <Hero />}

      {/* About Section */}
      {toggles.enableAbout && aboutText && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{labels.aboutTitle}</h2>
            <div className={styles.aboutBox}>
              <p className={styles.aboutText}>{aboutText}</p>
              <Link href="/about" className={styles.ctaLink}>{labels.readMore} &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      {/* Donation Support Strip — placed after About, before Departments for max visibility */}
      {toggles.enableDonations && <DonationStrip />}

      {/* Departments Section */}
      {toggles.enableDepartments && <DepartmentsSection />}


      {/* Announcements Section */}
      {toggles.enableAnnouncements && announcements.length > 0 && (
        <section className={styles.section} style={{ backgroundColor: "#f3f4f6" }}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{labels.announcements}</h2>
            <div className={styles.announcementsGrid}>
              {announcements.map((ann) => (
                <div key={ann.id} className={styles.annCard}>
                  <span className={styles.annDate}>{new Date(ann.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                  <h3>{locale === "ur" ? ann.titleUr : locale === "ar" ? ann.titleAr : ann.titleEn || ann.title}</h3>
                  <p>{locale === "ur" ? ann.contentUr : locale === "ar" ? ann.contentAr : ann.contentEn || ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News & Activities Section */}
      {toggles.enableNews && newsList.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{labels.news}</h2>
            <div className={styles.newsGrid}>
              {newsList.map((news) => (
                <div key={news.id} className={styles.newsCard}>
                  {news.imageUrl && <img src={news.imageUrl} alt={news.title} className={styles.newsImage} />}
                  <div className={styles.newsContent}>
                    <span className={styles.newsDate}>{new Date(news.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                    <h3>{locale === "ur" ? news.titleUr : locale === "ar" ? news.titleAr : news.titleEn || news.title}</h3>
                    <p>{locale === "ur" ? news.descUr : locale === "ar" ? news.descAr : news.descEn || news.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {toggles.enableGallery && galleryImages.length > 0 && (
        <section className={styles.section} style={{ backgroundColor: "#f3f4f6" }}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{labels.gallery}</h2>
            <div className={styles.galleryGrid}>
              {galleryImages.map((img) => (
                <div key={img.id} className={styles.galleryItem}>
                  <img src={img.imageUrl} alt={img.title || "Gallery"} className={styles.galleryImage} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* Contact Section */}
      {toggles.enableContact && contactInfo && (
        <section className={styles.section} style={{ borderTop: "1px solid #e5e7eb" }}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{labels.contactTitle}</h2>
            <div className={styles.contactDetailsGrid}>
              <div className={styles.contactCard}>
                <h3>{labels.address}</h3>
                <p>{contactInfo.address}</p>
                {contactInfo.googleMapsUrl && (
                  <a href={contactInfo.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                    {locale === "ur" ? "گوگل نقشہ پر دیکھیں" : locale === "ar" ? "عرض الخريطة" : "Google Maps"}
                  </a>
                )}
              </div>
              <div className={styles.contactCard}>
                <h3>{labels.phone}</h3>
                <p>General: <a href={`tel:${contactInfo.phoneGeneral}`}>{contactInfo.phoneGeneral}</a></p>
                <p>Admin: <a href={`tel:${contactInfo.phoneAdmin}`}>{contactInfo.phoneAdmin}</a></p>
                {contactInfo.whatsapp && (
                  <p>WhatsApp: <a href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer">{contactInfo.whatsapp}</a></p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
