"use client";

import { useTranslations, useLocale } from "next-intl";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function ContactPage() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [contact, setContact] = useState({
    address: "Near City Hospital, Nagina Chowk, Pakpattan, 57400, Pakistan",
    phoneGeneral: "0328-7423123",
    phoneAdmin: "0303-7516220",
    adminName: "Muhammad Tayyab Mahmood",
    phoneDirector: "0300-8751075",
    directorName: "Mufti Azhar-ul-Haq",
    phoneGenSec: "0300-7837535",
    genSecName: "Rana Muhammad Khalil Ahmad",
    googleMapsUrl: "https://maps.google.com/?q=Nagina+Chowk,+Pakpattan",
    whatsapp: "03037516220"
  });

  const [socials, setSocials] = useState({
    facebook: "https://www.facebook.com/Jamia.Abdullah.Bin.Mubarak.Pakpattan",
    youtube: "https://www.youtube.com/watch?v=WrcbJ7L5CJI"
  });

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const [contactSnap, socialSnap] = await Promise.all([
          getDoc(doc(db, "site_settings", "contact")),
          getDoc(doc(db, "site_settings", "social"))
        ]);
        if (contactSnap.exists()) {
          const data = contactSnap.data();
          setContact({
            address: data.address || contact.address,
            phoneGeneral: data.phoneGeneral || contact.phoneGeneral,
            phoneAdmin: data.phoneAdmin || contact.phoneAdmin,
            adminName: data.adminName || contact.adminName,
            phoneDirector: data.phoneDirector || contact.phoneDirector,
            directorName: data.directorName || contact.directorName,
            phoneGenSec: data.phoneGenSec || contact.phoneGenSec,
            genSecName: data.genSecName || contact.genSecName,
            googleMapsUrl: data.googleMapsUrl || contact.googleMapsUrl,
            whatsapp: data.whatsapp || contact.whatsapp
          });
        }
        if (socialSnap.exists()) {
          const data = socialSnap.data();
          setSocials({
            facebook: data.facebook || socials.facebook,
            youtube: data.youtube || socials.youtube
          });
        }
      } catch (err) {
        console.error("Error loading contact settings:", err);
      }
    };
    fetchContactSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    ur: {
      title: "ہم سے رابطہ کریں",
      address: "پتہ",
      phone: "فون نمبرز",
      general: "عمومی رابطہ",
      director: "ڈائریکٹر (ڈائریکٹر آفس)",
      admin: "انتظامیہ (ڈائریکٹر)",
      genSec: "جنرل سیکرٹری",
      whatsapp: "واٹس ایپ رابطہ",
      maps: "گوگل نقشہ پر دیکھیں",
      socials: "ہمارے سوشل میڈیا اکاؤنٹس",
      formTitle: "پیغام بھیجیں",
      submit: "پیغام بھیجیں",
      success: "آپ کا پیغام کامیابی کے ساتھ موصول ہو گیا ہے!"
    },
    ar: {
      title: "اتصل بنا",
      address: "العنوان",
      phone: "أرقام الهواتف",
      general: "الاتصال العام",
      director: "المدير (مكتب المدير)",
      admin: "الإدارة (المدير)",
      genSec: "الأمين العام",
      whatsapp: "اتصال واتساب",
      maps: "عرض على خرائط جوجل",
      socials: "حساباتنا على وسائل التواصل",
      formTitle: "أرسل لنا رسالة",
      submit: "إرسال الرسالة",
      success: "تم إرسال رسالتك بنجاح!"
    },
    en: {
      title: "Contact Us",
      address: "Address",
      phone: "Phone Numbers",
      general: "General Contact",
      director: "Director",
      admin: "Administration",
      genSec: "General Secretary",
      whatsapp: "WhatsApp Us",
      maps: "View on Google Maps",
      socials: "Connect with Us",
      formTitle: "Send us a Message",
      submit: "Send Message",
      success: "Your message has been sent successfully!"
    }
  }[locale] || {
    title: "Contact Us",
    address: "Address",
    phone: "Phone Numbers",
    general: "General Contact",
    director: "Director",
    admin: "Administration",
    genSec: "General Secretary",
    whatsapp: "WhatsApp Us",
    maps: "View on Google Maps",
    socials: "Connect with Us",
    formTitle: "Send us a Message",
    submit: "Send Message",
    success: "Your message has been sent successfully!"
  };

  return (
    <main className={styles.contactPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{t("contact")}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Jamia details */}
          <div className={styles.infoSection}>
            <h2>{labels.title}</h2>
            
            <div className={styles.contactItem}>
              <h3>{labels.address}</h3>
              <p>{contact.address}</p>
              {contact.googleMapsUrl && (
                <a href={contact.googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.mapsBtn}>
                  {labels.maps}
                </a>
              )}
            </div>

            <div className={styles.contactItem}>
              <h3>{labels.phone}</h3>
              
              <div className={styles.phoneList}>
                <div className={styles.phoneDetail}>
                  <strong>{labels.general}:</strong>{" "}
                  <a href={`tel:${contact.phoneGeneral}`} className={styles.telLink}>{contact.phoneGeneral}</a>
                </div>
                
                <div className={styles.phoneDetail}>
                  <strong>{contact.adminName} ({labels.admin}):</strong>{" "}
                  <a href={`tel:${contact.phoneAdmin}`} className={styles.telLink}>{contact.phoneAdmin}</a>
                </div>

                <div className={styles.phoneDetail}>
                  <strong>{contact.directorName} ({labels.director}):</strong>{" "}
                  <a href={`tel:${contact.phoneDirector}`} className={styles.telLink}>{contact.phoneDirector}</a>
                </div>

                <div className={styles.phoneDetail}>
                  <strong>{contact.genSecName} ({labels.genSec}):</strong>{" "}
                  <a href={`tel:${contact.phoneGenSec}`} className={styles.telLink}>{contact.phoneGenSec}</a>
                </div>
              </div>
            </div>

            {contact.whatsapp && (
              <div className={styles.contactItem}>
                <h3>{labels.whatsapp}</h3>
                <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
                  WhatsApp Chat
                </a>
              </div>
            )}

            <div className={styles.contactItem}>
              <h3>{labels.socials}</h3>
              <div className={styles.socialIconsGrid}>
                {socials.facebook && (
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                    Facebook Page
                  </a>
                )}
                {socials.youtube && (
                  <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialBtn} style={{ backgroundColor: "#FF0000" }}>
                    YouTube Channel
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className={styles.formSection}>
            <h2>{labels.formTitle}</h2>
            {success ? (
              <div className={styles.successAlert}>
                {labels.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label>Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Message</label>
                  <textarea 
                    rows={5}
                    value={formData.message} 
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required 
                  ></textarea>
                </div>
                <button type="submit" disabled={loading} className={styles.submitBtn}>
                  {loading ? "Sending..." : labels.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
