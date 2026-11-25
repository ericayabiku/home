/* =========================================================
   CÉU DE FUNDO
   Céu galáctico: estrelas em 3 camadas + nebulosa sutil
   Fica fixo atrás do conteúdo em todas as páginas.
   ========================================================= */
(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "sky";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let W = 0, H = 0, dpr = 1;
    let layers = [];
    let mx = 0, my = 0, px = 0, py = 0;

    /* gerador pseudo-aleatório fixo: o céu fica igual em todas as páginas */
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    function build() {
        seed = 7;
        const area = W * H;
        const spec = [
            { n: area / 2600, r: [0.3, 0.8], a: [0.25, 0.6], depth: 6 },
            { n: area / 9000, r: [0.6, 1.2], a: [0.45, 0.85], depth: 14 },
            { n: area / 42000, r: [1.1, 1.8], a: [0.7, 1], depth: 26 }
        ];
        layers = spec.map(s => ({
            depth: s.depth,
            stars: Array.from({ length: Math.round(s.n) }, () => ({
                x: rnd() * W,
                y: rnd() * H,
                r: s.r[0] + rnd() * (s.r[1] - s.r[0]),
                a: s.a[0] + rnd() * (s.a[1] - s.a[0]),
                tw: rnd() < 0.35 ? 0.4 + rnd() * 1.2 : 0,
                ph: rnd() * Math.PI * 2,
                hue: rnd() < 0.18 ? (rnd() < 0.5 ? "200,215,255" : "225,205,255") : "255,255,255"
            }))
        }));
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        build();
        if (reduce) draw(0);
    }

    /* rgb = "r, g, b": o degradê vai da cor até a MESMA cor transparente (sem passar por cinza) */
    function blob(x, y, r, rgb, a, sy = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, sy);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        g.addColorStop(0, `rgba(${rgb}, ${a})`);
        g.addColorStop(0.55, `rgba(${rgb}, ${a * 0.45})`);
        g.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-r, -r, r * 2, r * 2);
        ctx.restore();
    }

    function drawNight(t) {
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#05050C");
        bg.addColorStop(1, "#0B0A18");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        /* nebulosa sutil */
        const s = t * 0.00004;
        const R = Math.max(W, H);
        blob(W * (0.22 + Math.sin(s) * 0.04), H * (0.3 + Math.cos(s * 1.3) * 0.05), R * 0.55, "118, 84, 210", 0.13);
        blob(W * (0.78 + Math.cos(s * 0.8) * 0.05), H * (0.65 + Math.sin(s * 1.1) * 0.04), R * 0.5, "64, 98, 210", 0.11);
        blob(W * (0.55 + Math.sin(s * 1.4) * 0.05), H * (0.15 + Math.cos(s) * 0.04), R * 0.35, "170, 70, 170", 0.06);

        /* estrelas */
        layers.forEach(L => {
            const ox = -px * L.depth, oy = -py * L.depth;
            L.stars.forEach(st => {
                let a = st.a;
                if (st.tw && !reduce) a *= 0.55 + 0.45 * Math.sin(t * 0.001 * st.tw + st.ph);
                const x = ((st.x + ox) % W + W) % W;
                const y = ((st.y + oy) % H + H) % H;
                ctx.fillStyle = `rgba(${st.hue},${a.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(x, y, st.r, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    function draw(t) {
        px += (mx - px) * 0.05;
        py += (my - py) * 0.05;
        drawNight(t);
    }

    let raf = 0;
    const loop = t => {
        draw(t);
        raf = requestAnimationFrame(loop);
    };

    if (fine && !reduce) {
        document.addEventListener("mousemove", e => {
            mx = e.clientX / W - 0.5;
            my = e.clientY / H - 0.5;
        });
    }

    window.addEventListener("resize", resize);
    resize();

    if (reduce) {
        /* céu parado */
        draw(0);
    } else {
        raf = requestAnimationFrame(loop);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else raf = requestAnimationFrame(loop);
        });
    }
})();
