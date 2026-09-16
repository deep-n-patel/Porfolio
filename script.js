// DOM helpers and footer year
const qs = (selector, scope = document) => scope.querySelector(selector);
// Return an array for multi-element selections so array methods are available.
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

qs("#year").textContent = new Date().getFullYear();

// Exploration XP
// XP reflects scroll depth (0–500), independently of collectible progress.
const updateXP = () => {
  // A page shorter than the viewport has no scrollable distance to divide by.
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? Math.min(scrollY / max, 1) : 0;
  const xp = Math.round(progress * 500);
  qs("#xpFill").style.width = `${progress * 100}%`;
  qs("#xpCount").textContent = String(xp).padStart(3, "0");
  qs("#level").textContent = String(Math.min(5, Math.floor(xp / 100) + 1)).padStart(2, "0");
};
addEventListener("scroll", updateXP, { passive: true });
updateXP();

// Player card tilt
// Fine pointers get a hover interaction; touch devices keep the resting pose.
const tiltCard = qs(".tilt-card");
if (matchMedia("(pointer:fine)").matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const rect = tiltCard.getBoundingClientRect();
    // Normalize the pointer around the card's center, then scale to degrees.
    const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
    const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    tiltCard.style.transform = `rotate(3deg) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  tiltCard.addEventListener(
    "pointerleave",
    () => (tiltCard.style.transform = "rotate(3deg) rotateX(0) rotateY(0)"),
  );
}

// Collectible shards
// Collection state lasts for this page visit and resets when the page reloads.
let shardTotal = 0;
let toastTimer;
qsa("[data-shard]").forEach((shard) =>
  shard.addEventListener("click", () => {
    // Ignore repeated clicks while the collection animation finishes.
    if (shard.classList.contains("collected")) return;
    shard.classList.add("collected");
    shardTotal += 1;
    qs("#shardCount").textContent = `${shardTotal} / 5`;
    qs("#toastCount").textContent = shardTotal;
    qs("#toast").classList.add("show");
    // Restart the notification timer when shards are collected in quick succession.
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => qs("#toast").classList.remove("show"), 2100);
    if (shardTotal === 5) {
      // Five shards are defined in index.html, along with the visible total labels.
      const locked = qs("#lockedFact");
      locked.classList.add("unlocked");
      locked.innerHTML = `
        <div class="lock-icon">🧙</div>
        <div>
          <small>SECRET LORE UNLOCKED</small>
          <h3>
            From a chess opponent to safer Winnipeg routes, I’ve explored AI on both
            the game board and the city map.
          </h3>
        </div>
        <span>5 / 5</span>
      `;
    }
  }),
);

// Terminal commands
// Keys match the shortcut buttons' data-command attributes in index.html.
// These HTML strings are authored locally; never insert visitor input here.
const responses = {
  skills:
    "Python · Java · SQL · C/C++ · JavaScript · TypeScript · R · Assembly · React · Node.js · Airflow · Snowflake · dbt · Power BI · PostgreSQL · MySQL · SQLite · Firestore · Neo4j · AWS · Terraform · Docker · GitHub Actions",
  projects: `Merginator · Finus · SafePath · Keep Me Alive · Chess AI · Chicago Crashes · SpendSense. <a href="#quests">Explore the project log ↑</a>`,
  education:
    "University of Manitoba · Bachelor of Computer Science, Honours (Co-op Option) · Minor in Mathematics and Statistics · GPA 3.91/4.50",
  quest:
    "My current objective: keep learning and build useful software, thoughtful AI projects, and dependable data systems.",
  funfact:
    "Our SafePath project won Best AI-Integrated Hack at UWinnipeg Hacks 2026. I’ve also taken my teamwork skills to Model United Nations in Nairobi.",
  contact: `
    Open comms channel:
    <a href="https://github.com/deep-n-patel" target="_blank" rel="noreferrer">GitHub ↗</a> ·
    <a href="https://www.linkedin.com/in/deep-patel-b7a2a3385/" target="_blank" rel="noreferrer">LinkedIn ↗</a> ·
    <a href="mailto:pateld43@myumanitoba.ca">Email ↗</a>
  `,
};
const terminalOutput = qs("#terminalOutput");
const addTerminalLine = (command) => {
  // Each command replaces the idle prompt, adds its response, then starts a new prompt.
  const activeLine = terminalOutput.lastElementChild;
  activeLine.innerHTML = `<span class="prompt">deep@quest:~$</span> ${command}`;
  const response = document.createElement("p");
  response.className = "terminal-response";
  response.innerHTML = responses[command];
  terminalOutput.append(response);
  const prompt = document.createElement("p");
  prompt.innerHTML = `<span class="prompt">deep@quest:~$</span> <span class="cursor">▌</span>`;
  terminalOutput.append(prompt);
  // Keep the newest response visible once the terminal starts scrolling internally.
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};
qsa("[data-command]").forEach((button) =>
  button.addEventListener("click", () => addTerminalLine(button.dataset.command)),
);
qs("#clearTerminal").addEventListener("click", () => {
  terminalOutput.innerHTML = `<p><span class="prompt">deep@quest:~$</span> <span class="cursor">▌</span></p>`;
});

// Type the introductory command once, after a short pause.
const phrase = "run portfolio --fun-mode";
let typedIndex = 0;
const typePhrase = () => {
  const typedCommand = qs("#typedCommand");
  // Clear or a shortcut can remove this span before typing finishes.
  if (typedCommand && typedIndex <= phrase.length) {
    typedCommand.textContent = phrase.slice(0, typedIndex++);
    setTimeout(typePhrase, 55);
  }
};
setTimeout(typePhrase, 900);

// Scroll animations
// Content is visible by default in CSS. Skip these effects if the CDN is unavailable
// or reduced motion is requested; the terminal, XP, and collectibles still work.
if (
  window.gsap &&
  window.ScrollTrigger &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  gsap.registerPlugin(ScrollTrigger);
  // Reveal each marked block once as it enters the viewport.
  gsap.utils.toArray(".reveal").forEach((element) => {
    gsap.from(element, {
      y: 60,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      scrollTrigger: { trigger: element, start: "top 86%", once: true },
    });
  });
  gsap.utils.toArray(".quest-card").forEach((card, index) => {
    // Alternate icon rotation; scrub ties the animation to scroll position.
    gsap.from(card.querySelector(".quest-icon"), {
      rotate: index % 2 ? 10 : -10,
      scale: 0.7,
      scrollTrigger: { trigger: card, start: "top 80%", scrub: 1, end: "top 45%" },
    });
  });
  // Subtle hero movement continues while the hero scrolls out of view.
  gsap.to(".orbit-one", {
    rotate: 90,
    y: 80,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
  gsap.to(".player-card", {
    y: -35,
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 },
  });
}
