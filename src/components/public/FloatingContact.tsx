"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import styles from "./FloatingContact.module.css";

export default function FloatingContact() {
  const [contact, setContact] = useState({ phone: "", whatsapp: "" });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const siteRef = doc(db, "site_settings", "contact");
        const snap = await getDoc(siteRef);
        if (snap.exists()) {
          setContact({
            phone: snap.data().phoneGeneral || snap.data().phone || "",
            whatsapp: snap.data().whatsapp || ""
          });
        }
      } catch (err) {
        console.error("Error fetching site contact settings:", err);
      }
    };
    fetchContact();
  }, []);

  if (!contact.phone && !contact.whatsapp) return null;

  return (
    <div className={styles.floatingContainer}>
      {contact.phone && (
        <a href={`tel:${contact.phone}`} className={`${styles.actionBtn} ${styles.phoneBtn}`} aria-label="Call Us">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
          </svg>
        </a>
      )}
      {contact.whatsapp && (
        <a href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className={`${styles.actionBtn} ${styles.whatsappBtn}`} aria-label="WhatsApp Us">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.91-9.91-9.91zm5.44 14.28c-.23.65-1.34 1.21-1.85 1.27-.47.06-1.05.1-3.37-.86-2.8-1.17-4.63-4.04-4.77-4.23-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.27.56-.34.75-.34.19 0 .38 0 .54.01.17.01.4-.07.63.48.23.57.77 1.88.84 2.02.07.14.12.31.02.51-.1.2-.15.32-.3.49-.15.17-.32.37-.45.5-.15.15-.3.32-.13.61.17.29.76 1.26 1.65 2.05 1.15 1.02 2.1 1.34 2.39 1.48.29.14.46.12.63-.07.17-.19.74-.86.94-1.15.2-.29.4-.24.67-.14.27.1 1.72.81 2.02.96.3.15.5.22.57.34.07.12.07.72-.16 1.37z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
