/* =====================================================================
   YGD — admin page logic
   Gated by Google sign-in (Firebase Auth). Only ADMIN_EMAIL may post.
   Writes new blog posts to the Firestore "blogs" collection, with an
   optional media-file upload to Firebase Storage.
   ===================================================================== */
import { firebaseConfig, ADMIN_EMAIL, isConfigured } from "./firebase-config.js";

const gate     = document.getElementById("gate");
const editor   = document.getElementById("editor");
const musicEditor = document.getElementById("musicEditor");
const denied   = document.getElementById("denied");
const notice   = document.getElementById("notice");
const whoEl    = document.getElementById("who");
const signInBtn  = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const form     = document.getElementById("blogForm");
const trackForm  = document.getElementById("trackForm");

function say(msg, kind = "warn") {
  notice.className = "notice " + kind;
  notice.textContent = msg;
  notice.classList.remove("hidden");
}
function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }

/* ---------- demo mode: no firebase yet ---------- */
if (!isConfigured) {
  hide(gate);
  say(
    "DEMO MODE — Firebase isn't configured yet. Paste your project keys into " +
    "js/firebase-config.js and enable Google sign-in + Firestore to unlock " +
    "posting. (see README.md)",
    "warn"
  );
} else {
  bootFirebase();
}

async function bootFirebase() {
  const [{ initializeApp }, auth, fs, storage] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"),
  ]);

  const app  = initializeApp(firebaseConfig);
  const A    = auth.getAuth(app);
  const db   = fs.getFirestore(app);
  const st   = storage.getStorage(app);
  const provider = new auth.GoogleAuthProvider();

  signInBtn.addEventListener("click", async () => {
    try { await auth.signInWithPopup(A, provider); }
    catch (e) { say("Sign-in failed: " + e.message, "err"); }
  });
  signOutBtn.addEventListener("click", () => auth.signOut(A));

  auth.onAuthStateChanged(A, (user) => {
    if (!user) {
      show(gate); hide(editor); hide(musicEditor); hide(denied);
      notice.classList.add("hidden");
      return;
    }
    hide(gate);
    if (user.email !== ADMIN_EMAIL) {
      // not the owner — refuse, and sign them back out
      hide(editor); hide(musicEditor); show(denied);
      denied.querySelector("[data-email]").textContent = user.email;
      return;
    }
    hide(denied); show(editor); show(musicEditor);
    whoEl.textContent = user.email;
  });

  /* ---------- submit a new post ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector(".submit");
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const mediaType = form.mediaType.value;
    let mediaUrl = form.mediaUrl.value.trim();
    const file = form.mediaFile.files[0];

    if (!title || !description) {
      say("Title and description are required.", "err");
      return;
    }

    submitBtn.disabled = true;
    try {
      // upload a file if one was chosen
      if (file) {
        say("Uploading media…", "warn");
        const path = `blogs/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const ref  = storage.ref(st, path);
        await storage.uploadBytes(ref, file);
        mediaUrl = await storage.getDownloadURL(ref);
      }

      await fs.addDoc(fs.collection(db, "blogs"), {
        title,
        description,
        mediaType,
        mediaUrl,
        author: A.currentUser.email,
        createdAt: fs.serverTimestamp(),
      });

      form.reset();
      say("Posted! ✓  It's live on the blog page.", "ok");
    } catch (err) {
      console.error(err);
      say("Could not post: " + err.message, "err");
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- submit a new track ---------- */
  trackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = trackForm.querySelector(".submit");
    const title = trackForm.title.value.trim();
    const artist = trackForm.artist.value.trim();
    let url = trackForm.trackUrl.value.trim();
    const file = trackForm.trackFile.files[0];

    if (!title || (!url && !file)) {
      say("A track title and either a URL or an audio file are required.", "err");
      return;
    }

    submitBtn.disabled = true;
    try {
      if (file) {
        say("Uploading track…", "warn");
        const path = `tracks/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
        const ref  = storage.ref(st, path);
        await storage.uploadBytes(ref, file);
        url = await storage.getDownloadURL(ref);
      }

      await fs.addDoc(fs.collection(db, "tracks"), {
        title,
        artist,
        url,
        author: A.currentUser.email,
        createdAt: fs.serverTimestamp(),
      });

      trackForm.reset();
      say("Track added! ✓  It's in the homepage playlist.", "ok");
    } catch (err) {
      console.error(err);
      say("Could not add track: " + err.message, "err");
    } finally {
      submitBtn.disabled = false;
    }
  });
}
