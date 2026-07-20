document.addEventListener("DOMContentLoaded", () => {
    // === SELETORES DO CARROSSEL DA PÁGINA ===
    const slides = document.querySelectorAll(".carousel .slide");
    const prevBtn = document.querySelector(".carousel .prev");
    const nextBtn = document.querySelector(".carousel .next");
    
    // === SELETORES DO MODAL (LIGHTBOX) ===
    const lightbox = document.getElementById("modal") || document.getElementById("lightbox");
    const lightboxImg = document.getElementById("imgGrande") || document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".fechar") || document.querySelector(".lightbox-close");
    const modalPrevBtn = document.querySelector(".modal-prev");
    const modalNextBtn = document.querySelector(".modal-next");
    
    let currentSlide = 0;

    // FUNÇÃO CENTRAL: Altera a foto ativa e atualiza o modal caso esteja aberto
    function showSlide(index) {
        if (slides.length === 0) return;

        // Remove a classe ativa de todos os slides da página
        slides.forEach(slide => slide.classList.remove("active"));
        
        // Sistema de carrossel infinito (volta ao início ou fim)
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Ativa o slide atual no fundo da página
        slides[currentSlide].classList.add("active");

        // Se o lightbox estiver aberto, atualiza a imagem interna dele imediatamente
        if (lightbox && (lightbox.classList.contains("active") || lightbox.style.display === "flex" || lightbox.style.display === "block")) {
            if (lightboxImg) {
                lightboxImg.src = slides[currentSlide].src;
                lightboxImg.alt = slides[currentSlide].alt;
            }
        }
    }

    // EVENTOS: Cliques nas setas do carrossel padrão da página
    if (nextBtn) nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
    if (prevBtn) prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));

    // EVENTOS: Abre o lightbox sincronizado ao clicar em qualquer imagem do carrossel
    slides.forEach((slide, index) => {
        slide.addEventListener("click", () => {
            currentSlide = index; // Armazena a posição correta da foto clicada
            
            if (lightbox) {
                // Adaptação para abrir usando classe utilitária do CSS ou display flex
                if (lightbox.classList.contains("lightbox")) {
                    lightbox.classList.add("active");
                } else {
                    lightbox.style.display = "flex";
                }
                document.body.style.overflow = "hidden"; // Bloqueia o scroll da página de fundo
                showSlide(currentSlide);
            }
        });
    });

    // EVENTOS: Cliques nas setas de navegação internas do Modal
    if (modalNextBtn) {
        modalNextBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Evita que o modal feche por um clique fantasma de fundo
            showSlide(currentSlide + 1);
        });
    }

    if (modalPrevBtn) {
        modalPrevBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showSlide(currentSlide - 1);
        });
    }

    // FUNÇÃO INTERNA: Fecha o lightbox de forma limpa
    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove("active");
            lightbox.style.display = "none";
        }
        document.body.style.overflow = ""; // Restaura a rolagem da página
    }

    // EVENTOS: Formas de fechar o Modal (botão X, área externa ou tecla ESC)
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const langToggleBtn = document.getElementById("lang-toggle");
    
    // Verifica se o usuário já tinha uma preferência salva, senão assume Português ('pt')
    let currentLang = localStorage.getItem("preferredLanguage") || "pt";

    // Função que aplica o idioma na interface
    function applyLanguage(lang) {
        // Altera o atributo oficial de idioma do HTML para SEO
        document.documentElement.lang = lang === "pt" ? "pt-br" : "en";

        // Busca todos os elementos da página que possuem tradução configurada
        const translatableElements = document.querySelectorAll("[data-pt][data-en]");
        
        translatableElements.forEach(el => {
            // Altera o conteúdo baseado no idioma selecionado
            el.innerHTML = el.getAttribute(`data-${lang}`);
        });

        // Atualiza o texto visual do botão indicador
        if (langToggleBtn) {
            langToggleBtn.textContent = lang === "pt" ? "EN" : "PT";
        }

        // Salva a escolha do usuário na memória local do navegador
        localStorage.setItem("preferredLanguage", lang);
        currentLang = lang;
    }

    // Executa a tradução assim que a página carrega
    applyLanguage(currentLang);

    // Evento de clique para alternar o idioma
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const nextLang = currentLang === "pt" ? "en" : "pt";
            applyLanguage(nextLang);
        });
    }
});