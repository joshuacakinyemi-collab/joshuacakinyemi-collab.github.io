const projects = {
  "portfolio": {
    title: "Personal Portfolio",
    img: "img/Background.png",
    description: "My own portfolio that states who I am and lists my projects.",
    tech: "HTML5, CSS, JavaScript, Formspree",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/joshuacakinyemi-collab.github.io" },
    ],
  },
  "yoshiyatunes": {
    title: "YoshiyaTunes",
    img: "https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/cd.png",
    description: "A place to create personalized playlists with music that you can share with other users.",
    tech: "JavaScript, CSS, HTML",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/playlistMaker/tree/main" },
    ],
  },
  "virtual-launcher": {
    title: "Virtual Launcher",
    img: "img/VirtualLauncher.png",
    description: "A console-style game launcher that skins your desktop apps and games as a big-screen, controller-operable dashboard.",
    tech: "Electron, JavaScript, HTML, CSS",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/Virtual-Launcher" },
    ],
  },
  "sonic": {
    title: "Sonic the Hedgehog Fangame",
    img: "img/Sonicmem.png",
    description: "A 3D Sonic fangame utilizing gameplay from the three main game eras.",
    tech: "C++, Unreal Engine",
    links: [],
  },
  "twewy": {
    title: "The World Ends With You: Neo Remix",
    img: "img/twewyneo.png",
    description: "A remake of the 2007 game, recreated in 3D.",
    tech: "C++, Unreal Engine",
    links: [],
  },
};

function buildPanel(id) {
  const p = projects[id];
  if (!p) return null;

  const linksHTML = p.links.length
    ? p.links.map(l => `<a class="link panel-link" href="${l.href}" target="_blank" rel="noopener noreferrer">--- ${l.label}</a>`).join("")
    : "<span class='panel-no-links'>No links yet</span>";

  const panel = document.createElement("div");
  panel.className = "project-panel";
  panel.dataset.panelFor = id;

  panel.innerHTML = `
    <button class="panel-close" aria-label="Close panel">✕</button>
    <img src="${p.img}" alt="${p.title}" class="panel-img">
    <div class="panel-info">
      <h4 class="panel-title">${p.title}</h4>
      <p class="panel-desc">${p.description}</p>
      <p class="panel-tech"><span>Tech:</span> ${p.tech}</p>
      <div class="panel-links">${linksHTML}</div>
    </div>
  `;

  return panel;
}

function closePanel(panel) {
  panel.classList.remove("panel-open");
  panel.addEventListener("transitionend", () => panel.remove(), { once: true });
}

function togglePanel(sidebar, projectId) {
  const existing = sidebar.querySelector(".project-panel");
  const isOpenAlready = existing?.dataset.panelFor === projectId && existing.classList.contains("panel-open");

  sidebar.querySelectorAll(".wii-system-button.active").forEach(b => b.classList.remove("active"));

  if (isOpenAlready) {
    closePanel(existing);
    return;
  }

  existing?.remove();

  const panel = buildPanel(projectId);
  if (!panel) return;

  sidebar.appendChild(panel);
  // Wait two frames so the browser paints the closed state before animating open
  requestAnimationFrame(() => {
    requestAnimationFrame(() => panel.classList.add("panel-open"));
  });

  sidebar.querySelector(`.wii-system-button[data-project="${projectId}"]`)?.classList.add("active");

  panel.querySelector(".panel-close").addEventListener("click", () => togglePanel(sidebar, projectId));
}

function init() {
  document.querySelectorAll(".wii-system-button[data-project]").forEach(btn => {
    btn.addEventListener("click", () => togglePanel(btn.closest(".sidebar"), btn.dataset.project));
  });

  initLightbox();
  initHobbyGallery();
  initSparkleTrail();
}

/* -------------------------------- */
/* ---------- 2000s Extras --------- */
/* -------------------------------- */

function initSparkleTrail() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchOnly = window.matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || touchOnly) return;

  const colors = ["#4dffc2", "#5fd0f0", "#ff7ac0", "#ffe066", "#ffffff"];
  let lastSpawn = 0;

  document.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastSpawn < 40) return;
    lastSpawn = now;

    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = "✦";
    sparkle.style.left = `${e.clientX}px`;
    sparkle.style.top = `${e.clientY}px`;
    sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
    document.body.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove());
  });
}

/* -------------------------------- */
/* ------------ Lightbox ----------- */
/* -------------------------------- */

let lightboxEl, lightboxImg;
let lightboxOpen = false;
let onLightboxClose = null;

function initLightbox() {
  lightboxEl = document.getElementById("lightbox");
  if (!lightboxEl) return;
  lightboxImg = lightboxEl.querySelector(".lightbox-img");

  lightboxEl.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightboxEl.querySelector(".lightbox-backdrop")?.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxOpen) closeLightbox();
  });
}

function openLightbox(src, alt, onClose) {
  if (!lightboxEl || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxEl.classList.add("open");
  lightboxEl.setAttribute("aria-hidden", "false");
  lightboxOpen = true;
  onLightboxClose = onClose || null;
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove("open");
  lightboxEl.setAttribute("aria-hidden", "true");
  lightboxOpen = false;
  if (onLightboxClose) onLightboxClose();
  onLightboxClose = null;
}

/* -------------------------------- */
/* ------------ Carousel ----------- */
/* -------------------------------- */

function createCarousel(root, { autoRotate = false, intervalMs = 10000 } = {}) {
  const track = root.querySelector(".gallery-track");
  const slides = root.querySelectorAll(".gallery-slide");
  const dots = root.querySelectorAll(".gallery-dot");
  if (!track || !slides.length) return { stop() { } };

  let current = 0;
  let timer = null;

  function showSlide(index) {
    slides[current].classList.remove("active");
    dots[current]?.classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    dots[current]?.classList.add("active");
  }

  function startRotation() {
    if (!autoRotate || slides.length < 2) return;
    timer = setInterval(() => showSlide(current + 1), intervalMs);
  }

  function stopRotation() {
    clearInterval(timer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      showSlide(i);
      stopRotation();
      startRotation();
    });
  });

  root.querySelector(".gallery-prev")?.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(current - 1);
    stopRotation();
    startRotation();
  });

  root.querySelector(".gallery-next")?.addEventListener("click", (e) => {
    e.stopPropagation();
    showSlide(current + 1);
    stopRotation();
    startRotation();
  });

  track.addEventListener("click", () => {
    stopRotation();
    openLightbox(slides[current].src, slides[current].alt, startRotation);
  });

  track.addEventListener("mouseenter", stopRotation);
  track.addEventListener("mouseleave", () => {
    if (!lightboxOpen) startRotation();
  });

  startRotation();

  return { stop: stopRotation };
}

/* -------------------------------- */
/* --------- Hobby Gallery --------- */
/* -------------------------------- */

const hobbyCategories = {
  "gaming": {
    title: "Gaming",
    type: "playlists",
  },
  "video-editing": {
    title: "Video Editing",
    type: "videos",
  },
  "blender": {
    title: "Blender",
    type: "gallery",
    images: [
      { src: "gallery/finalCD.png", alt: "3D render of Sonic the Hedgehog in a desert" },
      { src: "gallery/SA_Frutiger_Final.webp", alt: "Sonic Adventure style render, Frutiger Aero edit" },
      { src: "gallery/Mania.webp", alt: "Sonic Mania style render with geometric background" },
    ],
  },
  "coding": {
    title: "Coding",
    type: "placeholder",
    message: "Nothing posted yet — check back soon.",
  },
  "art": {
    title: "Art",
    type: "gallery",
    images: [
      { src: "gallery/Sonicmem.png", alt: "Sonic the Hedgehog CD cover art collage" },
    ],
  },
  "music": {
    title: "Music (eventually)",
    type: "player",
  },
};

const musicTracks = [
  {
    title: "Tetris Theme",
    artist: "YourPalYoshiya",
    art: "img/tblock.jpg",
    src: "music/Tetris.mp3",
  },
];

function buildGalleryInner(images) {
  const slides = images
    .map((img, i) => `<img class="gallery-slide${i === 0 ? " active" : ""}" src="${img.src}" alt="${img.alt}">`)
    .join("");

  const arrows = images.length > 1
    ? `<button type="button" class="gallery-arrow gallery-prev" aria-label="Previous image">&#10094;</button>
       <button type="button" class="gallery-arrow gallery-next" aria-label="Next image">&#10095;</button>`
    : "";

  const dots = images.length > 1
    ? `<div class="gallery-dots">${images
      .map((_, i) => `<button type="button" class="gallery-dot${i === 0 ? " active" : ""}" data-slide="${i}" aria-label="Show slide ${i + 1}"></button>`)
      .join("")}</div>`
    : "";

  return `<div class="gallery-track">${slides}${arrows}</div>${dots}`;
}

function buildCategoryBar(title) {
  return `
    <div class="gallery-category-bar">
      <span class="gallery-category-label">${title}</span>
      <button type="button" class="gallery-back" id="gallery-back-btn">&#10005; Back to Gallery</button>
    </div>
  `;
}

const youtubeChannelUrl = "https://www.youtube.com/@yinlin9811";

// videos.json and playlists.json are refreshed by the
// "Update YouTube videos and playlists" GitHub Action
async function loadYouTubeCards(container, file, buildCard) {
  try {
    const res = await fetch(file, { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    const items = await res.json();
    container.replaceChildren(...items.map(buildCard));
  } catch {
    container.innerHTML = buildPlaceholderMarkup("Couldn't load videos right now.");
  }

  const more = document.createElement("a");
  more.className = "link video-more";
  more.href = youtubeChannelUrl;
  more.target = "_blank";
  more.rel = "noopener noreferrer";
  more.textContent = "▶ See all videos on YouTube";
  container.after(more);
}

// Built with DOM methods (not innerHTML) since titles come from YouTube
function buildYouTubeCard({ url, thumbnail, title, subtitle }) {
  const card = document.createElement("a");
  card.className = "video-card";
  card.href = url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const thumb = document.createElement("span");
  thumb.className = "video-thumb";
  const img = document.createElement("img");
  img.src = thumbnail;
  img.alt = "";
  img.loading = "lazy";
  const play = document.createElement("span");
  play.className = "video-play";
  play.setAttribute("aria-hidden", "true");
  play.textContent = "▶";
  thumb.append(img, play);

  const titleEl = document.createElement("span");
  titleEl.className = "video-title";
  titleEl.textContent = title;

  const subtitleEl = document.createElement("span");
  subtitleEl.className = "video-date";
  subtitleEl.textContent = subtitle;

  card.append(thumb, titleEl, subtitleEl);
  return card;
}

function buildVideoCard(video) {
  return buildYouTubeCard({
    ...video,
    subtitle: new Date(video.published).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    }),
  });
}

function buildPlaylistCard(playlist) {
  const count = `${playlist.count}${playlist.countIsCapped ? "+" : ""}`;
  const card = buildYouTubeCard({ ...playlist, subtitle: `☰ Playlist · ${count} videos` });
  card.classList.add("playlist-card");
  return card;
}

function buildPlaceholderMarkup(message) {
  return `<p class="wii-hint hobby-placeholder">${message}</p>`;
}

function buildPlayerMarkup() {
  const t = musicTracks[0];
  const trackItems = musicTracks
    .map((track, i) => `
      <button type="button" class="mp-track-item${i === 0 ? " active" : ""}" data-index="${i}">
        <span class="mp-track-title">${track.title}</span>
        <span class="mp-track-artist">${track.artist}</span>
      </button>
    `)
    .join("");

  return `
    <div class="mini-player">
      <audio class="mini-player-audio" src="${t.src}" preload="metadata"></audio>
      <div class="mini-player-art"><img src="${t.art}" alt=""></div>
      <div class="mini-player-info">
        <div class="mini-player-marquee"><span class="mini-player-title">${t.title}</span></div>
        <div class="mini-player-artist">${t.artist}</div>
        <div class="mini-player-visualizer" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="mini-player-progress" id="mp-progress"><div class="mini-player-progress-fill"></div></div>
      <div class="mini-player-controls">
        <button type="button" class="mp-btn" id="mp-list" aria-label="Browse all tracks" title="Browse all tracks">&#9776;</button>
        <button type="button" class="mp-btn" id="mp-prev" aria-label="Previous track">&#9198;</button>
        <button type="button" class="mp-btn mp-btn-play" id="mp-play" aria-label="Play">&#9654;</button>
        <button type="button" class="mp-btn" id="mp-next" aria-label="Next track">&#9197;</button>
        <button type="button" class="mp-btn" id="mp-loop" aria-label="Loop">&#8635;</button>
      </div>
      <div class="mini-player-tracklist" id="mp-tracklist" hidden>${trackItems}</div>
      <p class="mini-player-note">A little homage to the Music Playlist Maker app's compact player mode —
        <a class="link" href="https://github.com/joshuacakinyemi-collab/Music-Playlist-Maker-Desktop-Application" target="_blank" rel="noopener noreferrer">see the real app on GitHub</a>.
      </p>
    </div>
  `;
}

function wirePlayer(root) {
  let trackIndex = 0;

  const audio = root.querySelector(".mini-player-audio");
  const art = root.querySelector(".mini-player-art img");
  const title = root.querySelector(".mini-player-title");
  const artist = root.querySelector(".mini-player-artist");
  const playBtn = root.querySelector("#mp-play");
  const loopBtn = root.querySelector("#mp-loop");
  const listBtn = root.querySelector("#mp-list");
  const trackList = root.querySelector("#mp-tracklist");
  const progress = root.querySelector("#mp-progress");
  const progressFill = root.querySelector(".mini-player-progress-fill");
  const visualizer = root.querySelector(".mini-player-visualizer");

  function setPlayingUI(isPlaying) {
    playBtn.innerHTML = isPlaying ? "&#10073;&#10073;" : "&#9654;";
    playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    visualizer.classList.toggle("playing", isPlaying);
  }

  function loadTrack(index, { autoplay } = {}) {
    trackIndex = (index + musicTracks.length) % musicTracks.length;
    const t = musicTracks[trackIndex];
    const wasPlaying = autoplay ?? !audio.paused;

    audio.src = t.src;
    art.src = t.art;
    title.textContent = t.title;
    artist.textContent = t.artist;
    progressFill.style.width = "0%";

    trackList.querySelectorAll(".mp-track-item").forEach((item, i) => {
      item.classList.toggle("active", i === trackIndex);
    });

    if (wasPlaying) audio.play().catch(() => { });
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => { });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => setPlayingUI(true));
  audio.addEventListener("pause", () => setPlayingUI(false));
  audio.addEventListener("ended", () => setPlayingUI(false));

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  });

  progress.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * audio.duration;
  });

  root.querySelector("#mp-prev").addEventListener("click", () => loadTrack(trackIndex - 1));
  root.querySelector("#mp-next").addEventListener("click", () => loadTrack(trackIndex + 1));

  loopBtn.addEventListener("click", () => {
    audio.loop = !audio.loop;
    loopBtn.classList.toggle("active", audio.loop);
  });

  listBtn.addEventListener("click", () => {
    trackList.hidden = !trackList.hidden;
    listBtn.classList.toggle("active", !trackList.hidden);
  });

  trackList.querySelectorAll(".mp-track-item").forEach((item) => {
    item.addEventListener("click", () => {
      loadTrack(Number(item.dataset.index), { autoplay: true });
      trackList.hidden = true;
      listBtn.classList.remove("active");
    });
  });
}

function stopPlayer(root) {
  const audio = root.querySelector(".mini-player-audio");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function initHobbyGallery() {
  const galleryEl = document.getElementById("main-gallery");
  const hobbyLinks = document.querySelectorAll("#stack > a[data-hobby]");
  if (!galleryEl) return;

  const defaultMarkup = galleryEl.innerHTML;
  let activeHandle = createCarousel(galleryEl, { autoRotate: true });
  let activeHobby = null;

  function setActiveLink(key) {
    hobbyLinks.forEach((link) => {
      link.classList.toggle("active", link.dataset.hobby === key);
    });
  }

  function showDefaultGallery() {
    activeHandle.stop();
    stopPlayer(galleryEl);
    galleryEl.innerHTML = defaultMarkup;
    activeHandle = createCarousel(galleryEl, { autoRotate: true });
    activeHobby = null;
    setActiveLink(null);
  }

  function showCategory(key) {
    const cat = hobbyCategories[key];
    if (!cat) return;

    activeHandle.stop();
    stopPlayer(galleryEl);

    if (cat.type === "gallery") {
      galleryEl.innerHTML = buildCategoryBar(cat.title) + buildGalleryInner(cat.images);
      activeHandle = createCarousel(galleryEl, { autoRotate: false });
    } else if (cat.type === "videos") {
      galleryEl.innerHTML = buildCategoryBar(cat.title) + `<div class="video-list">${buildPlaceholderMarkup("Loading videos...")}</div>`;
      loadYouTubeCards(galleryEl.querySelector(".video-list"), "videos.json", buildVideoCard);
      activeHandle = { stop() { } };
    } else if (cat.type === "playlists") {
      galleryEl.innerHTML = buildCategoryBar(cat.title) + `<div class="video-list">${buildPlaceholderMarkup("Loading playlists...")}</div>`;
      loadYouTubeCards(galleryEl.querySelector(".video-list"), "playlists.json", buildPlaylistCard);
      activeHandle = { stop() { } };
    } else if (cat.type === "player") {
      galleryEl.innerHTML = buildCategoryBar(cat.title) + buildPlayerMarkup();
      wirePlayer(galleryEl);
      activeHandle = { stop() { } };
    } else {
      galleryEl.innerHTML = buildCategoryBar(cat.title) + buildPlaceholderMarkup(cat.message);
      activeHandle = { stop() { } };
    }

    galleryEl.querySelector("#gallery-back-btn")?.addEventListener("click", showDefaultGallery);

    activeHobby = key;
    setActiveLink(key);
    galleryEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hobbyLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const key = link.dataset.hobby;
      if (activeHobby === key) {
        showDefaultGallery();
      } else {
        showCategory(key);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
