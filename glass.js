/* =========================================================
   HOME: VIDRO EMBAÇADO
   Foto do jardim atrás de um vidro com neblina e gotas.
   O visitante desenha (mouse ou dedo) e o risco desembaça o vidro;
   a neblina volta devagar. Gotas maiores escorrem e deixam rastro limpo.
   ========================================================= */
(() => {
    const scene = document.querySelector(".glass");
    if (!scene) return;

    const photoURL = scene.dataset.photo;
    const fog = scene.querySelector(".glass-fog");      // neblina (baixa resolução, mais leve)
    const fx = scene.querySelector(".glass-fx");        // riscos brilhantes + gotas (resolução cheia)
    const hint = scene.querySelector(".glass-hint");
    const fctx = fog.getContext("2d");
    const xctx = fx.getContext("2d");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 760px)").matches;

    const FOG_SCALE = 0.35;        // a neblina é desenhada em 35% do tamanho e ampliada
    const REFOG = reduce ? 0.0022 : 0.0035; // quanto a neblina volta por quadro
    const FINGER = small ? 20 : 22;         // raio do "dedo" (px): ~44px de largura

    let W = 0, H = 0, dpr = 1, fw = 0, fh = 0;
    let fogBase = null;            // foto borrada + véu (pré-renderizada)
    const mask = document.createElement("canvas");   // onde o vidro está limpo
    const mctx = mask.getContext("2d");
    const dropsTex = document.createElement("canvas"); // gotinhas paradas
    const img = new Image();

    /* ---------- foto em "cover" (mesma conta do CSS background-size: cover) ---------- */
    function cover(w, h) {
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        return [(w - dw) / 2, (h - dh) / 2, dw, dh];
    }

    function buildFog() {
        fogBase = document.createElement("canvas");
        fogBase.width = fw; fogBase.height = fh;
        const g = fogBase.getContext("2d");
        g.filter = "blur(7px)";
        const [x, y, w, h] = cover(fw, fh);
        g.drawImage(img, x - 10, y - 10, w + 20, h + 20);
        g.filter = "none";
        const veil = g.createLinearGradient(0, 0, 0, fh);
        veil.addColorStop(0, "rgba(240, 245, 247, 0.72)");
        veil.addColorStop(1, "rgba(226, 236, 240, 0.58)");
        g.fillStyle = veil;
        g.fillRect(0, 0, fw, fh);
    }

    /* ---------- gotinhas paradas (desenhadas uma vez) ---------- */
    let seed = 11;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

    function drop(c, x, y, r, a = 1) {
        c.save();
        c.globalAlpha = a;
        // sombra embaixo
        c.fillStyle = "rgba(40, 62, 72, 0.22)";
        c.beginPath(); c.ellipse(x, y + r * 0.25, r, r * 0.92, 0, 0, Math.PI * 2); c.fill();
        // corpo da gota (mais claro, como uma lente)
        const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, "rgba(255, 255, 255, 0.55)");
        g.addColorStop(0.6, "rgba(235, 244, 248, 0.22)");
        g.addColorStop(1, "rgba(255, 255, 255, 0.05)");
        c.fillStyle = g;
        c.beginPath(); c.ellipse(x, y, r, r * 0.92, 0, 0, Math.PI * 2); c.fill();
        // brilho
        c.fillStyle = "rgba(255, 255, 255, 0.85)";
        c.beginPath(); c.arc(x - r * 0.35, y - r * 0.4, Math.max(0.6, r * 0.22), 0, Math.PI * 2); c.fill();
        c.restore();
    }

    function buildDrops() {
        seed = 11;
        dropsTex.width = Math.round(W * dpr);
        dropsTex.height = Math.round(H * dpr);
        const c = dropsTex.getContext("2d");
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round(W * H / (small ? 2600 : 1500));
        for (let i = 0; i < n; i++) {
            const r = rnd() < 0.85 ? 0.6 + rnd() * 1.6 : 2 + rnd() * 3.2;
            drop(c, rnd() * W, rnd() * H, r, 0.55 + rnd() * 0.45);
        }
    }

    /* ---------- gotas que escorrem ---------- */
    let runners = [];
    function makeRunner(top) {
        return {
            x: rnd() * W,
            y: top ? -20 - rnd() * H * 0.5 : rnd() * H,
            r: 3.5 + rnd() * 4,
            v: 0,
            wait: rnd() * 180
        };
    }
    function buildRunners() {
        runners = reduce ? [] : Array.from({ length: small ? 4 : 8 }, () => makeRunner(false));
    }

    /* ---------- tamanho ---------- */
    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = scene.clientWidth; H = scene.clientHeight;
        fw = Math.max(1, Math.round(W * FOG_SCALE)); fh = Math.max(1, Math.round(H * FOG_SCALE));
        fog.width = fw; fog.height = fh;
        mask.width = fw; mask.height = fh;
        fx.width = Math.round(W * dpr); fx.height = Math.round(H * dpr);
        xctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        mctx.setTransform(FOG_SCALE, 0, 0, FOG_SCALE, 0, 0);
        beads.width = fx.width; beads.height = fx.height;
        bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        tmp.width = fw; tmp.height = fh;
        if (img.complete && img.naturalWidth) buildFog();
        buildDrops();
        buildRunners();
    }

    /* gotinhas que o dedo empurra pras bordas do risco */
    const beads = document.createElement("canvas");
    const bctx = beads.getContext("2d");
    const tmp = document.createElement("canvas");   // ajuda a "derreter" as bordas da parte limpa
    const tctx = tmp.getContext("2d");

    /* ---------- o dedo ---------- */
    let last = null, drew = false;
    function stroke(x0, y0, x1, y1) {
        const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(len / 3));
        const nx = len ? -dy / len : 0, ny = len ? dx / len : 1;   // direção perpendicular ao risco
        for (let k = 0; k <= steps; k++) {
            const t = k / steps, x = x0 + dx * t, y = y0 + dy * t;
            // ponta do dedo: limpa 100%, com a borda levemente irregular
            const r = FINGER * (0.92 + 0.16 * Math.sin(x * 0.07 + y * 0.05) * Math.cos(y * 0.09));
            mctx.fillStyle = "#000";
            mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.fill();
            // o dedo leva junto as gotas paradas que estavam no caminho
            const dc = dropsTex.getContext("2d");
            dc.save(); dc.globalCompositeOperation = "destination-out";
            dc.beginPath(); dc.arc(x, y, r * 0.95, 0, Math.PI * 2); dc.fill(); dc.restore();
            bctx.save(); bctx.globalCompositeOperation = "destination-out";
            bctx.beginPath(); bctx.arc(x, y, r * 0.8, 0, Math.PI * 2); bctx.fill(); bctx.restore();
            // a água empurrada vira gotinhas nas bordas
            if (rnd() < 0.55) {
                const side = rnd() < 0.5 ? -1 : 1, off = r + 1 + rnd() * 5;
                drop(bctx, x + nx * off * side + (rnd() - 0.5) * 3, y + ny * off * side + (rnd() - 0.5) * 3, 0.7 + rnd() * 1.8, 0.9);
            }
        }
        // de vez em quando a água acumulada na borda de baixo escorre
        if (!reduce && len > 2 && rnd() < 0.02 && runners.length < (small ? 7 : 12)) {
            const lowX = x1 + nx * (ny > 0 ? FINGER : -FINGER), lowY = y1 + Math.abs(ny) * FINGER;
            runners.push({ x: lowX, y: lowY, r: 2.2 + rnd() * 1.8, v: 0, wait: 20 + rnd() * 60, fromFinger: true });
        }
        if (!drew) { drew = true; hint && hint.classList.add("gone"); }
    }

    function pos(e) {
        const r = scene.getBoundingClientRect();
        return [e.clientX - r.left, e.clientY - r.top];
    }
    scene.addEventListener("pointermove", e => {
        const p = pos(e);
        if (e.pointerType !== "mouse" && e.buttons === 0) { last = null; return; }
        if (last) {
            const d = Math.hypot(p[0] - last[0], p[1] - last[1]);
            if (d > 120) { last = p; return; }       // salto grande (mouse entrou de longe): não risca
            stroke(last[0], last[1], p[0], p[1]);
        }
        last = p;
    });
    scene.addEventListener("pointerdown", e => { last = pos(e); stroke(last[0], last[1], last[0] + 0.1, last[1] + 0.1); });
    scene.addEventListener("pointerup", e => { if (e.pointerType !== "mouse") last = null; });
    scene.addEventListener("pointerleave", () => { last = null; });

    /* ---------- quadro a quadro ---------- */
    function frame() {
        tick++;
        // a neblina volta devagar (aplicada a cada 4 quadros: passos muito pequenos o canvas ignora)
        if (tick % 4 === 0) {
            mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0);
            mctx.globalCompositeOperation = "destination-out";
            mctx.fillStyle = `rgba(0,0,0,${REFOG * 4})`;
            mctx.fillRect(0, 0, fw, fh);
            mctx.restore();
        }
        // bordas da parte limpa embaçam primeiro (um leve desfoque na máscara a cada poucos quadros)
        if (tick % 6 === 0) {
            tctx.clearRect(0, 0, fw, fh);
            tctx.filter = "blur(0.7px)";
            tctx.drawImage(mask, 0, 0);
            tctx.filter = "none";
            mctx.save(); mctx.setTransform(1, 0, 0, 1, 0, 0);
            mctx.clearRect(0, 0, fw, fh);
            mctx.drawImage(tmp, 0, 0);
            mctx.restore();
        }
        // gotinhas das bordas secam bem devagar; de vez em quando caem gotinhas novas no vidro
        if (tick % 4 === 0) {
            bctx.save(); bctx.setTransform(1, 0, 0, 1, 0, 0);
            bctx.globalCompositeOperation = "destination-out";
            bctx.fillStyle = "rgba(0,0,0,0.01)";
            bctx.fillRect(0, 0, beads.width, beads.height);
            bctx.restore();
        }
        if (!reduce && tick % 20 === 0) {
            const dc = dropsTex.getContext("2d");
            for (let q = 0; q < 3; q++) drop(dc, rnd() * W, rnd() * H, 0.6 + rnd() * 1.4, 0.7);
        }

        // gotas que escorrem: param, escorregam, param de novo, e deixam rastro limpo
        xctx.clearRect(0, 0, W, H);
        xctx.drawImage(dropsTex, 0, 0, W, H);
        runners.forEach((d, i) => {
            if (d.wait > 0) { d.wait--; }
            else {
                d.v = Math.min(d.v + 0.12, 2.2 + d.r * 0.35);
                const py = d.y;
                d.y += d.v;
                d.x += (rnd() - 0.5) * 0.6;
                mctx.strokeStyle = "#000"; mctx.lineCap = "round";
                mctx.lineWidth = d.r * 0.8;
                mctx.beginPath(); mctx.moveTo(d.x, py); mctx.lineTo(d.x, d.y); mctx.stroke();
                if (rnd() < 0.012) { d.wait = 30 + rnd() * 120; d.v = 0; }
            }
            if (d.y - d.r > H) {
                if (d.fromFinger) { runners.splice(i, 1); return; }
                runners[i] = makeRunner(true);
            }
            drop(xctx, d.x, d.y, d.r, 0.95);
        });
        xctx.drawImage(beads, 0, 0, W, H);

        // neblina = foto borrada menos as partes limpas
        if (fogBase) {
            fctx.globalCompositeOperation = "source-over";
            fctx.clearRect(0, 0, fw, fh);
            fctx.drawImage(fogBase, 0, 0);
            fctx.globalCompositeOperation = "destination-out";
            fctx.drawImage(mask, 0, 0);
            fctx.globalCompositeOperation = "source-over";
        }
    }

    let raf = 0, tick = 0;
    const loop = () => { frame(); raf = requestAnimationFrame(loop); };
    function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    /* só anima quando o vidro está na tela (economiza o computador nas outras seções) */
    let onScreen = true;
    document.addEventListener("visibilitychange", () => {
        if (document.hidden || !onScreen) cancelAnimationFrame(raf); else start();
    });
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([en]) => {
            onScreen = en.isIntersecting;
            if (onScreen && !document.hidden) start(); else cancelAnimationFrame(raf);
        }).observe(scene);
    }

    img.onload = () => { buildFog(); scene.classList.add("ready"); };
    img.src = photoURL;
    window.addEventListener("resize", resize);
    resize();
    start();
})();
