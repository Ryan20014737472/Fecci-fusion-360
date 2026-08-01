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
