document.addEventListener("DOMContentLoaded", () => {
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* =========================================================
       TEMA CLARO / ESCURO
       ========================================================= */
    const themeBtn = $("#theme-toggle");

    function applyTheme(theme) {
        document.body.classList.toggle("dark-theme", theme === "dark");
        if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀" : "☾";
        localStorage.setItem("theme", theme);
    }

    applyTheme(localStorage.getItem("theme") || "light");

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            applyTheme(document.body.classList.contains("dark-theme") ? "light" : "dark");
        });
    }

    /* =========================================================
       IDIOMA PT / EN
       Qualquer elemento com data-pt e data-en é traduzido.
       ========================================================= */
    const langBtn = $("#lang-toggle");
    let currentLang = localStorage.getItem("preferredLanguage") || "pt";

    function applyLanguage(lang) {
        document.documentElement.lang = lang === "pt" ? "pt-br" : "en";
        $$("[data-pt][data-en]").forEach(el => {
            el.innerHTML = el.getAttribute(`data-${lang}`);
        });
        if (langBtn) langBtn.textContent = lang === "pt" ? "EN" : "PT";
        localStorage.setItem("preferredLanguage", lang);
        currentLang = lang;
    }

    applyLanguage(currentLang);

    if (langBtn) {
        langBtn.addEventListener("click", () => {
            applyLanguage(currentLang === "pt" ? "en" : "pt");
        });
    }

    /* =========================================================
       RELÓGIO (horário de São Paulo)
       ========================================================= */
    const clock = $("#clock");

    if (clock) {
        const fmt = new Intl.DateTimeFormat("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
        const tick = () => { clock.textContent = fmt.format(new Date()) + " SP"; };
        tick();
        setInterval(tick, 1000);
    }

    /* =========================================================
       PÁGINA DE PROJETOS: lista <-> detalhe via #hash
       (ex.: projetos.html#coisas-convida)
       ========================================================= */
    const list = $("#list");
    const details = $$(".detail");

    if (list && details.length) {
        const route = () => {
            const id = decodeURIComponent(location.hash.slice(1));
            const target = details.find(d => d.id === id);

            details.forEach(d => {
                const isOpen = d === target;
                d.classList.toggle("open", isOpen);
                $$("video", d).forEach(v => {
                    if (isOpen && !v.hasAttribute("data-manual")) v.play().catch(() => {});
                    else v.pause();
                });
            });

            list.hidden = Boolean(target);
            window.scrollTo(0, 0);
        };

        window.addEventListener("hashchange", route);
        route();
    }

    /* =========================================================
       LIGHTBOX (imagens com data-lightbox="grupo")
       ========================================================= */
    const lightbox = $("#lightbox");

    if (lightbox) {
        const lbImg = $(".lightbox-img", lightbox);
        const lbCap = $(".lightbox-caption", lightbox);
        const prev = $(".lb-prev", lightbox);
        const next = $(".lb-next", lightbox);
        let group = [];
        let index = 0;

        function show(i) {
            index = (i + group.length) % group.length;
            const img = group[index];
            stopVideo();
            lbImg.hidden = false;
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt;
            lbCap.textContent = img.alt || "";
            prev.hidden = next.hidden = group.length < 2;
        }

        function open(img) {
            group = $$(`img[data-lightbox="${img.dataset.lightbox}"]`);
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
            show(group.indexOf(img));
        }

        const lbVid = $(".lightbox-video", lightbox);

        function stopVideo() {
            if (!lbVid) return;
            lbVid.pause();
            lbVid.removeAttribute("src");
            lbVid.load();
            lbVid.hidden = true;
        }

        function openVideo(video) {
            if (!lbVid) return;
            const src = video.currentSrc || video.querySelector("source")?.src;
            if (!src) return;
            const t = video.currentTime || 0;
            video.pause();
            group = [];
            lbImg.hidden = true;
            lbImg.removeAttribute("src");
            prev.hidden = next.hidden = true;
            lbCap.textContent = video.closest("figure")?.querySelector(".cap")?.textContent || "";
            lbVid.hidden = false;
            lbVid.src = src;
            lbVid.addEventListener("loadedmetadata", () => { lbVid.currentTime = t; }, { once: true });
            lbVid.muted = false;
            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
            lbVid.play().catch(() => {});
        }

        /* botão de ampliar em cada vídeo dos projetos */
        $$(".detail video").forEach(video => {
            const wrap = document.createElement("div");
            wrap.className = "vid-wrap";
            video.parentNode.insertBefore(wrap, video);
            wrap.appendChild(video);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "vid-expand";
            btn.setAttribute("aria-label", "Ampliar vídeo");
            btn.innerHTML = "&#x2922;";
            btn.addEventListener("click", e => { e.preventDefault(); openVideo(video); });
            wrap.appendChild(btn);
        });

        function close() {
            stopVideo();
            lightbox.classList.remove("active");
            document.body.style.overflow = "";
        }

        document.addEventListener("click", e => {
            const img = e.target.closest("img[data-lightbox]");
            if (img) open(img);
        });

        prev.addEventListener("click", e => { e.stopPropagation(); show(index - 1); });
        next.addEventListener("click", e => { e.stopPropagation(); show(index + 1); });
        $(".lb-close", lightbox).addEventListener("click", close);

        lightbox.addEventListener("click", e => {
            if (e.target === lightbox) close();
        });

        document.addEventListener("keydown", e => {
            if (!lightbox.classList.contains("active")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight" && group.length > 1) show(index + 1);
            if (e.key === "ArrowLeft" && group.length > 1) show(index - 1);
        });
    }

    /* =========================================================
       SOM DO DESTAQUE (vídeo começa mudo; botão liga/desliga)
       ========================================================= */
    $$(".sound-toggle").forEach(btn => {
        const video = btn.closest("figure")?.querySelector("video");
        if (!video) return;
        const sync = () => {
            const on = !video.muted;
            btn.textContent = on ? "🔊" : "🔈";
            btn.setAttribute("aria-label", on ? "Desativar som" : "Ativar som");
        };
        btn.addEventListener("click", () => {
            video.muted = !video.muted;
            if (!video.muted) video.play().catch(() => {});
            sync();
        });
        sync();
    });

    /* =========================================================
       INTERAÇÕES (repaginada 2026-11)
       ========================================================= */
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const isEN = () => document.documentElement.lang.startsWith("en");

    /* ---------- Vídeos dos cards só tocam quando estão na tela ---------- */
    const autoVideos = $$(".card .media video, .featured-media video");
    if ("IntersectionObserver" in window && autoVideos.length) {
        const vio = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) target.play().catch(() => {});
                else target.pause();
            });
        }, { threshold: 0.15 });
        autoVideos.forEach(v => vio.observe(v));
    }

    /* ---------- Entrada no scroll ---------- */
    if (!reduceMotion && "IntersectionObserver" in window) {
        const groups = [
            ".hero > *", ".featured-media", ".featured-info", ".filters",
            ".page-head > *", ".video-stage figure", ".detail-media > *",
            ".about-title > *", ".about-grid > *", ".contact-row"
        ];
        const seen = new Set();
        groups.forEach(sel => {
            $$(sel).forEach((el, i, arr) => {
                if (seen.has(el)) return;
                seen.add(el);
                const sibIndex = arr.filter(o => o.parentNode === el.parentNode).indexOf(el);
                el.style.setProperty("--rv-d", `${Math.min(sibIndex, 6) * 0.08}s`);
                el.classList.add("rv");
            });
        });
        $$(".cards").forEach(grid => {
            $$(".card", grid).forEach((card, i) => {
                card.style.setProperty("--rv-d", `${(i % 4) * 0.08}s`);
                card.classList.add("rv");
            });
        });

        const rio = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (isIntersecting) {
                    target.classList.add("in");
                    rio.unobserve(target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

        document.documentElement.classList.add("rv-on");
        $$(".rv").forEach(el => rio.observe(el));
    }

    /* ---------- Filtro de projetos ---------- */
    const filters = $$(".filter");
    const filterCards = $$(".cards .card[data-cat]");
    if (filters.length && filterCards.length) {
        let busy = false;
        filters.forEach(btn => {
            btn.addEventListener("click", async () => {
                if (busy || btn.classList.contains("on")) return;
                busy = true;
                filters.forEach(b => {
                    b.classList.toggle("on", b === btn);
                    b.setAttribute("aria-pressed", b === btn);
                });
                const cat = btn.dataset.filter;
                const visible = filterCards.filter(c => !c.classList.contains("is-hidden"));

                if (!reduceMotion) {
                    await Promise.all(visible.map(c => c.animate(
                        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(10px)" }],
                        { duration: 220, easing: "ease-in", fill: "forwards" }
                    ).finished));
                }

                filterCards.forEach(c => {
                    c.getAnimations().forEach(a => a.cancel());
                    const show = cat === "all" || c.dataset.cat.split(" ").includes(cat);
                    c.classList.toggle("is-hidden", !show);
                    if (show) c.classList.add("in");
                });

                if (!reduceMotion) {
                    filterCards.filter(c => !c.classList.contains("is-hidden")).forEach((c, i) => {
                        c.animate(
                            [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
                            { duration: 650, delay: i * 70, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
                        );
                    });
                }
                busy = false;
            });
        });
        filters.forEach(b => b.setAttribute("aria-pressed", b.classList.contains("on")));
    }

    /* ---------- Botões magnéticos ---------- */
    if (finePointer && !reduceMotion) {
        $$(".btn, .chip, .filter").forEach(el => {
            el.classList.add("magnetic");
            el.addEventListener("mousemove", e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.25;
                const y = (e.clientY - r.top - r.height / 2) * 0.35;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
            el.addEventListener("mouseleave", () => { el.style.transform = ""; });
        });
    }

    /* ---------- Cursor personalizado ---------- */
    if (finePointer && !reduceMotion) {
        const root = document.documentElement;
        const dot = document.createElement("div");
        const ring = document.createElement("div");
        dot.className = "cur-dot";
        ring.className = "cur-ring";
        ring.innerHTML = "<i></i><span></span>";
        const label = $("span", ring);
        document.body.append(dot, ring);
        root.classList.add("has-cursor");

        let mx = -100, my = -100, rx = -100, ry = -100;
        const loop = () => {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            dot.style.transform = `translate(${mx}px, ${my}px)`;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);

        document.addEventListener("mousemove", e => {
            mx = e.clientX; my = e.clientY;
            if (!root.classList.contains("cur-on") && !root.classList.contains("cur-off")) {
                rx = mx; ry = my;
                root.classList.add("cur-on");
            }
        });
        document.addEventListener("mouseout", e => { if (!e.relatedTarget) root.classList.remove("cur-on"); });
        document.addEventListener("mousedown", () => root.classList.add("cur-down"));
        document.addEventListener("mouseup", () => root.classList.remove("cur-down"));

        document.addEventListener("mouseover", e => {
            const t = e.target;
            const native = t.closest("video[controls], input, textarea, select, iframe");
            root.classList.toggle("cur-off", Boolean(native));
            if (native) { root.classList.remove("cur-on", "cur-link", "cur-label"); return; }
            root.classList.add("cur-on");

            if (t.closest(".collage")) { root.classList.remove("cur-link", "cur-label"); return; }

            const card = t.closest(".card a");
            if (card) {
                const lab = card.getAttribute("href").includes("lab.html");
                label.textContent = lab ? (isEN() ? "try" : "testar") : (isEN() ? "view" : "ver");
                root.classList.add("cur-label");
                root.classList.remove("cur-link");
                return;
            }
            root.classList.remove("cur-label");
            root.classList.toggle("cur-link", Boolean(t.closest("a, button, summary, label, [role='button']")));
        });
    }

    /* ---------- Transição entre páginas (saída) ---------- */
    if (!reduceMotion) {
        document.addEventListener("click", e => {
            const a = e.target.closest("a[href]");
            if (!a || e.defaultPrevented || e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            if (a.target && a.target !== "_self") return;
            if (a.hasAttribute("download")) return;
            const href = a.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
            const url = new URL(a.href, location.href);
            if (url.origin !== location.origin) return;
            if (url.pathname === location.pathname) return;

            e.preventDefault();
            const curtain = $(".curtain");
            if (!url.pathname.endsWith("lab.html")) sessionStorage.setItem("pt", "1");
            curtain.className = "curtain cover";
            setTimeout(() => { location.href = url.href; }, 480);
        });
    }
});

/* =========================================================
   TRANSIÇÃO ENTRE PÁGINAS (entrada)
   Roda fora do DOMContentLoaded para cobrir a página antes de ela aparecer.
   ========================================================= */
(() => {
    const curtain = document.createElement("div");
    curtain.className = "curtain";
    curtain.setAttribute("aria-hidden", "true");
    document.body.appendChild(curtain);

    let arriving = false;
    try { arriving = sessionStorage.getItem("pt") === "1"; sessionStorage.removeItem("pt"); } catch (e) {}

    if (arriving && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        curtain.className = "curtain start";
        requestAnimationFrame(() => requestAnimationFrame(() => {
            curtain.className = "curtain reveal";
        }));
    }

    /* voltar pelo navegador (cache) não pode deixar a cortina fechada */
    window.addEventListener("pageshow", e => {
        if (e.persisted) curtain.className = "curtain";
    });
})();

/* =========================================================
   HOME: COLAGEM (abertura, hover com vídeo, parallax)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    const collage = document.querySelector(".collage");
    if (!collage) return;

    const tiles = Array.from(collage.querySelectorAll(".tile"));
    const desktop = window.matchMedia("(min-width: 761px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* origem do zoom: puxa para o centro da tela, para a imagem ampliada não sair da página */
    tiles.forEach(t => {
        const x = parseFloat(t.style.getPropertyValue("--x"));
        const y = parseFloat(t.style.getPropertyValue("--y"));
        t.style.setProperty("--ox", x < 30 ? "0%" : x > 70 ? "100%" : "50%");
        t.style.setProperty("--oy", y < 36 ? "0%" : y > 66 ? "100%" : "50%");
    });

    /* quanto cada imagem cresce no hover: até ~55% da altura ou ~42% da largura da tela */
    const sizeUp = () => {
        if (!desktop.matches) return;
        tiles.forEach(t => {
            const w = t.offsetWidth, h = t.offsetHeight;
            if (!w || !h) return;
            const s = Math.max(1.5, Math.min(window.innerHeight * 0.55 / h, window.innerWidth * 0.42 / w));
            t.style.setProperty("--s", s.toFixed(3));
        });
    };
    sizeUp();
    window.addEventListener("load", sizeUp);
    window.addEventListener("resize", sizeUp);

    /* abertura: todas empilhadas no centro, depois se espalham */
    if (!reduce && desktop.matches) {
        const box = collage.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        tiles.forEach((t, i) => {
            const r = t.getBoundingClientRect();
            const dx = cx - (r.left + r.width / 2);
            const dy = cy - (r.top + r.height / 2);
            const rot = (i % 2 ? 1 : -1) * (3 + (i * 7) % 6);
            t.querySelector(".tile-px").animate([
                { transform: `translate(${dx}px, ${dy}px) scale(0.55) rotate(${rot}deg)`, opacity: 0 },
                { transform: `translate(${dx}px, ${dy}px) scale(0.55) rotate(${rot}deg)`, opacity: 1, offset: 0.25 },
                { transform: "none", opacity: 1 }
            ], { duration: 1500, delay: 150 + i * 55, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "backwards" });
        });
    } else if (!reduce) {
        tiles.forEach((t, i) => t.animate(
            [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }],
            { duration: 700, delay: i * 60, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
        ));
    }

    /* hover: carrega e toca o preview do vídeo */
    if (fine) {
        tiles.forEach(t => {
            const v = t.querySelector("video[data-src]");
            if (!v) return;
            t.addEventListener("mouseenter", () => {
                if (!v.src) v.src = v.dataset.src;
                v.play().then(() => t.classList.add("playing")).catch(() => {});
            });
            t.addEventListener("mouseleave", () => {
                t.classList.remove("playing");
                v.pause();
            });
        });
    }

    /* parallax leve com o mouse */
    if (fine && !reduce) {
        let tx = 0, ty = 0, x = 0, y = 0;
        const pxs = tiles.map(t => ({
            el: t.querySelector(".tile-px"),
            d: parseFloat(t.style.getPropertyValue("--d")) || 1
        }));
        document.addEventListener("mousemove", e => {
            tx = e.clientX / window.innerWidth - 0.5;
            ty = e.clientY / window.innerHeight - 0.5;
        });
        const loop = () => {
            x += (tx - x) * 0.06;
            y += (ty - y) * 0.06;
            if (desktop.matches) {
                pxs.forEach(({ el, d }) => {
                    el.style.transform = `translate(${(-x * 36 * d).toFixed(2)}px, ${(-y * 26 * d).toFixed(2)}px)`;
                });
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
});
