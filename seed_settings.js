const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  console.log("Seeding Jamia Settings...");
  try {
    console.log("Authenticating Super Admin...");
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.local to run the seed script.");
    }
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("Authentication successful, updating documents...");
    
    // 1. General Identity Settings
    await setDoc(doc(db, "site_settings", "identity"), {
      siteName: "Jamia Abdullah Bin Mubarak",
      urduName: "جامعہ عبداللہ بن مبارک",
      arabicName: "جامعة عبد الله بن مبارک",
      description: "An Islamic educational institution in Pakpattan committed to religious and contemporary education.",
      seoTitle: "Jamia Abdullah Bin Mubarak, Pakpattan",
      seoDescription: "Official portal of Jamia Abdullah Bin Mubarak, Pakpattan. Offering quality religious and contemporary education."
    }, { merge: true });

    // 2. Contact Settings
    await setDoc(doc(db, "site_settings", "contact"), {
      address: "Near City Hospital, Nagina Chowk, Pakpattan, 57400, Pakistan",
      googleMapsUrl: "https://maps.google.com/?q=Nagina+Chowk,+Pakpattan",
      email: "info@jamiaabdullah.edu.pk",
      phoneGeneral: "0328-7423123",
      phoneAdmin: "0303-7516220",
      adminName: "Muhammad Tayyab Mahmood",
      phoneDirector: "0300-8751075",
      directorName: "Mufti Azhar-ul-Haq",
      phoneGenSec: "0300-7837535",
      genSecName: "Rana Muhammad Khalil Ahmad",
      phone: "0328-7423123", // fallback compatibility
      whatsapp: "03037516220" // default whatsapp
    }, { merge: true });

    // 3. Social settings
    await setDoc(doc(db, "site_settings", "social"), {
      facebook: "https://www.facebook.com/Jamia.Abdullah.Bin.Mubarak.Pakpattan",
      youtube: "https://www.youtube.com/watch?v=WrcbJ7L5CJI"
    }, { merge: true });

    // 4. Homepage settings
    await setDoc(doc(db, "site_settings", "homepage"), {
      heroTitle: "Jamia Abdullah Bin Mubarak, Pakpattan",
      heroTitleUr: "جامعہ عبداللہ بن مبارک، پاکپتن",
      heroTitleAr: "جامعة عبد الله بن مبارک، باکبتان",
      heroDesc: "Religious and Contemporary Education",
      heroDescUr: "دینی و عصری علوم کی معیاری تعلیم",
      heroDescAr: "التعليم الديني والعصري المتميز",
      enableHero: true,
      enableAbout: true,
      enableDepartments: true,
      enableAnnouncements: true,
      enableNews: true,
      enableGallery: true,
      enableDonations: true,
      enableContact: true
    }, { merge: true });

    // 5. About settings
    await setDoc(doc(db, "site_settings", "about"), {
      introEn: "Jamia Abdullah Bin Mubarak is an Islamic educational institution committed to providing quality religious and contemporary education. The institution focuses on Islamic learning while also giving importance to contemporary education and the intellectual and educational development of its students.",
      introUr: "جامعہ عبداللہ بن مبارک ایک اسلامی تعلیمی ادارہ ہے جو دینی و عصری علوم کی معیاری تعلیم فراہم کرنے کے لیے قائم ہے۔ جامعہ دینی تعلیم کے ساتھ عصری علوم کو بھی اہمیت دیتا ہے اور طلبہ کی علمی، دینی اور تعلیمی تربیت و ترقی کے لیے کوشاں ہے۔",
      introAr: "جامعة عبد الله بن مبارك هي مؤسسة تعليمية إسلامية ملتزمة بتقديم تعليم ديني ومعاصر متميز. يركز المعهد على العلوم الإسلامية مع إيلاء الأهمية للتعليم الحديث والتطوير الفكري والتربوي لطلابه.",
      missionEn: "To nurture individuals with profound Islamic knowledge, moral integrity, and practical contemporary skills.",
      missionUr: "ایسے افراد کی تربیت کرنا جو گہرے اسلامی علم، اخلاقی دیانت، اور عملی عصری مہارتوں سے آراستہ ہوں۔",
      missionAr: "إعداد أفراد ذوي معرفة إسلامية عميقة، ونزاهة أخلاقية، ومهارات عملية معاصرة.",
      visionEn: "To be a leading beacon of balanced religious and contemporary education.",
      visionUr: "متوازن دینی و عصری تعلیم کا ایک ممتاز اور مثالی ادارہ بننا۔",
      visionAr: "أن نكون منارة رائدة للتعليم الديني والمعاصر المتوازن.",
      objectivesEn: "Provide quality Islamic and contemporary education; foster spiritual and ethical growth; develop leadership qualities in students.",
      objectivesUr: "معیاری دینی و عصری تعلیم فراہم کرنا؛ روحانی اور اخلاقی تربیت؛ طلبہ میں قیادت کی صلاحیتیں پیدا کرنا۔",
      objectivesAr: "تقديم تعليم إسلامي ومعاصر متميز؛ تعزيز النمو الروحي والأخلاقي؛ تنمية المهارات القيادية لدى الطلاب.",
      servicesEn: "Hifz-ul-Quran, Dars-e-Nizami, modern schooling facilities, computer education.",
      servicesUr: "حفظ القرآن، درس نظامی، جدید اسکولنگ کی سہولیات، اور کمپیوٹر کی تعلیم۔",
      servicesAr: "حفظ القرآن الكريم، درس نظامي، مرافق مدرسية حديثة، وتعليم الكمبيوتر.",
      futurePlansEn: "Expansion of academic blocks, introduction of specialized research programs, digital classroom transformation.",
      futurePlansUr: "تعلیمی بلاکس کی توسیع، خصوصی تحقیقی پروگراموں کا آغاز، اور ڈیجیٹل کلاس رومز کی فراہمی۔",
      futurePlansAr: "توسيع المباني الأكاديمية، إدخال برامج بحثية متخصصة، والتحول الرقمي للفصول الدراسية."
    }, { merge: true });

    // 6. Donation settings
    await setDoc(doc(db, "site_settings", "donation"), {
      bankName: "",
      accountTitle: "",
      accountNumber: "",
      iban: "",
      easypaisaNumber: "",
      easypaisaTitle: "",
      jazzcashNumber: "",
      jazzcashTitle: "",
      raastId: "",
      instructionsEn: "Support the construction and educational initiatives of Jamia Abdullah Bin Mubarak. All donation fields are editable from the Admin Panel.",
      instructionsUr: "جامعہ عبداللہ بن مبارک کے تعمیراتی اور تعلیمی منصوبوں میں تعاون کریں۔ تمام تفصیلات ایڈمن پینل سے قابل ترمیم ہیں۔",
      instructionsAr: "ادعم المشاريع الإنشائية والتعليمية لجامعة عبد الله بن مبارك. جميع تفاصيل التبرع قابلة للتعديل من لوحة التحكم."
    }, { merge: true });

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed: ", error);
    process.exit(1);
  }
}

seed();
