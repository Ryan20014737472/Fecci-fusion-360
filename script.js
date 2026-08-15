// Seleciona os elementos utilizados pelo menu responsivo
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

// Abre ou fecha o menu e atualiza seus atributos de acessibilidade
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

// Fecha o menu automaticamente quando um link de navegação é escolhido
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

// Revela os elementos quando eles entram na área visível da página
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Ativa a observação das seções animadas
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
// Mantém o ano apresentado no rodapé sempre atualizado
document.getElementById('year').textContent = new Date().getFullYear();

// Permite abrir as imagens dos resultados em tamanho ampliado
const lightbox = document.getElementById('image-lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
const lightboxClose = lightbox.querySelector('.image-lightbox-close');
let lastFocusedImage = null;

// Abre a imagem original e mantém sua descrição acessível
function openLightbox(image) {
  const caption = image.closest('figure')?.querySelector('figcaption')?.textContent || image.alt;
  lastFocusedImage = image;
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = caption;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

// Fecha a visualização e devolve o foco para a imagem escolhida
function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute('src');
  document.body.classList.remove('lightbox-open');
  lastFocusedImage?.focus();
}

// Ativa o zoom por clique e também pelo teclado
document.querySelectorAll('.result-photo img').forEach((image) => {
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

// Oferece três formas de fechar: botão, fundo escuro ou tecla Escape
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

