A1 KABADIWALA - COMPLETE PACKAGE (Professional + Admin + Firebase)

Contents:
- Static site files (index.html, services.html, about.html, contact.html, calculator.html, styles.css, scripts.js, assets/)
- Admin panel: admin.html, admin.js (Firebase-based admin UI)
- FIRESTORE_RULES.txt and STORAGE_RULES.txt - paste these into Firebase Console rules
- README_SETUP.txt (this file)

IMPORTANT: Replace Firebase config values in admin.js with your Firebase project's config.

Quick setup:

1) Unzip this package to your working folder.
2) Deploy static site on Netlify/Vercel/GitHub Pages (or host on any static host). For Firebase-based admin features, you'll need a Firebase project.

Firebase setup (short):
- Create Firebase project at https://console.firebase.google.com
- Enable Authentication -> Email/Password
- Create an admin user (create in Authentication)
- Use Firebase Admin SDK or Firebase CLI to set custom claim 'admin' for that user's UID:
  admin.auth().setCustomUserClaims(uid, { admin: true });

- Create Firestore database (in production mode) and paste FIRESTORE_RULES.txt into Firestore rules.
- Paste STORAGE_RULES.txt into Storage rules.
- In admin.js replace 'firebaseConfig' with your project's config (found in Firebase project settings).
- Deploy admin.html and admin.js together with the static site files. Admin UI uses Firebase client SDKs (no server required).

How admin works:
- Admin signs in with email/password. Admin must have custom claim 'admin' (set server-side).
- Admin can edit site content (site/content), prices (site/prices), upload images (site/images), and view leads (collection 'leads').
- Public site reads content/prices from Firestore (you must modify public scripts to read Firestore instead of localStorage; see below).

Optional: I can modify the public JS so it pulls content and prices from Firestore (realtime) — say 'Yes' and provide your Firebase config and I'll inject and repackage.

Security note:
- No system is perfectly unhackable. The provided rules and auth significantly raise the security bar.
- Consider enabling 2FA, restricting admin sign-in IPs, and monitoring audit logs in production.

If you want me to also inject your Firebase config and enable realtime publishing (so public site reads from Firestore), reply with 'Inject Firebase config' and paste the config object here (or tell me to leave placeholders).

Enjoy!