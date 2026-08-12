"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import styles from "./page.module.css";

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  
  // States for different documents
  const [profile, setProfile] = useState({ name: "", phone: "", bio: "" });
  const [identity, setIdentity] = useState({ siteName: "", urduName: "", arabicName: "", description: "", seoTitle: "", seoDescription: "" });
  const [contact, setContact] = useState({ address: "", googleMapsUrl: "", email: "", phoneGeneral: "", phoneAdmin: "", adminName: "", phoneDirector: "", directorName: "", phoneGenSec: "", genSecName: "", whatsapp: "" });
  const [social, setSocial] = useState({ facebook: "", youtube: "" });
  const [homepage, setHomepage] = useState({ heroTitle: "", heroTitleUr: "", heroTitleAr: "", heroDesc: "", heroDescUr: "", heroDescAr: "", enableHero: true, enableAbout: true, enableDepartments: true, enableAnnouncements: true, enableNews: true, enableGallery: true, enableDonations: true, enableContact: true });
  const [about, setAbout] = useState({ introEn: "", introUr: "", introAr: "", missionEn: "", missionUr: "", missionAr: "", visionEn: "", visionUr: "", visionAr: "", objectivesEn: "", objectivesUr: "", objectivesAr: "", servicesEn: "", servicesUr: "", servicesAr: "", futurePlansEn: "", futurePlansUr: "", futurePlansAr: "" });
  const [donation, setDonation] = useState({ bankName: "", accountTitle: "", accountNumber: "", iban: "", easypaisaNumber: "", easypaisaTitle: "", jazzcashNumber: "", jazzcashTitle: "", raastId: "", instructionsEn: "", instructionsUr: "", instructionsAr: "", stripTitleEn: "", stripTitleUr: "", stripTitleAr: "", stripDescEn: "", stripDescUr: "", stripDescAr: "", stripBtnEn: "", stripBtnUr: "", stripBtnAr: "", stripShowBtn: true });

  // Security Auth Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) return;
    const fetchAllSettings = async () => {
      try {
        const [profSnap, idSnap, contactSnap, socialSnap, homeSnap, aboutSnap, donSnap] = await Promise.all([
          getDoc(doc(db, "users", user.uid)),
          getDoc(doc(db, "site_settings", "identity")),
          getDoc(doc(db, "site_settings", "contact")),
          getDoc(doc(db, "site_settings", "social")),
          getDoc(doc(db, "site_settings", "homepage")),
          getDoc(doc(db, "site_settings", "about")),
          getDoc(doc(db, "site_settings", "donation"))
        ]);

        if (profSnap.exists()) {
          const data = profSnap.data();
          setProfile({ name: data.name || "", phone: data.phone || "", bio: data.bio || "" });
          setNewEmail(user.email || "");
        }
        if (idSnap.exists()) setIdentity(idSnap.data() as any);
        if (contactSnap.exists()) setContact(contactSnap.data() as any);
        if (socialSnap.exists()) setSocial(socialSnap.data() as any);
        if (homeSnap.exists()) setHomepage(homeSnap.data() as any);
        if (aboutSnap.exists()) setAbout(aboutSnap.data() as any);
        if (donSnap.exists()) setDonation(donSnap.data() as any);

      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (activeTab === "profile") {
        // Profile & Auth Save
        const userRef = doc(db, "users", user.uid);
        const updateData: any = { name: profile.name, phone: profile.phone, bio: profile.bio };

        const emailChanged = newEmail !== user.email && newEmail.trim() !== "";
        const passwordChanged = newPassword.trim() !== "";

        if (emailChanged || passwordChanged) {
          if (!currentPassword) {
            throw new Error("Current password is required to change email or password.");
          }
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);

          if (emailChanged) {
            await updateEmail(user, newEmail);
            updateData.email = newEmail;
          }
          if (passwordChanged) {
            await updatePassword(user, newPassword);
          }
        }

        await updateDoc(userRef, updateData);
        setCurrentPassword("");
        setNewPassword("");
      } else if (activeTab === "identity") {
        await setDoc(doc(db, "site_settings", "identity"), identity, { merge: true });
      } else if (activeTab === "contact") {
        await setDoc(doc(db, "site_settings", "contact"), contact, { merge: true });
        await setDoc(doc(db, "site_settings", "social"), social, { merge: true });
      } else if (activeTab === "homepage") {
        await setDoc(doc(db, "site_settings", "homepage"), homepage, { merge: true });
      } else if (activeTab === "about") {
        await setDoc(doc(db, "site_settings", "about"), about, { merge: true });
      } else if (activeTab === "donation") {
        await setDoc(doc(db, "site_settings", "donation"), donation, { merge: true });
      }

      setMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  if (role !== "super_admin" && role !== "admin") {
    return <div className={styles.container}><p>You are not authorized to view settings.</p></div>;
  }

  if (loading) return <div className={styles.container}><p>Loading CMS settings...</p></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Jamia Complete CMS Settings</h2>
        <p className={styles.helpText}>Configure everything on the public website dynamically from here.</p>
      </div>

      {/* Tabs list */}
      <div className={styles.tabsList}>
        <button onClick={() => setActiveTab("profile")} className={activeTab === "profile" ? styles.activeTab : ""}>Admin Profile</button>
        <button onClick={() => setActiveTab("identity")} className={activeTab === "identity" ? styles.activeTab : ""}>Site Identity & SEO</button>
        <button onClick={() => setActiveTab("contact")} className={activeTab === "contact" ? styles.activeTab : ""}>Contact & Socials</button>
        <button onClick={() => setActiveTab("homepage")} className={activeTab === "homepage" ? styles.activeTab : ""}>Homepage Hero</button>
        <button onClick={() => setActiveTab("about")} className={activeTab === "about" ? styles.activeTab : ""}>About Page</button>
        <button onClick={() => setActiveTab("donation")} className={activeTab === "donation" ? styles.activeTab : ""}>Donation Info</button>
      </div>

      {message.text && (
        <div className={message.type === "success" ? styles.successAlert : styles.errorAlert}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className={styles.form}>
        {/* Tab 1: Profile */}
        {activeTab === "profile" && (
          <div className={styles.card}>
            <h3>Public Profile & Password</h3>
            <div className={styles.inputGroup}>
              <label>Full Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Bio</label>
              <textarea value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} rows={3}></textarea>
            </div>
            <hr/>
            <h4>Change Email & Password</h4>
            <div className={styles.inputGroup}>
              <label>Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Required to change sensitive auth details" />
            </div>
            <div className={styles.inputGroup}>
              <label>New Email</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep old password" />
            </div>
          </div>
        )}

        {/* Tab 2: Identity */}
        {activeTab === "identity" && (
          <div className={styles.card}>
            <h3>Jamia Identity & SEO Configuration</h3>
            <div className={styles.inputGroup}>
              <label>Jamia Name (English)</label>
              <input type="text" value={identity.siteName} onChange={e => setIdentity({...identity, siteName: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Jamia Name (Urdu - جامعہ عبداللہ بن مبارک)</label>
              <input type="text" value={identity.urduName} onChange={e => setIdentity({...identity, urduName: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Jamia Name (Arabic - جامعة عبد الله بن مبارک)</label>
              <input type="text" value={identity.arabicName} onChange={e => setIdentity({...identity, arabicName: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Description / Sub-header text</label>
              <input type="text" value={identity.description} onChange={e => setIdentity({...identity, description: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>SEO Document Title (Meta Title)</label>
              <input type="text" value={identity.seoTitle} onChange={e => setIdentity({...identity, seoTitle: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>SEO Document Description (Meta Description)</label>
              <textarea value={identity.seoDescription} onChange={e => setIdentity({...identity, seoDescription: e.target.value})} rows={3}></textarea>
            </div>
          </div>
        )}

        {/* Tab 3: Contact */}
        {activeTab === "contact" && (
          <div className={styles.card}>
            <h3>Researched Contact Numbers & Social Links</h3>
            <div className={styles.inputGroup}>
              <label>Physical Address</label>
              <input type="text" value={contact.address} onChange={e => setContact({...contact, address: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Google Maps Link / Coordinates</label>
              <input type="text" value={contact.googleMapsUrl} onChange={e => setContact({...contact, googleMapsUrl: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Official Email Address</label>
              <input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>General Contact Phone</label>
              <input type="text" value={contact.phoneGeneral} onChange={e => setContact({...contact, phoneGeneral: e.target.value})} />
            </div>
            <hr/>
            <h4>Administrative Positions</h4>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Admin Director Name</label>
                <input type="text" value={contact.adminName} onChange={e => setContact({...contact, adminName: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Admin Director Phone</label>
                <input type="text" value={contact.phoneAdmin} onChange={e => setContact({...contact, phoneAdmin: e.target.value})} />
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Director Name</label>
                <input type="text" value={contact.directorName} onChange={e => setContact({...contact, directorName: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Director Phone</label>
                <input type="text" value={contact.phoneDirector} onChange={e => setContact({...contact, phoneDirector: e.target.value})} />
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>General Secretary Name</label>
                <input type="text" value={contact.genSecName} onChange={e => setContact({...contact, genSecName: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>General Secretary Phone</label>
                <input type="text" value={contact.phoneGenSec} onChange={e => setContact({...contact, phoneGenSec: e.target.value})} />
              </div>
            </div>
            <hr/>
            <div className={styles.inputGroup}>
              <label>Public WhatsApp Number</label>
              <input type="text" value={contact.whatsapp} onChange={e => setContact({...contact, whatsapp: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Facebook Page URL</label>
              <input type="text" value={social.facebook} onChange={e => setSocial({...social, facebook: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>YouTube Video URL (Introduction Video)</label>
              <input type="text" value={social.youtube} onChange={e => setSocial({...social, youtube: e.target.value})} />
            </div>
          </div>
        )}

        {/* Tab 4: Homepage */}
        {activeTab === "homepage" && (
          <div className={styles.card}>
            <h3>Homepage Hero & Toggles CMS</h3>
            <div className={styles.inputGroup}>
              <label>Hero Heading (English)</label>
              <input type="text" value={homepage.heroTitle} onChange={e => setHomepage({...homepage, heroTitle: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Hero Heading (Urdu)</label>
              <input type="text" value={homepage.heroTitleUr} onChange={e => setHomepage({...homepage, heroTitleUr: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Hero Heading (Arabic)</label>
              <input type="text" value={homepage.heroTitleAr} onChange={e => setHomepage({...homepage, heroTitleAr: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Hero Description (English)</label>
              <input type="text" value={homepage.heroDesc} onChange={e => setHomepage({...homepage, heroDesc: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Hero Description (Urdu)</label>
              <input type="text" value={homepage.heroDescUr} onChange={e => setHomepage({...homepage, heroDescUr: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Hero Description (Arabic)</label>
              <input type="text" value={homepage.heroDescAr} onChange={e => setHomepage({...homepage, heroDescAr: e.target.value})} />
            </div>
            <hr/>
            <h4>Homepage Section Visibility Toggles</h4>
            <div className={styles.grid2}>
              <label><input type="checkbox" checked={homepage.enableHero} onChange={e => setHomepage({...homepage, enableHero: e.target.checked})} /> Enable Hero Section</label>
              <label><input type="checkbox" checked={homepage.enableAbout} onChange={e => setHomepage({...homepage, enableAbout: e.target.checked})} /> Enable About Preview</label>
              <label><input type="checkbox" checked={homepage.enableDepartments} onChange={e => setHomepage({...homepage, enableDepartments: e.target.checked})} /> Enable Departments Section</label>
              <label><input type="checkbox" checked={homepage.enableAnnouncements} onChange={e => setHomepage({...homepage, enableAnnouncements: e.target.checked})} /> Enable Announcements</label>
              <label><input type="checkbox" checked={homepage.enableNews} onChange={e => setHomepage({...homepage, enableNews: e.target.checked})} /> Enable News & Activities</label>
              <label><input type="checkbox" checked={homepage.enableGallery} onChange={e => setHomepage({...homepage, enableGallery: e.target.checked})} /> Enable Gallery Section</label>
              <label><input type="checkbox" checked={homepage.enableDonations} onChange={e => setHomepage({...homepage, enableDonations: e.target.checked})} /> Enable Donations Section</label>
              <label><input type="checkbox" checked={homepage.enableContact} onChange={e => setHomepage({...homepage, enableContact: e.target.checked})} /> Enable Contact Section</label>
            </div>
          </div>
        )}

        {/* Tab 5: About Page */}
        {activeTab === "about" && (
          <div className={styles.card}>
            <h3>About Page Content Management (CMS)</h3>
            <div className={styles.inputGroup}>
              <label>Introduction Statement (English)</label>
              <textarea value={about.introEn} onChange={e => setAbout({...about, introEn: e.target.value})} rows={3}></textarea>
            </div>
            <div className={styles.inputGroup}>
              <label>Introduction Statement (Urdu)</label>
              <textarea value={about.introUr} onChange={e => setAbout({...about, introUr: e.target.value})} rows={3}></textarea>
            </div>
            <div className={styles.inputGroup}>
              <label>Introduction Statement (Arabic)</label>
              <textarea value={about.introAr} onChange={e => setAbout({...about, introAr: e.target.value})} rows={3}></textarea>
            </div>
            <hr/>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Mission (English)</label>
                <textarea value={about.missionEn} onChange={e => setAbout({...about, missionEn: e.target.value})} rows={2}></textarea>
              </div>
              <div className={styles.inputGroup}>
                <label>Mission (Urdu)</label>
                <textarea value={about.missionUr} onChange={e => setAbout({...about, missionUr: e.target.value})} rows={2}></textarea>
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Vision (English)</label>
                <textarea value={about.visionEn} onChange={e => setAbout({...about, visionEn: e.target.value})} rows={2}></textarea>
              </div>
              <div className={styles.inputGroup}>
                <label>Vision (Urdu)</label>
                <textarea value={about.visionUr} onChange={e => setAbout({...about, visionUr: e.target.value})} rows={2}></textarea>
              </div>
            </div>
            <hr/>
            <div className={styles.inputGroup}>
              <label>Objectives (Urdu)</label>
              <textarea value={about.objectivesUr} onChange={e => setAbout({...about, objectivesUr: e.target.value})} rows={3}></textarea>
            </div>
            <div className={styles.inputGroup}>
              <label>Services Offered (Urdu)</label>
              <textarea value={about.servicesUr} onChange={e => setAbout({...about, servicesUr: e.target.value})} rows={3}></textarea>
            </div>
            <div className={styles.inputGroup}>
              <label>Future Plans (Urdu)</label>
              <textarea value={about.futurePlansUr} onChange={e => setAbout({...about, futurePlansUr: e.target.value})} rows={3}></textarea>
            </div>
          </div>
        )}

        {/* Tab 6: Donations */}
        {activeTab === "donation" && (
          <div className={styles.card}>
            <h3>Donation Methods Setup</h3>
            <p className={styles.helpText}>Leave these fields blank if you do not have verified bank details yet. They will not be displayed on the public site if empty.</p>
            <div className={styles.inputGroup}>
              <label>Bank Name</label>
              <input type="text" value={donation.bankName} onChange={e => setDonation({...donation, bankName: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Account Title</label>
              <input type="text" value={donation.accountTitle} onChange={e => setDonation({...donation, accountTitle: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>Account Number</label>
              <input type="text" value={donation.accountNumber} onChange={e => setDonation({...donation, accountNumber: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label>IBAN</label>
              <input type="text" value={donation.iban} onChange={e => setDonation({...donation, iban: e.target.value})} />
            </div>
            <hr/>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Easypaisa Number</label>
                <input type="text" value={donation.easypaisaNumber} onChange={e => setDonation({...donation, easypaisaNumber: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>Easypaisa Title</label>
                <input type="text" value={donation.easypaisaTitle} onChange={e => setDonation({...donation, easypaisaTitle: e.target.value})} />
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>JazzCash Number</label>
                <input type="text" value={donation.jazzcashNumber} onChange={e => setDonation({...donation, jazzcashNumber: e.target.value})} />
              </div>
              <div className={styles.inputGroup}>
                <label>JazzCash Title</label>
                <input type="text" value={donation.jazzcashTitle} onChange={e => setDonation({...donation, jazzcashTitle: e.target.value})} />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Raast ID</label>
              <input type="text" value={donation.raastId} onChange={e => setDonation({...donation, raastId: e.target.value})} />
            </div>
            <hr/>
            <div className={styles.inputGroup}>
              <label>Donation Instructions (Urdu)</label>
              <textarea value={donation.instructionsUr} onChange={e => setDonation({...donation, instructionsUr: e.target.value})} rows={3}></textarea>
            </div>

            <hr/>
            <h4>🏠 Homepage Donation Strip Text</h4>
            <p className={styles.helpText}>These fields control the donation support strip shown on the homepage. Leave blank to use the default wording.</p>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Strip Title (English)</label>
                <input type="text" value={donation.stripTitleEn} onChange={e => setDonation({...donation, stripTitleEn: e.target.value})} placeholder="Support Jamia Abdullah Bin Mubarak" />
              </div>
              <div className={styles.inputGroup}>
                <label>Strip Title (Urdu)</label>
                <input type="text" value={donation.stripTitleUr} onChange={e => setDonation({...donation, stripTitleUr: e.target.value})} placeholder="جامعہ کی تعمیر و تعلیم میں اپنا حصہ شامل کریں" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label>Strip Title (Arabic)</label>
              <input type="text" value={donation.stripTitleAr} onChange={e => setDonation({...donation, stripTitleAr: e.target.value})} placeholder="ادعم جامعة عبد الله بن مبارك" />
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Strip Description (English)</label>
                <textarea value={donation.stripDescEn} onChange={e => setDonation({...donation, stripDescEn: e.target.value})} rows={2} placeholder="Contribute your donations..."></textarea>
              </div>
              <div className={styles.inputGroup}>
                <label>Strip Description (Urdu)</label>
                <textarea value={donation.stripDescUr} onChange={e => setDonation({...donation, stripDescUr: e.target.value})} rows={2} placeholder="اپنے عطیات..."></textarea>
              </div>
            </div>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Button Text (English)</label>
                <input type="text" value={donation.stripBtnEn} onChange={e => setDonation({...donation, stripBtnEn: e.target.value})} placeholder="Donate Now" />
              </div>
              <div className={styles.inputGroup}>
                <label>Button Text (Urdu)</label>
                <input type="text" value={donation.stripBtnUr} onChange={e => setDonation({...donation, stripBtnUr: e.target.value})} placeholder="عطیہ کریں" />
              </div>
            </div>
            <div className={styles.inputGroup}>
              <label><input type="checkbox" checked={donation.stripShowBtn} onChange={e => setDonation({...donation, stripShowBtn: e.target.checked})} />{" "}Show Donate Button on Strip</label>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? "Saving Changes..." : "Save Config Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
