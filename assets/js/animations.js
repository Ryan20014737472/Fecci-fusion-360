/*
 * Animações progressivas FECCI Fusion 360.
 * O conteúdo continua visível se a CDN falhar. As entradas usam somente
 * transform e opacity; nenhum elemento distante fica escondido ou promovido
 * antecipadamente a uma camada de composição.
 */
(() => {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;

  const animatedElements = new Set();
  const revealedElements = new WeakSet();
  const clearProperties = "opacity,transform,transformOrigin,willChange";
  const motionMedia = gsap.matchMedia();
  let heroStarted = false;
  let refreshFrame = 0;

  const toElements = (targets) => gsap.utils.toArray(targets).filter(Boolean);

  /* Marca os elementos para as regras de impressão e acessibilidade do CSS. */
  const markElements = (targets) => {
    const elements = toElements(targets);
    elements.forEach((element) => {
      element.classList.add("motion-item");
      animatedElements.add(element);
    });
    return elements;
  };

  /* Devolve o controle ao CSS, inclusive os hovers, depois de cada entrada. */
  const clearMotionStyles = (targets) => {
    const elements = toElements(targets);
    if (!elements.length) return;
    gsap.set(elements, { clearProps: clearProperties });
    elements.forEach((element) => element.classList.remove("is-animating"));
  };

  const isStillAhead = (element) => element.getBoundingClientRect().bottom > 0;

  try {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });

    motionMedia.add({
      isMobile: "(max-width: 800px)",
      canParallax: "(min-width: 801px) and (hover: hover) and (pointer: fine)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
      isPrinting: "print",
    }, (context) => {
      const { isMobile, canParallax, reduceMotion, isPrinting } = context.conditions;
      if (reduceMotion || isPrinting) {
        clearMotionStyles(Array.from(animatedElements));
        return;
      }

      let active = true;
      const distance = isMobile ? 12 : 26;
      const duration = isMobile ? 0.46 : 0.68;
      const triggerStart = isMobile ? "top 94%" : "top 91%";

      /*
       * Os callbacks de scroll também pertencem ao matchMedia. Assim, mudar
       * para movimento reduzido ou trocar de breakpoint interrompe os tweens.
       * will-change existe apenas durante a entrada, nunca na página inteira.
       */
      context.add("reveal", (targets, options = {}) => {
        if (!active) return;
        const elements = markElements(targets).filter((element) => (
          !revealedElements.has(element) && isStillAhead(element)
        ));
        if (!elements.length) return;

        elements.forEach((element) => {
          revealedElements.add(element);
          element.classList.add("is-animating");
        });

        gsap.fromTo(elements, {
          opacity: 0,
          y: options.y ?? distance,
          x: options.x ?? 0,
          scale: options.scale ?? 1,
          rotation: options.rotation ?? 0,
          transformOrigin: "50% 60%",
          willChange: "transform, opacity",
        }, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          duration: options.duration ?? duration,
          delay: options.delay ?? 0,
          stagger: options.stagger ?? (isMobile ? 0.04 : 0.09),
          ease: options.ease || "power3.out",
          overwrite: "auto",
          clearProps: clearProperties,
          onComplete: () => clearMotionStyles(elements),
        });
      });

      /* Observa o contêiner estável e anima somente quando ele entra na tela. */
      const animateOnce = (targets, options = {}) => {
        const elements = markElements(targets);
        const trigger = options.trigger || elements[0];
        if (!trigger || !isStillAhead(trigger)) return;
        if (elements.every((element) => revealedElements.has(element))) return;

        ScrollTrigger.create({
          trigger,
          start: triggerStart,
          once: true,
          onEnter: () => context.reveal(elements, options),
        });
      };

      /* Sequências curtas: até três cards no desktop e apenas um no celular. */
      const animateBatch = (selector, options = {}) => {
        const elements = markElements(selector).filter((element) => (
          !revealedElements.has(element) && isStillAhead(element)
        ));
        if (!elements.length) return;

        ScrollTrigger.batch(elements, {
          start: triggerStart,
          once: true,
          interval: 0.06,
          batchMax: isMobile ? 1 : (options.batchMax || 3),
          onEnter: (batch) => context.reveal(batch, options),
        });
      };

      /*
       * Capa com entradas sobrepostas. Os botões ficam prontos mais cedo.
       * Não reapresenta a capa ao redimensionar ou depois de uma CDN muito lenta.
       */
      const heroParts = markElements([
        document.querySelector(".hero-copy .eyebrow"),
        document.querySelector(".hero-copy h1"),
        document.querySelector(".hero-text"),
        document.querySelector(".hero-actions"),
      ]);
      const heroArt = document.querySelector(".hero-art");
      const initialHash = window.location.hash;
      const skipHero = heroStarted || window.scrollY > 80
        || (Boolean(initialHash) && initialHash !== "#inicio")
        || performance.now() > 1800;
      heroStarted = true;

      if (!skipHero) {
        heroParts.forEach((part, index) => context.reveal(part, {
          y: isMobile ? 14 : 30,
          delay: index * (isMobile ? 0.1 : 0.13),
          duration: isMobile ? 0.52 : 0.78,
          stagger: 0,
        }));
        if (heroArt) context.reveal(heroArt, {
          y: isMobile ? 14 : 20,
          duration: 0.85,
          delay: 0.12,
        });
      }

      /* A numeração precede o título sem recortar palavras durante a leitura. */
      document.querySelectorAll(".section-heading").forEach((heading) => {
        animateOnce(Array.from(heading.children), { trigger: heading });
      });

      [
        ".fusion-bar", ".project-intro", ".project-journey-intro",
        ".project-journey-note", ".research-intro", ".fecci-article-intro",
        ".fecci-article-summary", ".course-pilot-note", ".material-copy",
        ".material-panel-copy", ".results-overview", ".result-note",
        ".journal-card", ".journal-timeline-heading", ".team-intro",
      ].forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => animateOnce(element));
      });

      [
        ".project-path .project-card, .project-path .project-goal",
        ".project-journey-list > li", ".article-card", ".course-module",
        ".course-fact", ".results-evidence-item", ".result-card",
        ".journal-timeline > li", ".reference-row",
      ].forEach((selector) => animateBatch(selector));

      /* Figurinhas da equipe: leve rotação e uma acomodação curta ao colar. */
      const stickerAngles = new Map(
        Array.from(document.querySelectorAll(".participant-photo")).map((photo, index) => (
          [photo, [-5, 4, -3.5, 4.5][index % 4]]
        ))
      );
      animateBatch(".participant-photo", {
        scale: isMobile ? 0.96 : 0.88,
        y: isMobile ? 10 : 20,
        rotation: (_, element) => stickerAngles.get(element) * (isMobile ? 0.2 : 1),
        duration: isMobile ? 0.5 : 0.76,
        ease: isMobile ? "power3.out" : "back.out(1.15)",
      });

      /*
       * Prévias entram com um pequeno zoom. As fotos dos resultados acompanham
       * seus cards: evita duas animações sobrepostas na mesma área.
       */
      [".fecci-document-preview", ".material-preview"].forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => animateOnce(element, {
          scale: isMobile ? 1 : 0.985,
          y: isMobile ? 10 : 20,
        }));
      });

      /* Um único controle de parallax, usando transform, só para desktop. */
      if (canParallax && document.querySelector(".hero")) {
        gsap.timeline({
          scrollTrigger: {
            trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6,
          },
        })
          .to(".orbit-one", { x: 10, y: -22, ease: "none", duration: 1 }, 0)
          .to(".orbit-two", { x: -8, y: 18, ease: "none", duration: 1 }, 0);
      }

      return () => {
        active = false;
        clearMotionStyles(Array.from(animatedElements));
      };
    });
  } catch (error) {
    /* Qualquer falha de inicialização devolve imediatamente o conteúdo à tela. */
    motionMedia.revert();
    clearMotionStyles(Array.from(animatedElements));
    console.warn("Animações indisponíveis; conteúdo preservado.", error);
    return;
  }

  /* Foco por teclado revela também os ancestrais que ainda estão animando. */
  document.addEventListener("focusin", (event) => {
    let element = event.target instanceof Element ? event.target : null;
    while (element) {
      if (animatedElements.has(element)) {
        revealedElements.add(element);
        gsap.killTweensOf(element);
        clearMotionStyles(element);
      }
      element = element.parentElement;
    }
  });

  /* Agrupa atualizações de layout; não recalcula posições a cada frame. */
  const refreshTriggers = () => {
    if (refreshFrame) return;
    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  };
  if (document.readyState === "complete") refreshTriggers();
  else window.addEventListener("load", refreshTriggers, { once: true });
  window.addEventListener("pageshow", refreshTriggers);
})();
