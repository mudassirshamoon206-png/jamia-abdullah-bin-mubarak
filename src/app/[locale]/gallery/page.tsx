"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useLocale } from "next-intl";
import styles from "../courses/page.module.css";

export default function GalleryPage() {
  const locale = useLocale();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const snap = await getDocs(collection(db, "gallery"));
        const items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        items.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds ?? 0;
          const bTime = b.createdAt?.seconds ?? 0;
          return bTime - aTime;
        });
        setImages(items);
      } catch (err: any) {
        console.error("Error fetching gallery", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const pageTitle =
    locale === "ur" ? "تصویری گیلری" : locale === "ar" ? "معرض الصور" : "Image Gallery";
  const loadingText =
    locale === "ur" ? "تصاویر لوڈ ہو رہی ہیں..." : locale === "ar" ? "جاري تحميل الصور..." : "Loading gallery...";
  const emptyText =
    locale === "ur" ? "گیلری میں کوئی تصویر موجود نہیں۔" : locale === "ar" ? "لا توجد صور في المعرض." : "No images found in the gallery.";

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
          ) : images.length === 0 ? (
            <p className={styles.noData}>{emptyText}</p>
          ) : (
            <div className={styles.grid}>
              {images.map(img => (
                <div key={img.id} className={styles.card}>
                  <div className={styles.imageContainer}>
                    <img src={img.imageUrl} alt={img.title || "Gallery Image"} className={styles.image} />
                  </div>
                  {img.title && (
                    <div className={styles.cardContent}>
                      <h3 style={{ margin: 0, textAlign: "center" }}>{img.title}</h3>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
