const projects = {
  "poki-buddies": {
    title: "Poki-Buddies",
    img: "https://chris-joshua-mls.github.io/mod-4-project/assets/Pok%C3%A9_Ball_icon.svg-B25Vjv1-.png",
    description: "A database showing pokemon data.",
    tech: "HTML5, CSS, JavaScript, Vite",
    links: [
      { label: "Github", href: "https://github.com/Chris-Joshua-mls/mod-4-project#" },
      { label: "Website", href: "https://chris-joshua-mls.github.io/mod-4-project/index.html#" },
      { label: "Presentation", href: "https://docs.google.com/presentation/d/1MCOgjTPmdV_wc5ffClV0qXhkc3JwY_rhRSjS90crJDs/edit?usp=sharing#" },
    ],
  },
  "portfolio": {
    title: "Personal Portfolio",
    img: "img/Marcy-422.jpg",
    description: "My own portfolio that states who I am and lists my projects.",
    tech: "HTML5, CSS, Formspree, JS",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/joshuacakinyemi-collab.github.io#" },
    ],
  },
  "cli": {
    title: "Triple-CLI-Project",
    img: "https://avatars.githubusercontent.com/u/59704711?s=200&v=4",
    description: "Three different CLI applications using command-line task manager.",
    tech: "JavaScript",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/Triple-CLI-Project#" },
    ],
  },
  "playlist maker": {
    title: "Shady Music Maker",
    img: "https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/cd.png",
    description: "A place to create personalized playlists with music that you can share with other users",
    tech: "React, JS, CSS, HTML",
    links: [
      { label: "Github", href: "https://github.com/The-Marcy-Lab-School-Assignments/full-stack-project-remix-joshuacakinyemi-collab/tree/main#" },
      { label: "Website", href: "https://full-stack-project-remix-joshuacakinyemi.onrender.com/#" }
    ],
  },
  "Digital Arcade": {
    title: "The Totally retro arcade",
    img: "https://www.svgrepo.com/show/535360/d-pad.svg",
    description: "A collection of arcade game, recreated in JavaScript.",
    tech: "HTML, CSS, JS",
    links: [
      { label: "Github", href: "https://github.com/joshuacakinyemi-collab/Arcade" },
      { label: "Website", href: "https://joshuacakinyemi-collab.github.io/Arcade/index.html" }
    ],
  },
  "ChainBase": {
    title: "ChainBase",
    img: "img/ChainBase.png",
    description: "A platform that automates monthly USDC dividend payouts to verified recipients on Ethereum.",
    tech: "React, FastAPI (Python), PostgreSQL, Solidity, Web3.py, APScheduler, Web3Auth",
    links: [
      { label: "Github", href: "https://github.com/Citizen-Dividend-ProjectHub/ChainBase" },
      { label: "Presentation", href: "https://docs.google.com/presentation/d/1cS0VY_6CTQrWia__l87NA5hlH-lbLlFNMnBdBbjO1Co/edit?usp=sharing" },
    ],
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

function togglePanel(sidebar, projectId) {
  const existing = sidebar.querySelector(".project-panel");

  if (existing && existing.dataset.panelFor === projectId) {
    existing.classList.remove("panel-open");
    existing.addEventListener("transitionend", () => existing.remove(), { once: true });

    const btn = sidebar.querySelector(`.wii-system-button[data-project="${projectId}"]`);
    if (btn) btn.classList.remove("active");
    return;
  }

  if (existing) {
    existing.remove();
    sidebar.querySelectorAll(".wii-system-button.active").forEach(b => b.classList.remove("active"));
  }

  const panel = buildPanel(projectId);
  if (!panel) return;

  sidebar.appendChild(panel);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => panel.classList.add("panel-open"));
  })

  const btn = sidebar.querySelector(`.wii-system-button[data-project="${projectId}"]`)
  if (btn) btn.classList.add("active");

  panel.querySelector(".panel-close").addEventListener("click", () => {
    togglePanel(sidebar, projectId);
  });
}

function init() {
  document.querySelectorAll(".wii-system-button[data-project]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sidebar = btn.closest(".sidebar");
      const projectId = btn.dataset.project;
      togglePanel(sidebar, projectId)
    })
  })
}

document.addEventListener("DOMContentLoaded", init)