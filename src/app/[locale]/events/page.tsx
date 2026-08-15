"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../courses/page.module.css";

export default function EventsPage() {
  const locale = useLocale();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, "events"));
        const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setEvents(items);
      } catch (err: any) {
        console.error("Error fetching events", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTitle = (item: any) => {
    return (locale === "ur" ? item.titleUr : locale === "ar" ? item.titleAr : item.titleEn) || item.title || "";
  };

  const getContent = (item: any) => {
    return (locale === "ur" ? item.descUr : locale === "ar" ? item.descAr : item.descEn) || item.description || item.content || "";
  };

  const pageTitle =
    locale === "ur" ? "تقریبات اور اعلانات" : locale === "ar" ? "الفعاليات والإعلانات" : "Events & Announcements";
  const loadingText =
    locale === "ur" ? "تقریبات لوڈ ہو رہی ہیں..." : locale === "ar" ? "جاري التحميل..." : "Loading events...";
  const emptyText =
    locale === "ur" ? "ابھی تک کوئی تقریب دستیاب نہیں۔" : locale === "ar" ? "لا توجد فعاليات متاحة حتى الآن." : "No events available at the moment.";

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{pageTitle}</h1>
        </div>
      </header>

      <div className={styles.container}>
        <section className={styles.section}>
          {loading ? (
            <p className={styles.loading}>{loadingText}</p>
          ) : events.length === 0 ? (
            <p className={styles.noData}>{emptyText}</p>
          ) : (
            <div className={styles.grid}>
              {events.map(item => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardContent}>
                    <h3>{getTitle(item)}</h3>
                    <div style={{ color: "var(--secondary-color)", fontWeight: "bold", marginBottom: "1rem" }}>
                       {item.date} {item.time && `| ${item.time}`}
                    </div>
                    <p>{getContent(item)}</p>
                    {item.location && (
                      <p style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
                        <strong>Location:</strong> {item.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
