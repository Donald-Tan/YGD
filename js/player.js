/* =====================================================================
   YGD — homepage media player
   Drives the real <audio> element with play/prev/next/stop/mute controls
   and an equalizer that reacts to actual playback via the Web Audio API.

   The default playlist below lists the owner's requested tracks. This
   project can't legally ship copyrighted commercial audio, so each entry
   points at a local file path under assets/music/ that the owner must
   supply themselves (their own licensed copy), OR the owner can upload
   tracks from the admin page — those are pulled in from Firestore and
   take priority over the local placeholders.
   ===================================================================== */
import { firebaseConfig, isConfigured } from "./firebase-config.js";

const DEFAULT_PLAYLIST = [
  { title: "Babies & Fools", artist: "Freddie Gibbs & The Alchemist", url: "assets/music/babies-and-fools.mp3" },
  { title: "We Major", artist: "Kanye West", url: "assets/music/we-major.mp3" },
  { title: "Beauty and the Beast", artist: "Kanye West", url: "assets/music/beauty-and-the-beast.mp3" },
  { title: "Cus Ima Joka Smoka", artist: "Matt Proxy", url: "assets/music/cus-ima-joka-smoka.mp3" },
  { title: "Vicious Racks Blue", artist: "Nine", url: "assets/music/vicious-racks-blue.mp3" },
  { title: "Didn't Cha Know", artist: "Erykah Badu", url: "assets/music/didnt-cha-know.mp3" },
];

const audio      = document.getElementById("bgAudio");
const nowPlaying = document.getElementById("nowPlaying");
const eqBars     = document.getElementById("eqBars");
const btnPlay    = document.getElementById("pPlay");
const btnPrev    = document.getElementById("pPrev");
const btnNext    = document.getElementById("pNext");
const btnStop    = document.getElementById("pStop");
const btnMute    = document.getElementById("pMute");

if (audio) init();

function init() {
  let playlist = DEFAULT_PLAYLIST.slice();
  let index = 0;

  audio.crossOrigin = "anonymous";

  loadTrack(index, { autoplay: false });

  btnPlay.addEventListener("click", togglePlay);
  btnPrev.addEventListener("click", () => skip(-1));
  btnNext.addEventListener("click", () => skip(1));
  btnStop.addEventListener("click", stop);
  btnMute.addEventListener("click", toggleMute);
  audio.addEventListener("ended", () => skip(1));
  audio.addEventListener("error", () => {
    nowPlaying.textContent = `${trackLabel(playlist[index])} — file not found (add it to assets/music/)`;
  });
  audio.addEventListener("play", () => { setPlayIcon(true); startEq(); });
  audio.addEventListener("pause", () => { setPlayIcon(false); stopEq(); });

  loadUploadedTracks();

  function loadUploadedTracks() {
    if (!isConfigured) return;
    Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"),
    ]).then(([{ initializeApp }, fs]) => {
      const app = initializeApp(firebaseConfig);
      const db = fs.getFirestore(app);
      const q = fs.query(fs.collection(db, "tracks"), fs.orderBy("createdAt", "desc"));
      fs.onSnapshot(q, (snap) => {
        const uploaded = snap.docs.map((d) => {
          const t = d.data();
          return { title: t.title, artist: t.artist || "", url: t.url };
        });
        if (uploaded.length) {
          const wasEmpty = playlist === DEFAULT_PLAYLIST;
          playlist = uploaded.concat(DEFAULT_PLAYLIST);
          if (wasEmpty) loadTrack(0, { autoplay: false });
        }
      }, (err) => console.error(err));
    }).catch((err) => console.error(err));
  }

  function trackLabel(t) {
    return t.artist ? `${t.title} — ${t.artist}` : t.title;
  }

  function loadTrack(i, { autoplay }) {
    index = ((i % playlist.length) + playlist.length) % playlist.length;
    const t = playlist[index];
    audio.src = t.url;
    nowPlaying.textContent = trackLabel(t);
    if (autoplay) audio.play().catch(() => {});
  }

  function togglePlay() {
    if (audio.paused) audio.play().catch(() => {
      nowPlaying.textContent = `${trackLabel(playlist[index])} — couldn't play (add the file to assets/music/)`;
    });
    else audio.pause();
  }

  function skip(dir) {
    const wasPlaying = !audio.paused;
    loadTrack(index + dir, { autoplay: wasPlaying });
  }

  function stop() {
    audio.pause();
    audio.currentTime = 0;
  }

  function toggleMute() {
    audio.muted = !audio.muted;
    btnMute.style.opacity = audio.muted ? .5 : 1;
  }

  function setPlayIcon(playing) {
    btnPlay.querySelector("[data-play]").classList.toggle("hidden", playing);
    btnPlay.querySelector("[data-pause]").classList.toggle("hidden", !playing);
  }

  /* ---- equalizer driven by real playback (falls back to CSS idle pulse) ---- */
  let audioCtx, analyser, sourceNode, freqData, rafId;
  const bars = eqBars.querySelectorAll("i");

  function ensureAnalyser() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) { console.error(e); }
  }

  function startEq() {
    ensureAnalyser();
    if (!analyser) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    eqBars.classList.add("live");
    const tick = () => {
      analyser.getByteFrequencyData(freqData);
      bars.forEach((bar, i) => {
        const v = freqData[i % freqData.length] / 255;
        bar.style.height = `${4 + v * 18}px`;
      });
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  function stopEq() {
    eqBars.classList.remove("live");
    if (rafId) cancelAnimationFrame(rafId);
    bars.forEach((bar) => { bar.style.height = ""; });
  }
}
