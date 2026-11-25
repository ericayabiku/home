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

        function close() {
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
});
