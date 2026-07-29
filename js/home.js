/* =====================================================================
   YGD — home page: render the single latest blog post.
   Uses Firestore when configured, otherwise the newest demo post.
   ===================================================================== */
import { firebaseConfig, isConfigured } from "./firebase-config.js";
import { demoBlogs } from "./data.js";

const el = document.getElementById("latestBlog");
if (el) init();

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
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function mediaMarkup(post) {
  if (!post.mediaUrl) return "";
  if (post.mediaType === "video") {
    const yt = post.mediaUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
    if (yt) {
      return `<div class="blog-media"><iframe width="100%" height="280"
        src="https://www.youtube.com/embed/${yt[1]}" frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe></div>`;
    }
    return `<div class="blog-media"><video controls src="${esc(post.mediaUrl)}"></video></div>`;
  }
  return `<div class="blog-media"><img loading="lazy" src="${esc(post.mediaUrl)}" alt="${esc(post.title)}"></div>`;
}
function render(post) {
  if (!post) {
    el.innerHTML = `<p class="latest-empty">no posts yet &mdash; check back soon &#128064;</p>`;
    return;
  }
  const d = toDate(post.createdAt);
  el.innerHTML = `
    <article class="blog-entry">
      <span class="meta-time">&#128337; ${esc(fmtTime(d))}</span>
      <h3 class="title">${esc(post.title)}</h3>
      ${mediaMarkup(post)}
      <p class="blog-desc">${esc(post.description).replace(/\n/g, "<br>")}</p>
    </article>`;
}
function newest(list) {
  return [...list].sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))[0];
}

async function init() {
  if (isConfigured) {
    try {
      const [{ initializeApp }, fs] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
      ]);
      const app = initializeApp(firebaseConfig);
      const db = fs.getFirestore(app);
      const q = fs.query(fs.collection(db, "blogs"), fs.orderBy("createdAt", "desc"), fs.limit(1));
      fs.onSnapshot(q, (snap) => {
        const post = snap.docs.length ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null;
        render(post);
      }, (err) => { console.error(err); render(newest(demoBlogs)); });
      return;
    } catch (e) { console.error(e); }
  }
  render(newest(demoBlogs));
}
