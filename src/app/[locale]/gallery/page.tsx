"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../about/page.module.css";

export default function GalleryPage() {
  const locale = useLocale();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // No orderBy — avoids composite index requirement. Sort client-side.
        const snap = await getDocs(collection(db, "gallery"));
        const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt descending, client-side
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setGallery(items);
      } catch (err: any) {
        console.error("Error fetching gallery", err);
        // Show empty state instead of error — data may be missing or rules not yet deployed
        setGallery([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const getTitle = (item: any) => {
    if (locale === "ur" && item.titleUr) return item.titleUr;
    if (locale === "ar" && item.titleAr) return item.titleAr;
    return item.titleEn || item.title || "";
  };

  const pageTitle =
    locale === "ur" ? "تصویری گیلری" : locale === "ar" ? "معرض الصور" : "Photo Gallery";
  const loadingText =
    locale === "ur" ? "گیلری لوڈ ہو رہی ہے..." : locale === "ar" ? "جاري التحميل..." : "Loading gallery...";
  const emptyText =
    locale === "ur" ? "ابھی تک گیلری میں کوئی تصویر نہیں۔" : locale === "ar" ? "لا توجد صور في المعرض حتى الآن." : "No photos in the gallery yet.";

  return (
    <main className={styles.aboutPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{pageTitle}</h1>
        </div>
      </header>

      {/* Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, cursor: "pointer"
          }}
        >
          <img
            src={selectedImage}
            alt="Gallery"
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "4px", objectFit: "contain" }}
          />
        </div>
      )}

      <div className={styles.container}>
        {loading ? (
          <div className={styles.introSection}><p>{loadingText}</p></div>
        ) : gallery.length === 0 ? (
          <div className={styles.introSection}><p>{emptyText}</p></div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem"
            }}
          >
            {gallery.map(item => (
              <div
                key={item.id}
                className={styles.card}
                style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}
                onClick={() => setSelectedImage(item.imageUrl)}
              >
                <img
                  src={item.imageUrl}
                  alt={getTitle(item)}
                  style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                />
                {getTitle(item) && (
                  <div style={{ padding: "1rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1rem" }}>{getTitle(item)}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
