const slides = document.querySelectorAll(".slide");
let index = 0;

function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

document.querySelector(".next").addEventListener("click", () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});

document.querySelector(".prev").addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});

setInterval(() => {
  index = (index + 1) % slides.length;
  showSlide(index);
}, 3000);

const modal = document.getElementById("modal");
const imgGrande = document.getElementById("imgGrande");

document.querySelectorAll(".slide").forEach(img => {
    img.addEventListener("click", () => {
        modal.style.display = "flex";
        imgGrande.src = img.src;
    });
});

document.querySelector(".fechar").addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

    <!-- Modal Lightbox (Expandir Imagens) -->

        // Modal Lightbox para expandir as imagens
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const closeBtn = document.querySelector('.lightbox-close');

        document.querySelectorAll('.project-image-wrapper').forEach(wrapper => {
            wrapper.addEventListener('click', () => {
                const img = wrapper.querySelector('img');
                const captionText = wrapper.querySelector('.project-caption-overlay p').textContent;
                
                lightboxImg.src = img.src;
                lightboxCaption.textContent = captionText;
                
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Bloqueia o scroll de fundo
            });
        });

        // Fechar Lightbox
        closeBtn.addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Libera o scroll
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Suporte a fechamento com tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        document.addEventListener("DOMContentLoaded", () => {
    // === LÓGICA DO CARROSSEL ===
    const slides = document.querySelectorAll(".carousel .slide");
    const prevBtn = document.querySelector(".carousel .prev");
    const nextBtn = document.querySelector(".carousel .next");
    let currentSlide = 0;

    function showSlide(index) {
        // Remove a classe active de todos os slides
        slides.forEach(slide => slide.classList.remove("active"));
        
        // Ajusta o índice se passar dos limites (carrossel infinito)
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Adiciona a classe active no slide atual
        slides[currentSlide].classList.add("active");
    }

    // Eventos dos botões de avançar e voltar
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));


    // === LÓGICA DO MODAL (ABRIR IMAGEM CLICADA) ===
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("imgGrande");
    const fecharBtn = document.querySelector(".fechar");

    // Adiciona o clique em cada uma das imagens do carrossel
    slides.forEach(slide => {
        slide.addEventListener("click", () => {
            modal.style.display = "block"; // Mostra o modal
            modalImg.src = slide.src;      // Copia o caminho da imagem clicada para o modal
            modalImg.alt = slide.alt;
        });
    });

    // Fecha o modal ao clicar no 'X'
    fecharBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fecha o modal se o usuário clicar na área escura (fora da imagem)
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".carousel .slide");
    const prevBtn = document.querySelector(".carousel .prev");
    const nextBtn = document.querySelector(".carousel .next");
    
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("imgGrande");
    const fecharBtn = document.querySelector(".fechar");
    const modalPrevBtn = document.querySelector(".modal-prev");
    const modalNextBtn = document.querySelector(".modal-next");
    
    let currentSlide = 0;

    // Função centralizada para mudar os slides
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides[currentSlide].classList.add("active");

        // Se o modal estiver aberto, atualiza também a imagem gigante
        if (modal.style.display === "block") {
            modalImg.src = slides[currentSlide].src;
            modalImg.alt = slides[currentSlide].alt;
        }
    }

    // Botões do Carrossel normal da página
    nextBtn.addEventListener("click", () => showSlide(currentSlide + 1));
    prevBtn.addEventListener("click", () => showSlide(currentSlide - 1));

    // Abrir o Modal mapeando o índice correto da foto clicada
    slides.forEach((slide, index) => {
        slide.addEventListener("click", () => {
            currentSlide = index; // Armazena qual foto foi clicada
            modal.style.display = "block";
            showSlide(currentSlide);
        });
    });

    // Botões de navegação de dentro do Modal
    modalNextBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Evita fechar o modal por acidente
        showSlide(currentSlide + 1);
    });

    modalPrevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showSlide(currentSlide - 1);
    });

    // Fechar o modal
    fecharBtn.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });
});