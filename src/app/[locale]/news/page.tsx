"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../courses/page.module.css";

export default function NewsPage() {
  const locale = useLocale();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const snap = await getDocs(collection(db, "news"));
        const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setNews(items);
      } catch (err: any) {
        console.error("Error fetching news", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getTitle = (item: any) => {
    if (locale === "ur" && item.titleUr) return item.titleUr;
    if (locale === "ar" && item.titleAr) return item.titleAr;
    return item.titleEn || item.title || "";
  };

  const getContent = (item: any) => {
    if (locale === "ur" && item.descUr) return item.descUr;
    if (locale === "ar" && item.descAr) return item.descAr;
    return item.descEn || item.content || item.description || "";
  };

  const pageTitle =
    locale === "ur" ? "خبریں اور سرگرمیاں" : locale === "ar" ? "الأخبار والأنشطة" : "News & Activities";
  const loadingText =
    locale === "ur" ? "خبریں لوڈ ہو رہی ہیں..." : locale === "ar" ? "جاري التحميل..." : "Loading news...";
  const emptyText =
    locale === "ur" ? "ابھی تک کوئی خبر نہیں ملی۔" : locale === "ar" ? "لا توجد أخبار حتى الآن." : "No news articles found.";

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
          ) : news.length === 0 ? (
            <p className={styles.noData}>{emptyText}</p>
          ) : (
            <div className={styles.grid}>
              {news.map(item => (
                <div key={item.id} className={styles.card}>
                  {item.imageUrl ? (
                    <div className={styles.imageContainer}>
                      <img src={item.imageUrl} alt={getTitle(item)} className={styles.image} />
                    </div>
                  ) : (
                    <div className={styles.imageContainer} style={{ background: 'var(--primary-color)', opacity: 0.1 }} />
                  )}
                  <div className={styles.cardContent}>
                    <h3>{getTitle(item)}</h3>
                    {item.createdAt && (
                      <p style={{ fontSize: "0.85rem", color: "gray", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
                        {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                    <p>{getContent(item)}</p>
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
