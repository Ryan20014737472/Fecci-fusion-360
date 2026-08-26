// Seleciona os elementos utilizados pelo menu responsivo
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

// Configura o menu apenas quando seus dois elementos estiverem disponíveis
if (menuButton && nav) {
  // Fecha o menu, restaura o texto acessível e, quando solicitado, devolve o foco
  const closeMenu = (returnFocus = false) => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menu');

    if (returnFocus) {
      menuButton.focus();
    }
  };

  // Abre ou fecha o menu e atualiza seus atributos de acessibilidade
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fecha o menu automaticamente quando um link de navegação é escolhido
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  // Fecha o menu ao clicar fora dele
  document.addEventListener('click', (event) => {
    if (
      nav.classList.contains('open')
      && !nav.contains(event.target)
      && !menuButton.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Permite fechar o menu pelo teclado
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu(true);
    }
  });
}

// Revela os elementos quando eles entram na área visível da página
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  // Ativa a observação das seções animadas
  revealElements.forEach((element) => observer.observe(element));
} else {
  // Mantém o conteúdo visível em navegadores sem suporte ao observador
  revealElements.forEach((element) => element.classList.add('visible'));
}

// Mantém o ano apresentado no rodapé sempre atualizado
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

// Localiza os elementos utilizados para ampliar as imagens dos resultados
const lightbox = document.getElementById('image-lightbox');

if (lightbox) {
  const lightboxImage = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
  const lightboxClose = lightbox.querySelector('.image-lightbox-close');
  const resultImages = document.querySelectorAll('.result-photo img');
  let lastFocusedImage = null;

  // Continua apenas quando a estrutura interna do lightbox estiver completa
  if (lightboxImage && lightboxCaption && lightboxClose) {
    // Abre a imagem original e mantém sua descrição acessível
    const openLightbox = (image) => {
      const caption = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;

      lastFocusedImage = image;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt;
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      lightboxClose.focus();
    };

    // Fecha a visualização e devolve o foco para a imagem escolhida
    const closeLightbox = () => {
      if (lightbox.hidden) return;

      lightbox.hidden = true;
      lightboxImage.removeAttribute('src');
      lightboxImage.alt = '';
      lightboxCaption.textContent = '';
      document.body.classList.remove('lightbox-open');
      lastFocusedImage?.focus();
      lastFocusedImage = null;
    };

    // Ativa o zoom por clique e também pelo teclado
    resultImages.forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Ampliar imagem: ${image.alt}`);

      image.addEventListener('click', () => openLightbox(image));
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    // Fecha pelo botão ou por um clique no fundo escuro
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    // Mantém o foco dentro do diálogo e permite fechá-lo com Escape
    document.addEventListener('keydown', (event) => {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }
}
