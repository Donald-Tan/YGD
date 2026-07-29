/* =====================================================================
   YGD — live search-as-you-type dropdown for the nav search bar.
   Attaches to any input.nav-search-input on the page (home + blog both
   have one) and shows a dropdown of matching blog posts as the user
   types, each linking straight to that post on the blog page.
   ===================================================================== */
import { firebaseConfig, isConfigured } from "./firebase-config.js";
import { demoBlogs } from "./data.js";

const input = document.querySelector(".nav-search-input");
if (input) init();

function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function toDate(v) {
  if (!v) return new Date(0);
  if (typeof v.toDate === "function") return v.toDate();
  return new Date(v);
}
function fmtTime(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function snippet(text, len = 70) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > len ? t.slice(0, len).trim() + "…" : t;
}

async function init() {
  let posts = demoBlogs;

  if (isConfigured) {
    try {
      const [{ initializeApp }, fs] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
      ]);
      const app = initializeApp(firebaseConfig);
      const db = fs.getFirestore(app);
      const q = fs.query(fs.collection(db, "blogs"), fs.orderBy("createdAt", "desc"));
      fs.onSnapshot(q, (snap) => {
        posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      }, () => { posts = demoBlogs; });
    } catch (e) { console.error(e); }
  }

  const box = input.closest(".search");
  let dropdown = null;

  function closeDropdown() {
    if (dropdown) { dropdown.remove(); dropdown = null; }
  }

  function openDropdown(term) {
    const matches = posts.filter((p) =>
      (p.title || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    ).slice(0, 6);

    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.className = "search-dropdown";
      box.appendChild(dropdown);
    }

    if (!matches.length) {
      dropdown.innerHTML = `<div class="sd-empty">no blogs match "${esc(term)}"</div>`;
      return;
    }

    dropdown.innerHTML = matches.map((p) => `
      <a href="blog.html#post-${esc(p.id)}">
        <span class="sd-title">${esc(p.title)}</span>
        <span class="sd-time">${esc(fmtTime(toDate(p.createdAt)))}</span>
        <span class="sd-snip">${esc(snippet(p.description || ""))}</span>
      </a>`).join("");
  }

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    if (!term) { closeDropdown(); return; }
    openDropdown(term);
  });

  input.addEventListener("focus", () => {
    const term = input.value.trim().toLowerCase();
    if (term) openDropdown(term);
  });

  input.addEventListener("blur", () => {
    // slight delay so a click on a dropdown link still registers
    setTimeout(closeDropdown, 150);
  });
}
