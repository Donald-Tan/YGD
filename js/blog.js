/* =====================================================================
   YGD — blog page logic
   Loads posts from Firestore (if configured) or demo data, renders the
   entries + the right-hand "stack" navigation.
   ===================================================================== */
import { firebaseConfig, isConfigured } from "./firebase-config.js";
import { demoBlogs } from "./data.js";

const feedEl  = document.getElementById("feed");
const stackEl = document.getElementById("stackList");
const modeEl  = document.getElementById("modeNote");

/* ---------- helpers ---------- */
function esc(s = "") {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function toDate(v) {
  if (!v) return new Date(0);
  if (typeof v.toDate === "function") return v.toDate();   // Firestore Timestamp
  return new Date(v);
}

function fmtTime(d) {
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function slug(id) { return "post-" + id; }

/* ---------- rendering ---------- */
function mediaMarkup(post) {
  if (!post.mediaUrl) return "";
  if (post.mediaType === "video") {
    const url = post.mediaUrl;
    // YouTube / Vimeo -> iframe, otherwise a <video> element
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (yt) {
      return `<div class="blog-media"><iframe width="100%" height="315"
        src="https://www.youtube.com/embed/${yt[1]}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen style="border:3px solid #000;box-shadow:4px 4px 0 rgba(0,0,0,.5)"></iframe></div>`;
    }
    return `<div class="blog-media"><video controls src="${esc(url)}"></video></div>`;
  }
  return `<div class="blog-media"><img loading="lazy" src="${esc(post.mediaUrl)}" alt="${esc(post.title)}"></div>`;
}

function renderPosts(posts) {
  if (!posts.length) {
    feedEl.innerHTML = `<div class="panel"><div class="head">Blog</div>
      <div class="body">no posts yet... check back soon &#128064;</div></div>`;
    stackEl.innerHTML = `<li><a href="#">nothing here yet</a></li>`;
    return;
  }

  feedEl.innerHTML = posts.map((p, i) => {
    const d = toDate(p.createdAt);
    return `
    <article class="panel blog-entry" id="${slug(p.id)}">
      <div class="head">&#9997; Blog Entry ${posts.length - i}</div>
      <div class="body">
        <span class="meta-time">&#128337; ${esc(fmtTime(d))}</span>
        <h3 class="title">${esc(p.title)}</h3>
        ${mediaMarkup(p)}
        <p class="blog-desc">${esc(p.description).replace(/\n/g, "<br>")}</p>
        <p class="tag-line"><span class="kudos">&#9829; kudos</span> ·
           <a href="#${slug(p.id)}">permalink</a> ·
           <a href="#feed-top">&uarr; top</a></p>
      </div>
    </article>`;
  }).join("");

  stackEl.innerHTML = posts.map((p) => {
    const d = toDate(p.createdAt);
    return `<li><a href="#${slug(p.id)}">
       <span class="s-time">${esc(fmtTime(d))}</span>
       <span class="s-title">${esc(p.title)}</span>
     </a></li>`;
  }).join("");
}

function sortNewestFirst(list) {
  return [...list].sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt));
}

/* ---------- data source ---------- */
async function loadFromFirestore() {
  const [{ initializeApp }, fs] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
  ]);
  const app = initializeApp(firebaseConfig);
  const db = fs.getFirestore(app);
  const q = fs.query(fs.collection(db, "blogs"), fs.orderBy("createdAt", "desc"));

  // live updates: new admin posts appear without a refresh
  fs.onSnapshot(q, (snap) => {
    const posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderPosts(sortNewestFirst(posts));
    modeEl.textContent = `live · ${posts.length} post${posts.length === 1 ? "" : "s"}`;
  }, (err) => {
    console.error(err);
    modeEl.textContent = "couldn't reach firestore — showing samples";
    renderPosts(sortNewestFirst(demoBlogs));
  });
}

async function init() {
  if (isConfigured) {
    try { await loadFromFirestore(); return; }
    catch (e) { console.error(e); }
  }
  modeEl.textContent = "demo mode — configure Firebase to go live";
  renderPosts(sortNewestFirst(demoBlogs));
}

init();
