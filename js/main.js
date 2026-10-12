(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Edite aqui: tratamentos oferecidos (ícones disponíveis no sprite do index.html)
  const TREATMENTS = [
    { icon: "tooth", title: "Clínico geral", text: "Consultas, avaliação e prevenção para manter a saúde bucal em dia." },
    { icon: "sparkle", title: "Limpeza", text: "Remoção de placa e tártaro com orientações de higiene." },
    { icon: "shield", title: "Restaurações", text: "Tratamento de cáries com materiais da cor do dente." },
    { icon: "smile", title: "Clareamento", text: "Dentes mais claros com acompanhamento profissional." },
    { icon: "heart", title: "Odontopediatria", text: "Atendimento leve e acolhedor para as crianças." },
    { icon: "star", title: "Estética dental", text: "Ajustes para um sorriso mais harmônico e natural." },
    { icon: "calendar", title: "Prevenção", text: "Retornos periódicos para cuidar antes que o problema apareça." },
    { icon: "chat", title: "Avaliação", text: "Conversa e exame para montar o seu plano de cuidado." },
  ];

  // Edite aqui: copie avaliações reais do Google. avatar = classe do style.css (mayara, maria, anna, zeni, janete, debora, julia)
  // Ex.: { name: "Mayara S.", avatar: "mayara", stars: 5, when: "há 2 meses", text: "..." }
  const TESTIMONIALS = [];

  // Header + menu
  const header = $("[data-header]");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("[data-menu-toggle]");
  const nav = $("[data-nav]");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });

  // Tratamentos
  $("#treatment-grid").innerHTML = TREATMENTS.map((t) =>
    `<article class="treatment-card reveal"><span class="icon-disc"><svg><use href="#icon-${t.icon}" /></svg></span><div><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></div></article>`
  ).join("");

  // Depoimentos
  const shell = $(".testimonial-shell");
  const status = $("#slider-status");
  if (!TESTIMONIALS.length) {
    shell.hidden = true;
    status.hidden = true;
  } else {
    const track = $("#testimonial-track");
    track.innerHTML = TESTIMONIALS.map((t, i) => {
      const n = Math.max(0, Math.min(5, t.stars || 5));
      return `<article class="testimonial-card" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${TESTIMONIALS.length}">
        <div class="reviewer"><span class="review-avatar avatar-${esc(t.avatar || "")}" aria-hidden="true">${esc(t.name.charAt(0))}</span>
        <div><strong>${esc(t.name)}</strong><span>${esc(t.when || "Avaliação no Google")}</span></div>
        <span class="review-stars" aria-label="${n} de 5 estrelas">${"★".repeat(n)}<span class="empty-stars">${"★".repeat(5 - n)}</span></span></div>
        <span class="quote" aria-hidden="true">“</span><blockquote>${esc(t.text)}</blockquote></article>`;
    }).join("");
    const cards = $$(".testimonial-card", track);
    const viewport = $(".testimonial-viewport");
    let index = 0;
    const go = (i) => {
      index = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      cards.forEach((c, j) => c.setAttribute("aria-hidden", String(j !== index)));
      viewport.style.height = cards[index].offsetHeight + "px";
      status.textContent = `${index + 1} de ${cards.length}`;
    };
    $("[data-slide-prev]").addEventListener("click", () => go(index - 1));
    $("[data-slide-next]").addEventListener("click", () => go(index + 1));
    let startX = null;
    viewport.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener("touchend", (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
    window.addEventListener("resize", () => go(index));
    go(0);
  }

  // FAQ
  $$("[data-accordion] button[aria-controls]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    });
  });

  // Aberto/fechado agora (horário de Brasília), seg–sex 09:00–18:00
  const openStatus = $("#open-status");
  const updateStatus = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]));
    const mins = Number(parts.hour) * 60 + Number(parts.minute);
    const open = !["Sat", "Sun"].includes(parts.weekday) && mins >= 540 && mins < 1080;
    openStatus.textContent = open ? "Aberto agora" : "Fechado agora";
    openStatus.classList.toggle("is-closed", !open);
  };
  updateStatus();
  setInterval(updateStatus, 60000);

  $("#copyright-year").textContent = new Date().getFullYear();

  // Lightbox
  const lightbox = $("[data-lightbox]");
  $("[data-lightbox-open]").addEventListener("click", () => lightbox.showModal());
  $("[data-lightbox-close]").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });

  // Animação de entrada
  const reveals = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }
})();
