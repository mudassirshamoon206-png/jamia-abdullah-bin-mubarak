"use client";

import { useEffect, useState } from "react";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../about/page.module.css";

export default function EventsPage() {
  const locale = useLocale();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setEvents(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      } catch (err: any) {
        console.error("Error fetching events", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTitle = (item: any) => {
    if (locale === "ur" && item.titleUr) return item.titleUr;
    if (locale === "ar" && item.titleAr) return item.titleAr;
    return item.titleEn || item.title || "";
  };

  const getDescription = (item: any) => {
    if (locale === "ur" && item.descUr) return item.descUr;
    if (locale === "ar" && item.descAr) return item.descAr;
    return item.descEn || item.description || item.content || "";
  };

  const getLocation = (item: any) => {
    if (locale === "ur" && item.locationUr) return item.locationUr;
    if (locale === "ar" && item.locationAr) return item.locationAr;
    return item.locationEn || item.location || "";
  };

  const pageTitle =
    locale === "ur" ? "آنے والے پروگرام" : locale === "ar" ? "الفعاليات القادمة" : "Upcoming Events";
  const loadingText =
    locale === "ur" ? "پروگرام لوڈ ہو رہے ہیں..." : locale === "ar" ? "جاري التحميل..." : "Loading events...";
  const emptyText =
    locale === "ur" ? "ابھی تک کوئی پروگرام نہیں ملا۔" : locale === "ar" ? "لا توجد فعاليات حتى الآن." : "No upcoming events found.";
  const locationLabel =
    locale === "ur" ? "مقام" : locale === "ar" ? "الموقع" : "Location";

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{pageTitle}</h1>
        </div>
      </header>

      <div className={styles.container}>
        {loading ? (
          <div className={styles.introSection}><p>{loadingText}</p></div>
        ) : (
          <div className={styles.missionVision}>
            {events.map(item => (
              <div key={item.id} className={styles.card}>
                <h3>{getTitle(item)}</h3>
                {item.date && (
                  <p style={{ fontSize: "0.85rem", color: "var(--secondary-color)", fontWeight: "bold" }}>
                    {item.date} {item.time && `· ${item.time}`}
                  </p>
                )}
                {getLocation(item) && (
                  <p style={{ fontSize: "0.9rem" }}><strong>{locationLabel}:</strong> {getLocation(item)}</p>
                )}
                <p>{getDescription(item)}</p>
              </div>
            ))}
            {error && (
              <div className={styles.card} style={{ borderColor: "red" }}>
                <p style={{ color: "red" }}>{error}</p>
              </div>
            )}
            {!error && events.length === 0 && (
              <div className={styles.card}>
                <p>{emptyText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
