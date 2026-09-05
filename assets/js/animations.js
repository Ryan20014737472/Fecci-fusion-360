/*
 * Animações progressivas do site FECCI Fusion 360.
 *
 * O conteúdo permanece visível por padrão. Este arquivo só assume o controle
 * quando GSAP e ScrollTrigger carregam corretamente, preservando o site caso
 * a CDN esteja indisponível ou o JavaScript seja desativado.
 */
(() => {
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (!gsap || !ScrollTrigger) {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const root = document.documentElement;
  const motionMedia = gsap.matchMedia();
  const animatedElements = new Set();
  const clearProperties = "opacity,transform,clipPath,willChange";

  root.classList.remove("reveal-enhanced");
  root.classList.add("motion-managed");

  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
  });

  /** Converte qualquer seletor ou coleção em uma lista de elementos. */
  const toElements = (targets) => gsap.utils.toArray(targets).filter(Boolean);

  /** Marca os elementos controlados para impressão e movimento reduzido. */
  const markElements = (targets) => {
    const elements = toElements(targets);

    elements.forEach((element) => {
      element.classList.add("motion-item");
      animatedElements.add(element);
    });

    return elements;
  };

  /** Remove estilos inline ao terminar para não interferir nos hovers do CSS. */
  const clearMotionStyles = (targets) => {
    const elements = toElements(targets);

    if (elements.length) {
      gsap.set(elements, { clearProps: clearProperties });
    }
  };

  /** Não esconde elementos que já ficaram acima da área visível. */
  const isStillAhead = (element) => element.getBoundingClientRect().bottom > 0;

  motionMedia.add(
    {
      isMobile: "(max-width: 800px)",
      isDesktop: "(min-width: 801px)",
      canParallax: "(min-width: 801px) and (hover: hover) and (pointer: fine)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
      isPrinting: "print",
    },
    (context) => {
      const {
        isMobile,
        canParallax,
        reduceMotion,
        isPrinting,
      } = context.conditions;

      if (reduceMotion || isPrinting) {
        clearMotionStyles(Array.from(animatedElements));
        return undefined;
      }

      const distance = isMobile ? 18 : 38;
      const duration = isMobile ? 0.58 : 0.78;
      const stagger = isMobile ? 0.07 : 0.12;
      const triggerStart = isMobile ? "top 93%" : "top 88%";
      const ease = "power2.out";

      /** Cria uma entrada única e curta para um elemento ou pequeno grupo. */
      const animateOnce = (targets, options = {}) => {
        const elements = markElements(targets);
        const trigger = options.trigger || elements[0];

        if (!elements.length || !trigger) {
          return;
        }

        if (!isStillAhead(trigger)) {
          clearMotionStyles(elements);
          return;
        }

        const fromVars = {
          opacity: 0,
          x: options.x ?? 0,
          y: options.y ?? distance,
          scale: options.scale ?? 1,
        };
        const toVars = {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: options.duration ?? duration,
          stagger: options.stagger ?? 0,
          ease: options.ease || ease,
          overwrite: "auto",
          clearProps: clearProperties,
          scrollTrigger: {
            trigger,
            start: options.start || triggerStart,
            once: true,
          },
        };

        if (options.clipPath) {
          fromVars.clipPath = options.clipPath;
          toVars.clipPath = "inset(0% 0% 0% 0%)";
        }

        gsap.set(elements, { willChange: "transform, opacity" });
        gsap.fromTo(elements, fromVars, toVars);
      };

      /** Anima cards em pequenos lotes, sem iniciar dezenas de tweens juntos. */
      const animateBatch = (selector, options = {}) => {
        const elements = markElements(selector).filter(isStillAhead);

        if (!elements.length) {
          return;
        }

        gsap.set(elements, {
          opacity: 0,
          y: options.y ?? distance,
          scale: isMobile ? 0.99 : 0.975,
          willChange: "transform, opacity",
        });

        ScrollTrigger.batch(elements, {
          start: options.start || triggerStart,
          once: true,
          batchMax: isMobile ? 1 : (options.batchMax || 3),
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: options.duration ?? duration,
              stagger: options.stagger ?? stagger,
              ease: options.ease || ease,
              overwrite: "auto",
              clearProps: "opacity,transform,willChange",
            });
          },
        });
      };

      /* Entrada cinematográfica e contida da capa. */
      const heroEyebrow = document.querySelector(".hero-copy .eyebrow");
      const heroTitle = document.querySelector(".hero-copy h1");
      const heroText = document.querySelector(".hero-text");
      const heroActions = document.querySelector(".hero-actions");
      const heroArt = document.querySelector(".hero-art");
      const heroParts = markElements([
        heroEyebrow,
        heroTitle,
        heroText,
        heroActions,
        heroArt,
      ]);
      const initialHash = window.location.hash;
      const shouldSkipHero = (
        Boolean(initialHash)
        && initialHash !== "#inicio"
      ) || window.scrollY > 80;

      if (shouldSkipHero) {
        clearMotionStyles(heroParts);
      } else if (heroParts.length) {
        const copyParts = [heroEyebrow, heroTitle, heroText, heroActions].filter(Boolean);
        const heroTimeline = gsap.timeline({ defaults: { ease } });

        gsap.set(copyParts, {
          opacity: 0,
          y: isMobile ? 20 : 46,
          willChange: "transform, opacity",
        });

        if (heroTitle) {
          gsap.set(heroTitle, {
            clipPath: "inset(0% 0% 100% 0%)",
            willChange: "transform, opacity, clip-path",
          });
        }

        if (heroArt) {
          gsap.set(heroArt, {
            opacity: 0,
            x: isMobile ? 0 : 56,
            y: isMobile ? 24 : 0,
            scale: isMobile ? 0.975 : 0.95,
            willChange: "transform, opacity",
          });
        }

        if (heroEyebrow) {
          heroTimeline.to(heroEyebrow, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            clearProps: clearProperties,
          });
        }

        if (heroTitle) {
          heroTimeline.to(heroTitle, {
            opacity: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: isMobile ? 0.76 : 1,
            clearProps: clearProperties,
          }, "-=0.18");
        }

        if (heroText) {
          heroTimeline.to(heroText, {
            opacity: 1,
            y: 0,
            duration: 0.62,
            clearProps: clearProperties,
          }, "-=0.3");
        }

        if (heroArt) {
          heroTimeline.to(heroArt, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: isMobile ? 0.78 : 1.06,
            clearProps: clearProperties,
          }, 0.18);
        }

        if (heroActions) {
          heroTimeline.to(heroActions, {
            opacity: 1,
            y: 0,
            duration: 0.54,
            clearProps: clearProperties,
          }, ">-0.06");
        }
      }

      /* Cabeçalhos numerados entram em duas etapas para reforçar a hierarquia. */
      document.querySelectorAll(".section-heading").forEach((heading) => {
        const parts = markElements(Array.from(heading.children));

        if (!parts.length || !isStillAhead(heading)) {
          clearMotionStyles(parts);
          return;
        }

        gsap.set(parts, {
          opacity: 0,
          x: isMobile ? 0 : -12,
          y: distance,
          willChange: "transform, opacity",
        });

        gsap.to(parts, {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          stagger: isMobile ? 0.05 : 0.08,
          ease,
          clearProps: clearProperties,
          scrollTrigger: {
            trigger: heading,
            start: triggerStart,
            once: true,
          },
        });
      });

      /* Blocos editoriais que pedem somente uma entrada simples. */
      [
        ".fusion-bar",
        ".project-intro",
        ".project-journey-intro",
        ".project-journey-note",
        ".research-intro",
        ".fecci-article-intro",
        ".fecci-article-summary",
        ".course-pilot-note",
        ".material-copy",
        ".material-panel-copy",
        ".results-overview",
        ".result-note",
        ".journal-card",
        ".journal-timeline-heading",
        ".team-intro",
      ].forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => animateOnce(element));
      });

      /* Cards e etapas entram em sequência apenas dentro do próprio grupo. */
      [
        [".project-path .project-card, .project-path .project-goal", 3],
        [".project-journey-list > li", 4],
        [".article-card", 3],
        [".course-module", 3],
        [".course-fact", 4],
        [".results-evidence-item", 3],
        [".result-card", 3],
        [".journal-timeline > li", 3],
        [".reference-row", 3],
        [".participant-card", 3],
      ].forEach(([selector, batchMax]) => animateBatch(selector, { batchMax }));

      /* Revelação visual reservada às imagens editoriais mais importantes. */
      const documentPreviews = [
        ".fecci-document-preview",
        ".material-preview",
      ];

      if (isMobile) {
        documentPreviews.forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            animateOnce(element, { y: 10, duration: 0.48 });
          });
        });
      } else {
        [...documentPreviews, ".result-photo"].forEach((selector) => {
          document.querySelectorAll(selector).forEach((container) => {
            const image = container.querySelector("img");
            const elements = markElements(image ? [container, image] : [container]);

            if (!isStillAhead(container)) {
              clearMotionStyles(elements);
              return;
            }

            gsap.set(container, {
              opacity: 0,
              clipPath: "inset(0% 0% 100% 0%)",
              willChange: "opacity, clip-path",
            });

            if (image) {
              gsap.set(image, {
                scale: 1.055,
                willChange: "transform",
              });
            }

            const imageTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: container,
                start: triggerStart,
                once: true,
              },
            });

            imageTimeline.to(container, {
              opacity: 1,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.92,
              ease,
              clearProps: "opacity,clipPath,willChange",
            });

            if (image) {
              imageTimeline.to(image, {
                scale: 1,
                duration: 1.08,
                ease,
                clearProps: "transform,willChange",
              }, 0);
            }
          });
        });
      }

      /* Parallax discreto somente em elementos decorativos e ponteiro preciso. */
      if (canParallax) {
        gsap.to(".orbit-one", {
          "--orbit-shift-x": "12px",
          "--orbit-shift-y": "-30px",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.to(".orbit-two", {
          "--orbit-shift-x": "-10px",
          "--orbit-shift-y": "24px",
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.9,
          },
        });
      }

      return () => {
        clearMotionStyles(Array.from(animatedElements));
      };
    },
  );

  /* Mantém controles focáveis utilizáveis mesmo antes da animação de entrada. */
  document.addEventListener("focusin", (event) => {
    const owner = event.target.closest?.(".motion-item");

    if (!owner || Number(gsap.getProperty(owner, "opacity")) >= 0.99) {
      return;
    }

    gsap.killTweensOf(owner);
    gsap.set(owner, { opacity: 1, x: 0, y: 0, scale: 1, clipPath: "none" });
    clearMotionStyles(owner);
  });

  /* Recalcula posições uma única vez após imagens, fontes e o modelo carregarem. */
  const refreshTriggers = () => {
    window.requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  if (document.readyState === "complete") {
    refreshTriggers();
  } else {
    window.addEventListener("load", refreshTriggers, { once: true });
  }
})();
