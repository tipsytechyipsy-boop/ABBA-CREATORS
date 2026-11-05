/* ABBA Creators — animated logo preloader.
   Loaded as the first thing inside <body>. Only runs when the inline
   script in <head> added html.preload (first page view per session). */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains("preload")) return;

  const loader = document.createElement("div");
  loader.className = "loader";
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-label", "Loading ABBA Creators");
  loader.innerHTML = `
<svg class="loader-logo" viewBox="0 0 640 400" aria-hidden="true">
  <defs><clipPath id="lg-clip"><rect x="104" y="120" width="432" height="160"/></clipPath></defs>
  <g transform="rotate(-3 320 205)">
    <g class="lg-frame">
      <rect class="lg-outline" pathLength="1" x="80" y="70" width="480" height="270" rx="46"/>
      <g class="lg-fill">
        <path fill="#22b43a" fill-rule="evenodd" d="M126 70h388a46 46 0 0 1 46 46v178a46 46 0 0 1-46 46H126a46 46 0 0 1-46-46V116a46 46 0 0 1 46-46zM132 124a28 28 0 0 0-28 28v136a28 28 0 0 0 28 28h376a28 28 0 0 0 28-28V152a28 28 0 0 0-28-28z"/>
        <circle class="lg-dot" cx="150" cy="97" r="10" fill="#fff"/>
        <circle class="lg-dot" cx="184" cy="97" r="10" fill="#fff"/>
        <circle class="lg-dot" cx="218" cy="97" r="10" fill="#fff"/>
      </g>
    </g>
    <g class="lg-code">
      <path pathLength="1" d="M462 140 L444 154 L462 168"/>
      <path pathLength="1" d="M488 134 L474 174"/>
      <path pathLength="1" d="M500 140 L518 154 L500 168"/>
    </g>
    <g class="lg-abba" clip-path="url(#lg-clip)" text-anchor="middle">
      <text x="200" y="262">A</text><text x="281" y="262">B</text><text x="359" y="262">B</text><text x="440" y="262">A</text>
    </g>
    <text class="lg-creators" x="326" y="304" text-anchor="middle">CREATORS</text>
  </g>
  <path class="lg-string" pathLength="1" d="M34 130 C 40 92, 84 70, 122 72"/>
  <g class="lg-tag">
    <g class="lg-swing" transform="translate(4 112)">
      <path class="lg-tag-body" d="M30 0 L62 28 Q66 32 66 38 V112 Q66 120 58 120 H2 Q-6 120 -6 112 V38 Q-6 32 -2 28 Z"/>
      <circle class="lg-tag-hole" cx="30" cy="24" r="8"/>
      <path class="lg-bolt" d="M36 48 L18 80 H31 L25 104 L45 70 H32 Z"/>
    </g>
  </g>
  <g transform="translate(546 292)"><g class="lg-cursor">
    <g class="lg-cursor-in"><path d="M0 0 L0 58 L15 44 L26 68 L38 62 L27 39 L47 39 Z"/></g>
  </g></g>
  <g class="lg-ticks">
    <line pathLength="1" x1="560" y1="268" x2="572" y2="244"/>
    <line pathLength="1" x1="578" y1="282" x2="602" y2="268"/>
  </g>
</svg>
<div class="loader-meta"><span class="loader-bar"><i></i></span><span class="loader-pct">0%</span></div>`;
  document.body.prepend(loader);

  const bar = loader.querySelector(".loader-bar");
  const pct = loader.querySelector(".loader-pct");
  const MIN = 3300;           // let the logo animation play out
  const MAX_WAIT = 6000;      // never hold people longer than this
  const t0 = performance.now();
  let pageLoaded = document.readyState === "complete";
  addEventListener("load", () => (pageLoaded = true));

  function tick(now) {
    const t = now - t0;
    // progress follows the animation, but parks at 90% until the page is loaded
    let p = Math.min(1, t / MIN);
    if (!pageLoaded && t < MAX_WAIT) p = Math.min(p, 0.9);
    bar.style.setProperty("--lp", p.toFixed(3));
    pct.textContent = Math.round(p * 100) + "%";
    if (p >= 1) return finish();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function finish() {
    // close the loader into the nav logo, so the logo "lands" there
    const target = document.querySelector(".nav .brand-logo");
    if (target) {
      const r = target.getBoundingClientRect();
      loader.style.setProperty("--cx", r.left + r.width / 2 + "px");
      loader.style.setProperty("--cy", r.top + r.height / 2 + "px");
      const logo = loader.querySelector(".loader-logo").getBoundingClientRect();
      const dx = r.left + r.width / 2 - (logo.left + logo.width / 2);
      const dy = r.top + r.height / 2 - (logo.top + logo.height / 2);
      loader.querySelector(".loader-logo").style.transform = `translate(${dx}px, ${dy}px) scale(.08)`;
    }
    loader.classList.add("out");
    try { sessionStorage.setItem("abba-loaded", "1"); } catch (e) {}
    setTimeout(() => {
      root.classList.remove("preload");
      if (target) target.classList.add("landed");
    }, 450);
    setTimeout(() => loader.remove(), 900);
  }
})();
