# Jamia Abdullah Bin Mubarak — Official Web Portal

> **جامعہ عبداللہ بن مبارک، پاکپتن**  
> A professional multilingual website and administration portal for Jamia Abdullah Bin Mubarak, Pakpattan, Pakistan.

---

## 🌐 Overview

This is the official digital portal for **Jamia Abdullah Bin Mubarak, Pakpattan** — an Islamic educational institution committed to providing quality religious and contemporary education.

The portal includes a **public-facing multilingual website** and a **full-featured Admin Panel (CMS)** for managing all website content dynamically through Firebase.

---

## ✨ Main Features

### Public Website
- 🏠 **Home Page** — Hero section, About preview, Departments, Announcements, News, Gallery, Donations Strip, Contact
- 📖 **About** — Mission, Vision, Objectives, Services, Future Plans (CMS-driven)
- 🏫 **Departments** — Dynamic department listing with multilingual content
- 📚 **Courses** — Course details per department
- 👨‍🏫 **Teachers & Staff** — Leadership and faculty listing
- 📝 **Online Admissions** — Student admission form (submits to Firestore)
- 📰 **News & Activities** — Latest news with images
- 📅 **Events** — Upcoming events listing
- 🖼️ **Gallery** — Photo gallery with lightbox
- 💰 **Donations** — Payment methods configured by admin (Bank, Easypaisa, JazzCash, Raast)
- 📞 **Contact** — Contact info, WhatsApp, Google Maps, Message form
- 📱 **Floating Contact Button** — Persistent call/WhatsApp buttons on mobile

### Admin Panel (CMS)
- 🔐 Role-based access (Super Admin, Admin, Content Manager, HR Manager, Accountant, Admission Manager)
- ⚙️ **Site Settings** — Full CMS: Identity, Contact, Social Media, Homepage toggles, About content, Donation configuration
- 🏫 **Departments** — Create, edit, archive departments
- 📚 **Courses** — Manage courses per department
- 📰 **News** — Publish news articles
- 📅 **Events** — Create and manage events
- 🖼️ **Gallery** — Upload and manage gallery images
- 👨‍🏫 **Teachers** — Staff management
- 📝 **Admissions** — Review and manage admission applications
- 👤 **Profile & Security** — Update name, phone, email, password

### Multilingual Support
- 🇬🇧 **English** (LTR)
- 🇵🇰 **Urdu** (RTL — اردو)
- 🕌 **Arabic** (RTL — العربية)

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework |
| **React 19** | UI Library |
| **TypeScript** | Type Safety |
| **Firebase Auth** | Authentication |
| **Firebase Firestore** | Database |
| **Firebase Storage** | Media Storage |
| **next-intl** | Multilingual / i18n |
| **Vanilla CSS Modules** | Styling |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or later
- npm
- A Firebase project (see [Firebase Setup](#firebase-setup))

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/jamia-abdullah-bin-mubarak.git
cd jamia-abdullah-bin-mubarak
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase project values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# For admin scripts only:
ADMIN_EMAIL=your_admin_email@example.com
ADMIN_PASSWORD=your_secure_password
```

> ⚠️ **Never commit `.env.local` to version control.** It is already excluded by `.gitignore`.

---

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password
3. Enable **Firestore Database**
4. Enable **Storage**
5. Copy the Firebase web app config into your `.env.local`

### Create Super Admin

Run this once after Firebase is configured:

```bash
node --env-file=.env.local create_admin.js
```

### Seed Initial Site Settings

Populate Firestore with the initial Jamia content:

```bash
node --env-file=.env.local seed_settings.js
```

---

## 💻 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| URL | Description |
|---|---|
| `/en` | English public website |
| `/ur` | Urdu public website (RTL) |
| `/ar` | Arabic public website (RTL) |
| `/en/admin` | Admin Panel |
| `/en/login` | Admin Login |

---

## 🏗️ Production Build

```bash
npm run build
npm run start
```

---

## ☁️ Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add your `.env.local` variables to **Vercel → Settings → Environment Variables**
4. Deploy

### Other Platforms

Any platform supporting Node.js / Next.js can host this project (Railway, Render, DigitalOcean, etc.). Set the same environment variables in the hosting platform's settings.

---

## 🔒 Security Notes

- All Firebase credentials are stored in `.env.local` (excluded from Git)
- The Admin Panel requires authenticated Firebase users with appropriate roles
- Students/public users cannot access admin-only data
- No payment gateway API secrets are stored in the frontend — only admin-configured public payment info (bank names, account numbers) is displayed
- Firestore Security Rules should restrict read/write per role

---

## 🗂️ Project Structure

```
markaz-portal/
├── messages/          # i18n translation files (en.json, ur.json, ar.json)
├── public/            # Static assets
├── src/
│   ├── app/
│   │   └── [locale]/  # All pages (public + admin)
│   ├── components/
│   │   └── public/    # Public-facing components
│   ├── context/       # AuthContext
│   ├── i18n/          # Routing & locale config
│   └── lib/
│       └── firebase/  # Firebase config & Firestore helpers
├── .env.example       # Environment variable template
├── .gitignore
├── create_admin.js    # One-time admin setup script
├── seed_settings.js   # One-time database seed script
├── integration_test.js # Automated test script
└── README.md
```

---

## 📄 License

This project is private and developed for **Jamia Abdullah Bin Mubarak, Pakpattan**. All rights reserved.

---

*جامعہ عبداللہ بن مبارک، پاکپتن — دینی و عصری علوم کی معیاری تعلیم*
