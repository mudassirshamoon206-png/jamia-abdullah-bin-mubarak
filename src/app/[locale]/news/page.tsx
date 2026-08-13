"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../about/page.module.css";

export default function NewsPage() {
  const locale = useLocale();
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // No orderBy — avoids composite index requirement. Sort client-side.
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
            {news.length === 0 && (
              <div className={styles.card}>
                <p>{emptyText}</p>
              </div>
            )}
            {news.map(item => (
              <div key={item.id} className={styles.card}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={getTitle(item)} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px", marginBottom: "1rem" }} />
                )}
                <h3>{getTitle(item)}</h3>
                {item.createdAt && (
                  <p style={{ fontSize: "0.85rem", color: "gray" }}>
                    {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                )}
                <p>{getContent(item)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
