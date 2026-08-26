// Mantém todas as funções auxiliares fora do escopo global da página
(() => {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Seleciona os elementos utilizados pelo menu responsivo
  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.nav');
  const menuContainer = menuButton?.closest('.header');

  // Configura o menu apenas quando seus dois elementos estiverem disponíveis
  if (menuButton && nav) {
    const mobileMenuQuery = window.matchMedia('(max-width: 800px)');

    // Fecha o menu, restaura o texto acessível e, quando solicitado, devolve o foco
    const closeMenu = (returnFocus = false) => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');

      if (returnFocus && mobileMenuQuery.matches) {
        menuButton.focus({ preventScroll: true });
      }
    };

    // Abre ou fecha o menu e atualiza seus atributos de acessibilidade
    menuButton.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha o menu quando um link é escolhido e evita manter foco em conteúdo oculto
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu(mobileMenuQuery.matches);
      });
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', (event) => {
      const target = event.target;

      if (
        target instanceof Node
        && nav.classList.contains('open')
        && !nav.contains(target)
        && !menuButton.contains(target)
      ) {
        closeMenu(nav.contains(document.activeElement));
      }
    });

    // Permite fechar o menu pelo teclado
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        event.preventDefault();
        closeMenu(true);
      }
    });

    // Remove o estado móvel aberto quando a página volta ao layout de desktop
    const handleViewportChange = (event) => {
      if (!event.matches) {
        closeMenu();
      }
    };

    if (typeof mobileMenuQuery.addEventListener === 'function') {
      mobileMenuQuery.addEventListener('change', handleViewportChange);
    } else if (typeof mobileMenuQuery.addListener === 'function') {
      // Mantém compatibilidade com versões antigas do Safari
      mobileMenuQuery.addListener(handleViewportChange);
    }

    // O CSS só esconde a navegação depois que todos os controles estão prontos
    menuContainer?.classList.add('menu-enhanced');
  }

  // Revela os elementos quando eles entram na área visível da página
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const revealAll = () => {
      document.documentElement.classList.remove('reveal-enhanced');
      revealElements.forEach((element) => element.classList.add('visible'));
    };
    const observerAvailable =
      typeof window.IntersectionObserver === 'function';

    if (reducedMotionQuery.matches || !observerAvailable) {
      // Mantém tudo visível quando animação ou observação não são apropriadas
      revealAll();
    } else {
      let observer;

      try {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        }, {
          threshold: 0.08,
          rootMargin: '0px 0px -6% 0px'
        });

        // Esconde os itens somente depois que o observador foi criado
        document.documentElement.classList.add('reveal-enhanced');
        revealElements.forEach((element) => observer.observe(element));
      } catch (error) {
        // Uma falha isolada na animação não interrompe ano, menu ou lightbox
        observer?.disconnect();
        revealAll();
        console.warn('Animações de entrada desativadas:', error);
      }
    }
  }

  // Mantém o ano apresentado no rodapé sempre atualizado
  const year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Localiza os elementos utilizados para ampliar as imagens dos resultados
  const lightbox = document.getElementById('image-lightbox');

  if (lightbox) {
    const lightboxImage = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
    const lightboxClose = lightbox.querySelector('.image-lightbox-close');
    const resultImages = document.querySelectorAll('.result-photo img');
    const backgroundElements = document.querySelectorAll(
      'body > header, body > main, body > footer'
    );
    const backgroundStates = new Map();
    let lastFocusedImage = null;

    // Continua apenas quando a estrutura interna do lightbox estiver completa
    if (lightboxImage && lightboxCaption && lightboxClose) {
      const focusableSelector = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',');

      // Reutiliza a legenda visível como parte do nome acessível da imagem
      const getImageCaption = (image) => {
        const visibleCaption =
          image.closest('figure')?.querySelector('figcaption')?.textContent;
        const normalizedCaption = visibleCaption?.trim() || image.alt.trim();

        return normalizedCaption || 'Imagem ampliada';
      };

      // Impede que teclado e leitores de tela alcancem a página atrás do diálogo
      const setBackgroundInactive = (inactive) => {
        backgroundElements.forEach((element) => {
          if (inactive) {
            if (!backgroundStates.has(element)) {
              backgroundStates.set(element, {
                inert: element.hasAttribute('inert'),
                ariaHidden: element.getAttribute('aria-hidden')
              });
            }

            element.setAttribute('inert', '');
            element.setAttribute('aria-hidden', 'true');
            return;
          }

          const previousState = backgroundStates.get(element);

          if (!previousState) return;

          if (!previousState.inert) {
            element.removeAttribute('inert');
          }

          if (previousState.ariaHidden === null) {
            element.removeAttribute('aria-hidden');
          } else {
            element.setAttribute('aria-hidden', previousState.ariaHidden);
          }
        });

        if (!inactive) {
          backgroundStates.clear();
        }
      };

      // Abre a imagem original e mantém sua descrição acessível
      const openLightbox = (image) => {
        if (!lightbox.hidden) return;

        const caption = getImageCaption(image);

        lastFocusedImage = image;
        image.setAttribute('aria-expanded', 'true');
        lightboxImage.src = image.currentSrc || image.src;
        lightboxImage.alt = image.alt;
        lightboxCaption.textContent = caption;
        lightbox.hidden = false;
        document.body.classList.add('lightbox-open');
        lightboxClose.focus();
        setBackgroundInactive(true);
      };

      // Fecha a visualização, restaura a página e devolve o foco à imagem escolhida
      const closeLightbox = () => {
        if (lightbox.hidden) return;

        lightbox.hidden = true;
        document.body.classList.remove('lightbox-open');
        setBackgroundInactive(false);
        lightboxImage.removeAttribute('src');
        lightboxImage.alt = '';
        lightboxCaption.textContent = '';

        if (lastFocusedImage) {
          lastFocusedImage.setAttribute('aria-expanded', 'false');

          if (lastFocusedImage.isConnected) {
            lastFocusedImage.focus({ preventScroll: true });
          }
        }

        lastFocusedImage = null;
      };

      // Ativa o zoom por clique e também pelo teclado
      resultImages.forEach((image) => {
        image.tabIndex = 0;
        image.setAttribute('role', 'button');
        image.setAttribute('aria-haspopup', 'dialog');
        image.setAttribute('aria-controls', lightbox.id);
        image.setAttribute('aria-expanded', 'false');
        image.setAttribute(
          'aria-label',
          'Ampliar imagem: ' + getImageCaption(image)
        );

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
          event.preventDefault();
          closeLightbox();
          return;
        }

        if (event.key !== 'Tab') return;

        const focusableElements = Array.from(
          lightbox.querySelectorAll(focusableSelector)
        ).filter((element) => element.getClientRects().length > 0);
        const firstFocusable = focusableElements[0];
        const lastFocusable =
          focusableElements[focusableElements.length - 1];

        if (!firstFocusable || !lastFocusable) {
          event.preventDefault();
          return;
        }

        const focusIsOutside = !lightbox.contains(document.activeElement);

        if (
          event.shiftKey
            ? focusIsOutside || document.activeElement === firstFocusable
            : focusIsOutside || document.activeElement === lastFocusable
        ) {
          event.preventDefault();
          (event.shiftKey ? lastFocusable : firstFocusable).focus();
        }
      });
    }
  }
})();
