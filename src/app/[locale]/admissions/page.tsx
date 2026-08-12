"use client";

import { useTranslations, useLocale } from "next-intl";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function AdmissionsPage() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const [formData, setFormData] = useState({
    studentName: "",
    fatherName: "",
    dob: "",
    mobileNumber: "",
    whatsappNumber: "",
    address: "",
    previousEducation: "",
    desiredDepartment: "",
    additionalInfo: ""
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const snap = await getDocs(collection(db, "departments"));
        if (!snap.empty) {
          setDepartments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          // Default fallbacks
          setDepartments([
            { id: "hifz", nameEn: "Hifz-ul-Quran", nameUr: "حفظ القرآن", nameAr: "حفظ القرآن" },
            { id: "nazira", nameEn: "Nazira & Tajweed", nameUr: "ناظرہ و تجوید", nameAr: "ناظرہ و تجوید" },
            { id: "dars", nameEn: "Dars-e-Nizami", nameUr: "درس نظامی", nameAr: "درس نظامی" },
            { id: "school", nameEn: "School Education", nameUr: "اسکول", nameAr: "اسکول" }
          ]);
        }
      } catch (err) {
        console.error("Error loading departments for admissions:", err);
      }
    };
    fetchDepartments();
  }, []);

  // Update default desired department once departments load
  useEffect(() => {
    if (departments.length > 0 && !formData.desiredDepartment) {
      setFormData(prev => ({ ...prev, desiredDepartment: departments[0].id }));
    }
  }, [departments, formData.desiredDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "admissions"), {
        ...formData,
        status: "pending",
        submittedAt: new Date()
      });
      setSuccess(true);
      setFormData({
        studentName: "",
        fatherName: "",
        dob: "",
        mobileNumber: "",
        whatsappNumber: "",
        address: "",
        previousEducation: "",
        desiredDepartment: departments[0]?.id || "",
        additionalInfo: ""
      });
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedDeptName = (dept: any) => {
    if (locale === "ur" && dept.nameUr) return dept.nameUr;
    if (locale === "ar" && dept.nameAr) return dept.nameAr;
    return dept.nameEn || dept.name || dept.id;
  };

  const labels = {
    ur: {
      title: "آن لائن داخلہ فارم",
      intro: "جامعہ عبداللہ بن مبارک میں خوش آمدید۔ براہ کرم نیچے دیا گیا داخلہ فارم پُر کریں، ہماری انتظامیہ جلد ہی آپ سے رابطہ کرے گی۔",
      name: "طالب علم کا نام",
      fatherName: "والد کا نام",
      dob: "تاریخ پیدائش",
      mobile: "موبائل نمبر",
      whatsapp: "واٹس ایپ نمبر",
      prevEdu: "پچھلی تعلیم",
      dept: "مطلوبہ شعبہ",
      address: "پتہ",
      additional: "اضافی معلومات / دستاویزات کے لنکس",
      submit: "درخواست جمع کریں",
      requirements: "ضروری دستاویزات",
      req1: "پچھلی تعلیمی اسناد کی کاپی",
      req2: "پیدائشی سرٹیفکیٹ یا ب فارم",
      req3: "پاسپورٹ سائز تصاویر",
      req4: "سرپرست کے شناختی کارڈ کی کاپی"
    },
    ar: {
      title: "طلب القبول الإلكتروني",
      intro: "مرحباً بكم في جامعة عبد الله بن مبارك. يرجى ملء نموذج طلب القبول أدناه، وسيتصل بكم فريق القبول قريباً.",
      name: "اسم الطالب",
      fatherName: "اسم الأب",
      dob: "تاريخ الميلاد",
      mobile: "رقم الجوال",
      whatsapp: "رقم الواتساب",
      prevEdu: "التعليم السابق",
      dept: "القسم المطلوب",
      address: "العنوان",
      additional: "معلومات إضافية / روابط المستندات",
      submit: "تقديم الطلب",
      requirements: "المستندات المطلوبة",
      req1: "نسخة من السجلات الأكاديمية السابقة",
      req2: "شهادة الميلاد أو نموذج ب",
      req3: "صور شخصية بحجم جواز السفر",
      req4: "نسخة من بطاقة الهوية للولي"
    },
    en: {
      title: "Online Admission Form",
      intro: "Welcome to Jamia Abdullah Bin Mubarak. Please fill out the online application form below, and our admissions team will contact you shortly.",
      name: "Student Name",
      fatherName: "Father's Name",
      dob: "Date of Birth",
      mobile: "Mobile Number",
      whatsapp: "WhatsApp Number",
      prevEdu: "Previous Education",
      dept: "Desired Department",
      address: "Address",
      additional: "Additional Info / Document Links",
      submit: "Submit Application",
      requirements: "Required Documents",
      req1: "Copy of previous academic records",
      req2: "Birth certificate or B-Form",
      req3: "Passport size photographs",
      req4: "Guardian's CNIC copy"
    }
  }[locale] || {
    title: "Online Admission Form",
    intro: "Welcome to Jamia Abdullah Bin Mubarak. Please fill out the online application form below, and our admissions team will contact you shortly.",
    name: "Student Name",
    fatherName: "Father's Name",
    dob: "Date of Birth",
    mobile: "Mobile Number",
    whatsapp: "WhatsApp Number",
    prevEdu: "Previous Education",
    dept: "Desired Department",
    address: "Address",
    additional: "Additional Info / Document Links",
    submit: "Submit Application",
    requirements: "Required Documents",
    req1: "Copy of previous academic records",
    req2: "Birth certificate or B-Form",
    req3: "Passport size photographs",
    req4: "Guardian's CNIC copy"
  };

  return (
    <main className={styles.admissionsPage}>
      <header className={styles.pageHeader}>
        <div className={styles.overlay}>
          <h1>{t("admissions")}</h1>
        </div>
      </header>
      
      <div className={styles.container}>
        <div className={styles.infoSection}>
          <h2>{labels.requirements}</h2>
          <p>{labels.intro}</p>
          <ul className={styles.requirementsList}>
            <li>{labels.req1}</li>
            <li>{labels.req2}</li>
            <li>{labels.req3}</li>
            <li>{labels.req4}</li>
          </ul>
        </div>

        <div className={styles.formSection}>
          <h2>{labels.title}</h2>
          {success ? (
            <div className={styles.successMessage}>
              {locale === "ur" 
                ? "آپ کا داخلہ فارم کامیابی کے ساتھ جمع ہو گیا ہے! ہم جلد ہی آپ سے رابطہ کریں گے۔"
                : locale === "ar"
                ? "تم تقديم طلب القبول الخاص بك بنجاح! سوف نتصل بك قريباً."
                : "Your application has been submitted successfully! We will contact you soon."}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>{labels.name}</label>
                <input required type="text" value={formData.studentName} onChange={(e) => setFormData({...formData, studentName: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>{labels.fatherName}</label>
                <input required type="text" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
              </div>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label>{labels.dob}</label>
                  <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>{labels.mobile}</label>
                  <input required type="tel" value={formData.mobileNumber} onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
              </div>
              <div className={styles.grid2}>
                <div className={styles.inputGroup}>
                  <label>{labels.whatsapp}</label>
                  <input required type="tel" value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} />
                </div>
                <div className={styles.inputGroup}>
                  <label>{labels.prevEdu}</label>
                  <input required type="text" value={formData.previousEducation} onChange={(e) => setFormData({...formData, previousEducation: e.target.value})} />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>{labels.dept}</label>
                <select required value={formData.desiredDepartment} onChange={(e) => setFormData({...formData, desiredDepartment: e.target.value})}>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {getLocalizedDeptName(dept)}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>{labels.address}</label>
                <textarea required rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
              </div>
              <div className={styles.inputGroup}>
                <label>{labels.additional}</label>
                <input type="text" value={formData.additionalInfo} onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})} placeholder="e.g. Guardian CNIC link or special notes" />
              </div>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? "Submitting..." : labels.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
