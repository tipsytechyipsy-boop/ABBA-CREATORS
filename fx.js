/* ABBA Creators — extra graphics & animations (runs on every page) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };

  const ICON = {
    bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></svg>',
    cursor: '<svg viewBox="0 0 24 24"><path d="M5 3v15l4-4 3 7 3-1-3-7h6z"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></svg>',
    squig: '<svg viewBox="0 0 70 20"><path d="M3 12c8-10 14 6 22-2s14 6 22-2 14 6 20-2"/></svg>',
  };

  /* ---------- scroll progress bar ---------- */
  const bar = document.body.appendChild(el('<div class="progress" aria-hidden="true"></div>'));
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? scrollY / max : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- floating decor shapes ---------- */
  const shape = (type, x, y, d, t, dl) =>
    `<span class="fl" style="left:${x}%;top:${y}%;--d:${d}"><span class="shape ${type}" style="--t:${t}s;--dl:${dl}s">${type === "bolt" || type === "squig" ? ICON[type] : ""}${type === "brk" ? "&lt;/&gt;" : ""}</span></span>`;

  function decorate(host, items, blobs = []) {
    if (!host) return;
    const d = el('<div class="decor" aria-hidden="true"></div>');
    d.innerHTML = blobs.map(([c, x, y]) => `<span class="blob ${c}" style="left:${x}%;top:${y}%"></span>`).join("")
      + items.map((i) => shape(...i)).join("");
    host.prepend(d);
  }
  // [type, x%, y%, parallax depth, float seconds, delay]
  decorate(document.querySelector(".hero"), [
    ["ring", 2, 8, 30, 7, 0], ["plus", 44, 6, -20, 6, -2], ["bolt", 93, 4, 40, 5, -1],
    ["brk", 40, 86, -25, 8, -3], ["dots", 1, 78, 15, 9, 0], ["squig", 88, 92, 35, 6, -4],
  ], [["g", 50, 2], ["y", 72, 40]]);
  decorate(document.querySelector(".page-hero"), [
    ["ring", 86, 18, 30, 7, 0], ["bolt", 70, 8, -30, 5, -1], ["plus", 94, 70, 20, 6, -2],
    ["dots", 78, 60, -15, 9, 0], ["squig", 60, 80, 25, 6, -3],
  ], [["g", 72, -30]]);
  decorate(document.querySelector(".contact"), [
    ["plus", 4, 10, 20, 6, 0], ["brk", 42, 80, -20, 8, -2], ["ring", 46, 6, 30, 7, -1], ["dots", 2, 82, 15, 9, -3],
  ]);
  const cta = document.querySelector(".cta");
  if (cta) cta.prepend(el('<span class="blob g"></span>'), el('<span class="blob y"></span>'));

  /* ---------- hero chips ---------- */
  const visual = document.querySelector(".hero-visual");
  if (visual) {
    visual.append(
      el(`<div class="chip c1" aria-hidden="true"><i>${ICON.bolt}</i>Super fast</div>`),
      el(`<div class="chip c2" aria-hidden="true"><i>${ICON.phone}</i>Mobile ready</div>`),
      el(`<div class="chip c3" aria-hidden="true"><i>${ICON.search}</i>SEO ready</div>`),
    );
  }

  /* ---------- second marquee row ---------- */
  const track = document.querySelector(".marquee-track");
  if (track) { const t2 = track.cloneNode(true); t2.classList.add("rev"); track.after(t2); }

  /* ---------- founder orbit ---------- */
  const avatar = document.querySelector(".founder-avatar");
  if (avatar) avatar.prepend(el(`<div class="orbit"><i>${ICON.code}</i><i>${ICON.bolt}</i><i>${ICON.cursor}</i></div>`));

  /* ---------- squiggle under highlighted words ---------- */
  $$(".hl").forEach((h) =>
    h.append(el('<svg class="squiggle" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 6 Q 14 1 26 6 T 50 6 T 74 6 T 98 5"/></svg>'))
  );

  /* ---------- split headlines into words ---------- */
  const heads = $$(".hero h1, .page-hero h1, .section-head h2, .cta h2, .contact-title, .founder-copy h2");
  heads.forEach((h) => {
    let i = 0;
    const out = document.createDocumentFragment();
    [...h.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { out.append(" "); return; }
          const s = document.createElement("span");
          s.className = "w"; s.style.setProperty("--i", i++); s.textContent = part;
          out.append(s);
        });
      } else if (n.nodeName === "BR") {
        out.append(n);
      } else {
        const s = document.createElement("span");
        s.className = "w"; s.style.setProperty("--i", i++); s.append(n);
        out.append(s);
      }
    });
    h.textContent = "";
    h.append(out);
    h.classList.add("split");
  });

  /* ---------- in-view trigger ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  [...heads, ...$$(".steps"), ...$$(".squiggle")].forEach((n) => io.observe(n));

  if (reduce) return; // everything below is pointer-driven motion

  /* ---------- shine on solid buttons ---------- */
  $$(".btn:not(.btn-ghost)").forEach((b) => b.append(el('<span class="shine" aria-hidden="true"></span>')));

  /* ---------- mouse parallax for decor + hero tilt ---------- */
  const root = document.documentElement;
  addEventListener("pointermove", (e) => {
    const mx = (e.clientX / innerWidth) * 2 - 1;
    const my = (e.clientY / innerHeight) * 2 - 1;
    root.style.setProperty("--mx", mx.toFixed(3));
    root.style.setProperty("--my", my.toFixed(3));
    if (visual) {
      visual.style.setProperty("--ry", (mx * 8).toFixed(2) + "deg");
      visual.style.setProperty("--rx", (-my * 6).toFixed(2) + "deg");
    }
  }, { passive: true });

  if (!finePointer) return; // rest is mouse-only

  /* ---------- cursor ring ---------- */
  const ring = document.body.appendChild(el('<div class="cursor-ring" aria-hidden="true"></div>'));
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; ring.classList.add("on"); });
  document.addEventListener("pointerleave", () => ring.classList.remove("on"));
  addEventListener("pointerdown", () => ring.classList.add("down"));
  addEventListener("pointerup", () => ring.classList.remove("down"));
  document.addEventListener("pointerover", (e) => {
    ring.classList.toggle("hover", !!e.target.closest("a, button, summary, select, input, textarea, .card, .price-tag"));
  });
  (function loop() {
    cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
    ring.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  })();

  /* ---------- card tilt + spotlight ---------- */
  $$(".card, .price-tag").forEach((c) => {
    const tilt = c.classList.contains("card");
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty("--x", x + "px");
      c.style.setProperty("--y", y + "px");
      if (tilt) {
        c.classList.add("tilting");
        const ry = (x / r.width - 0.5) * 12, rx = -(y / r.height - 0.5) * 12;
        c.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      }
    });
    c.addEventListener("pointerleave", () => { c.classList.remove("tilting"); c.style.transform = ""; });
  });

  /* ---------- magnetic buttons ---------- */
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.translate = `${dx * 0.18}px ${dy * 0.3}px`;
    });
    b.addEventListener("pointerleave", () => (b.style.translate = ""));
  });
})();
