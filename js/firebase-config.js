/* =====================================================================
   YGD — Firebase configuration
   ---------------------------------------------------------------------
   1. Create a project at https://console.firebase.google.com
   2. Add a Web App, then paste its config values below.
   3. Enable  Authentication -> Sign-in method -> Google.
   4. Enable  Firestore Database  (start in production mode, then use the
      security rules shown in README.md).
   5. (Optional) Enable  Storage  if you want to upload media files
      instead of pasting URLs.

   Until you fill this in with a real apiKey, the site runs in DEMO MODE:
   the blog page shows sample posts and the admin page is view-only.
   ===================================================================== */

export const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};

/* Only this Google account may access /admin and write blog posts.
   Change it if you ever want a different owner. */
export const ADMIN_EMAIL = "b1tchimd1@gmail.com";

/* true once real credentials are pasted above. */
export const isConfigured = !firebaseConfig.apiKey.startsWith("YOUR_");
