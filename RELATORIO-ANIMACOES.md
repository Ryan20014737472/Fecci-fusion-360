# Relatório de correção das animações — 20/09/2026

## Problema e causa

O usuário relatou piscadas e palavras instáveis durante as animações.
Na versão anterior, o conteúdo começava visível e só recebia `opacity: 0`
dentro de `onEnter`, quando já havia entrado na tela. O teste no Chrome
registrou um card passando de opacidade 1 para aproximadamente 0,17 antes
de reaparecer. Isso confirma a inversão de visibilidade responsável pelo pisca.

Os mesmos efeitos aplicavam deslocamentos aos textos, e alguns hovers usavam
escalas de 1,006 ou 1,002 no card inteiro. Essas transformações podem alterar
a rasterização e a nitidez das letras. Não havia código alterando as palavras.

## Correções

- Preparar a opacidade antes do gatilho, somente em elementos totalmente fora da tela.
- Nunca esconder conteúdo que já está visível, inclusive quando a CDN demora.
- Usar `gsap.to` nas entradas: a opacidade aumenta, sem ser reiniciada em zero.
- Textos e cards recebem apenas fade; a capa permanece estável desde a primeira pintura.
- Reservar escala e rotação às fotos/ilustrações, mantendo o efeito de figurinha da equipe.
- Retirar escala e deslocamento dos hovers dos cards do minicurso, referências e equipe; manter bordas e sombras.
- Processar gatilhos atravessados por saltos rápidos de navegação.
- Preservar limpeza de estilos em redimensionamento, foco por teclado, impressão e movimento reduzido.
- Atualizar versões de cache e instruções de manutenção no README.

## Arquivos alterados

- `assets/js/animations.js`: preparação das entradas e separação entre textos e imagens.
- `style.css`: hovers sem transformação dos blocos textuais.
- `index.html`: CSS v35 e animações v6.
- `README.md`: comportamento e regras para acrescentar animações.
- `RELATORIO-ANIMACOES.md`: este relatório.

O modelo 3D, imagens, cores, estrutura e conteúdo científico não foram substituídos.
Nenhuma biblioteca adicional foi instalada no site.

## Verificação

Teste automatizado com Chrome real e GSAP/ScrollTrigger, nas larguras de
360, 768 e 1366 pixels:

- Fade sem queda de opacidade durante a entrada do card observado.
- Textos sem transformações durante essa entrada.
- Hovers dos três tipos de card sem escala ou deslocamento.
- Saltos para o fim da página e retorno sem manter os cards testados invisíveis.
- Redimensionamento sem repetir a entrada de conteúdo já visto.
- Movimento reduzido restaura a visibilidade dos elementos.
- Conteúdo e menu disponíveis quando a CDN do GSAP falha.
- Sem overflow horizontal ou exceções JavaScript nos cenários testados.

Limitação: os testes em larguras móveis foram em Chrome desktop com viewport
redimensionado, não em todos os modelos físicos de Android/iPhone. A correção
elimina o reinício de visibilidade reproduzido; diferenças específicas de GPU
ou navegador exigiriam uma captura do dispositivo caso ainda apareçam.

## Manutenção

Não aplique `fromTo({ opacity: 0 })` ao conteúdo que já entrou na tela.
Não use escala/rotação em contêineres com parágrafos. Reserve `visual: true`
a imagens e mantenha o conteúdo visível no CSS quando JavaScript não funciona.
