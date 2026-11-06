(() => {
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* nav: border on scroll + mobile menu */
  const nav = document.querySelector(".nav");
  addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });
  const toggle = $("nav-toggle");
  if (toggle) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));
    document.querySelectorAll("#nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* rotating hero word (home only) */
  const w = $("rotate-word");
  if (w && !reduce) {
    const words = ["click", "sell", "load fast", "stand out", "convert"];
    let wi = 0;
    setInterval(() => {
      w.classList.add("out");
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        w.textContent = words[wi];
        w.classList.remove("out");
      }, 320);
    }, 2400);
  }

  /* self-building browser (home only) */
  const codeEl = $("code");
  if (codeEl) {
    const renderParts = [...document.querySelectorAll("#render > *")];
    const btn = $("r-btn");
    const cursor = $("fake-cursor");
    const visual = document.querySelector(".hero-visual");
    const lines = [
      ['<span class="t">&lt;nav&gt;</span>', 0],
      ['  <span class="t">&lt;a</span> <span class="a">href</span>=<span class="s">"/"</span><span class="t">&gt;</span>Home<span class="t">&lt;/a&gt;</span>', null],
      ['<span class="t">&lt;/nav&gt;</span>', null],
      ['<span class="t">&lt;section</span> <span class="a">class</span>=<span class="s">"hero"</span><span class="t">&gt;</span>', 1],
      ['  <span class="t">&lt;h1&gt;</span>Your brand<span class="t">&lt;/h1&gt;</span>', null],
      ['  <span class="t">&lt;button&gt;</span>Book now<span class="t">&lt;/button&gt;</span>', null],
      ['<span class="t">&lt;/section&gt;</span>', null],
      ['<span class="t">&lt;Cards</span> <span class="a">items</span>={<span class="a">3</span>} <span class="t">/&gt;</span>', 2],
    ];
    const moveCursorTo = (el) => {
      const v = visual.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      cursor.style.left = r.left - v.left + r.width * 0.55 + "px";
      cursor.style.top = r.top - v.top + r.height * 0.4 + "px";
    };
    (async function build() {
      if (reduce) {
        codeEl.innerHTML = lines.map((l) => l[0]).join("\n");
        renderParts.forEach((p) => p.classList.add("on"));
        return;
      }
      while (true) {
        codeEl.innerHTML = "";
        renderParts.forEach((p) => p.classList.remove("on"));
        cursor.style.left = "75%"; cursor.style.top = "88%";
        let html = "";
        for (const [line, part] of lines) {
          html += (html ? "\n" : "") + line;
          codeEl.innerHTML = html + '<span class="caret"></span>';
          if (part !== null) renderParts[part].classList.add("on");
          await sleep(420);
        }
        await sleep(500);
        moveCursorTo(btn);
        await sleep(1200);
        btn.classList.add("pressed");
        const r = btn.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2);
        await sleep(160);
        btn.classList.remove("pressed");
        btn.textContent = "Booked ✓";
        await sleep(2600);
        btn.textContent = "Book now";
      }
    })();
  }

  /* click burst — like the green ticks on the logo cursor */
  function burst(x, y) {
    if (reduce) return;
    const b = document.createElement("div");
    b.className = "burst";
    b.style.left = x + "px"; b.style.top = y + "px";
    [-55, -15, 25].forEach((deg) => {
      const i = document.createElement("i");
      i.style.setProperty("--r", deg + "deg");
      b.appendChild(i);
    });
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 500);
  }
  addEventListener("pointerdown", (e) => burst(e.clientX, e.clientY));

  /* scroll reveal + stat counters */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      const n = en.target.querySelector("[data-count]");
      if (n) count(n);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  function count(el) {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1200;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* contact page: preselect plan from ?plan=Business, send via WhatsApp or email */
  const form = $("contact-form");
  if (form) {
    const plan = new URLSearchParams(location.search).get("plan");
    const select = $("plan-select");
    if (plan && [...select.options].some((o) => o.value === plan)) select.value = plan;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const name = d.get("name"), email = d.get("email"), need = d.get("plan"), msg = d.get("message");
      if (e.submitter && e.submitter.value === "email") {
        const subject = `New project: ${need} — ${name}`;
        const body = `${msg}

From: ${name}${email ? ` (${email})` : ""}`;
        location.href = `mailto:bennitonf@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        $("form-note").textContent = "Opening your email app… we'll reply within 24h!";
      } else {
        const text = `Hi ABBA Creators! I'm ${name}.
I need: ${need}

${msg}${email ? `

Email: ${email}` : ""}`;
        window.open(`https://wa.me/917030955722?text=${encodeURIComponent(text)}`, "_blank", "noopener");
        $("form-note").textContent = "Opening WhatsApp with your message ready to send…";
      }
    });
  }

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();
})();
