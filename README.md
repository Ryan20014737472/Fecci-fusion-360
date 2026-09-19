# Projeto FECCI — Fusion 360

Site do projeto **Desenvolvimento de competências STEAM por meio de um minicurso de prototipagem 3D utilizando o Autodesk Fusion 360**.

Este README é o manual de manutenção do site. Ele explica onde cada parte está, como alterar textos, imagens, documentos, participantes, estilos, comportamento no celular, animações e o modelo 3D. Leia a seção correspondente antes de modificar o código.

## 1. Visão geral

O site apresenta:

- o projeto e seu objetivo;
- os artigos usados na fundamentação teórica;
- o artigo produzido para a FECCI;
- o planejamento e a aplicação do minicurso;
- o material de apoio;
- os registros e resultados;
- o diário de bordo Borke;
- as referências bibliográficas;
- os participantes e o técnico do projeto;
- um modelo STL interativo criado no Fusion 360.

O projeto é um site estático. Isso significa que não utiliza banco de dados nem servidor próprio. O navegador abre o HTML, aplica o CSS e executa o JavaScript diretamente.

## 2. Tecnologias utilizadas

- **HTML5:** estrutura e conteúdo em `index.html`.
- **CSS3:** aparência e responsividade em `style.css`.
- **JavaScript:** menus, seção ativa e ampliação de imagens em `script.js`.
- **GSAP + ScrollTrigger:** entradas, sequências e parallax organizados em `assets/js/animations.js`.
- **Three.js:** renderização do modelo 3D em `model-viewer.js`.
- **GitHub Pages:** publicação do site.

Three.js, GSAP e ScrollTrigger são carregados pela internet através do `jsDelivr`. Por isso, o modelo 3D e as animações avançadas precisam de conexão quando o site é testado localmente. Se GSAP não carregar, o conteúdo continua visível e todas as funções principais permanecem disponíveis.

## 3. Estrutura dos arquivos

```text
Fecci-fusion-360/
├── index.html                 # Todo o conteúdo e a estrutura da página
├── style.css                  # Cores, tamanhos, posições e responsividade
├── script.js                  # Menu, seção ativa e visualizador de imagens
├── model-viewer.js            # Cena, câmera, luzes e controles do modelo 3D
├── README.md                  # Este manual
└── assets/
    ├── js/
    │   └── animations.js      # Animações GSAP, ScrollTrigger e parallax
    ├── fusion.stl             # Modelo 3D exibido no início
    ├── fusion-360-logo.jpg    # Logo do Autodesk Fusion 360
    ├── maker logo.png         # Logo do Clube Maker
    ├── mentoriamaker.png      # Registro da mentoria
    ├── orientação.jpeg        # Registro da orientação
    ├── previews/              # Miniaturas otimizadas dos documentos
    ├── artigos/               # Artigos e PDFs do projeto
    └── participantes/         # Fotografias da equipe
```

Os nomes dentro de `assets` precisam ser exatamente iguais aos usados no HTML. Maiúsculas, minúsculas, espaços, acentos e extensão fazem diferença quando o site está publicado.

## 4. Como o `index.html` está organizado

O `index.html` possui uma única página dividida em seções. Cada seção importante tem um `id`, usado pelo menu para navegar até ela.

| Ordem | Seção | ID no HTML | Link usado no menu |
|---|---|---|---|
| Início | Apresentação e modelo 3D | `inicio` | `#inicio` |
| 01 | Projeto | `projeto` | `#projeto` |
| 02 | Pesquisa | `fundamentacao` | `#fundamentacao` |
| 03 | Artigo da FECCI | `artigo-fecci` | `#artigo-fecci` |
| 04 | Minicurso | `minicurso` | `#minicurso` |
| 05 | Material de apoio | `material` | `#material` |
| 06 | Resultados | `resultados` | `#resultados` |
| 07 | Diário Borke | `diario` | `#diario` |
| 08 | Referências | `referencias` | `#referencias` |
| 09 | Equipe | `equipe` | `#equipe` |

### Elementos HTML mais usados

- `<section>` separa uma parte grande da página.
- `<article>` representa um cartão ou conteúdo independente.
- `<h1>`, `<h2>` e `<h3>` são títulos em níveis diferentes.
- `<p>` contém parágrafos.
- `<a>` cria um link ou botão.
- `<img>` exibe uma imagem.
- `<figure>` reúne uma imagem e sua legenda.
- `<figcaption>` é a legenda da imagem.
- `class="..."` liga o elemento ao estilo CSS e, em alguns casos, ao JavaScript.
- `id="..."` identifica uma seção e permite acessá-la com um link como `#equipe`.

Não remova classes ou IDs sem verificar onde são usados no CSS e no JavaScript.

## 5. Como alterar textos

Abra `index.html`, localize o texto atual e substitua apenas o conteúdo entre a abertura e o fechamento da tag.

Exemplo:

```html
<h3>Título atual</h3>
```

torna-se:

```html
<h3>Novo título</h3>
```

Para alterar um parágrafo:

```html
<p class="participant-description">Nova descrição do participante.</p>
```

Evite apagar os símbolos `<`, `>` ou a barra `/` das tags. Um erro de fechamento pode desorganizar todo o restante da página.

### Como alterar o título principal

O título aparece em dois lugares de `index.html`:

1. em `<title>`, que define o texto da aba do navegador;
2. em `<h1>`, que mostra o título grande na página.

Altere os dois para que permaneçam iguais.

### Como alterar a descrição exibida em buscadores

No início de `index.html`, edite o atributo `content` desta tag:

```html
<meta name="description" content="Descrição curta do projeto.">
```

## 6. Como adicionar ou alterar um item do menu

O menu fica dentro de:

```html
<nav class="nav" aria-label="Navegação principal">
```

Os seis destinos principais ficam diretamente dentro de `.nav`. Artigo FECCI, Material de apoio e Referências ficam agrupados em `.nav-more`, usado pelo botão **Mais** no desktop. No celular, esses três links aparecem junto aos demais.

Para adicionar um destino principal, insira:

```html
<a href="#novo-id" data-nav-link>Nova seção</a>
```

Para adicionar um destino complementar, coloque o mesmo link dentro de `.nav-more-menu`.

A seção de destino precisa possuir o mesmo ID:

```html
<section id="novo-id">
```

Regras importantes:

- o valor de `href` começa com `#`;
- o valor de `id` não começa com `#`;
- os dois textos precisam ser iguais;
- cada ID deve existir apenas uma vez na página;
- `data-nav-link` permite que o JavaScript destaque a seção visível;
- menus muito grandes podem ficar apertados em telas intermediárias, então teste também no celular.

## 7. Como criar uma nova seção

Use uma seção existente como modelo e mantenha a estrutura visual. Exemplo de seção clara:

```html
<!-- Explicação da nova seção -->
<section class="light-section" id="novo-id">
  <div class="section-heading reveal">
    <span class="section-number">10</span>
    <div>
      <p class="eyebrow orange">CATEGORIA</p>
      <h2>Título da nova seção.</h2>
    </div>
  </div>

  <div class="reveal">
    <p>Conteúdo da seção.</p>
  </div>
</section>
```

Para uma seção escura, retire `light-section` e use as classes de uma seção escura existente como referência.

A classe `reveal` mantém compatibilidade com a estrutura visual e garante que o conteúdo continue visível por padrão. As animações ficam em `assets/js/animations.js` e reconhecem as classes dos componentes existentes, como `.article-card`, `.course-module`, `.result-card` e `.participant-card`.

Depois de criar uma seção:

1. confira a numeração das seções seguintes;
2. adicione o link ao menu se ela for importante;
3. crie CSS específico apenas se as classes existentes não forem suficientes;
4. teste em tela grande e pequena.

## 8. Como trabalhar com imagens

### Organização recomendada

- fotos de integrantes: `assets/participantes/`;
- PDFs e artigos: `assets/artigos/`;
- imagens gerais do projeto: diretamente em `assets/` ou em uma subpasta específica.

Prefira nomes simples, sem espaço e sem acento:

```text
helton.png
orientacao-projeto.jpg
mentoria-maker.png
```

Isso evita caminhos como `%20`, que representa um espaço em uma URL.

### Inserindo uma imagem

```html
<img src="assets/nome-da-imagem.jpg" alt="Descrição objetiva da imagem" loading="lazy">
```

- `src` é o caminho do arquivo.
- `alt` descreve a imagem para acessibilidade e para situações em que ela não carrega.
- `loading="lazy"` adia o carregamento até a imagem se aproximar da tela, melhorando a velocidade.

### Inserindo uma foto com legenda nos resultados

```html
<figure class="result-photo">
  <button class="result-photo-trigger" type="button" data-lightbox-trigger aria-label="Ampliar a foto">
    <img src="assets/nova-foto.jpg" alt="Descrição do que acontece na foto" width="1600" height="900" loading="lazy" decoding="async">
  </button>
  <figcaption>Legenda curta da foto.</figcaption>
</figure>
```

O botão com `data-lightbox-trigger` ganha ampliação por clique e teclado através de `script.js`. Troque `width` e `height` pelas dimensões reais da imagem para evitar mudanças de layout durante o carregamento.

### Se uma imagem estiver cortada

Procure a regra correspondente em `style.css`. As propriedades mais importantes são:

```css
object-fit: cover;
object-position: center;
```

- `cover` preenche toda a área, mas pode cortar as bordas.
- `contain` mostra a imagem inteira, mas pode deixar espaços vazios.
- `object-position` desloca o ponto visível, por exemplo `center top` ou `50% 30%`.

Não aumente indiscriminadamente a largura da imagem. O contêiner também precisa respeitar `max-width: 100%` para não criar rolagem lateral.

### Qualidade das imagens

O navegador não consegue recuperar detalhes que não existem no arquivo original. Para manter nitidez:

- use a imagem original, evitando capturas muito comprimidas;
- não aumente uma imagem pequena além de sua resolução;
- use JPEG para fotografias e PNG para logotipos ou transparência;
- comprima arquivos muito grandes antes de publicar, mas preserve resolução suficiente;
- mantenha o recurso de ampliação para registros em que os detalhes são importantes.

## 9. Como adicionar um participante

Coloque a foto em `assets/participantes/` e copie um cartão existente dentro de `.participant-list`.

Modelo:

```html
<!-- Participante do projeto -->
<article class="participant-card participant-card-left" data-participant-number="04">
  <figure class="participant-photo">
    <img src="assets/participantes/nome.jpg" alt="Foto do participante Nome Completo" width="1200" height="1400" loading="lazy" decoding="async">
  </figure>
  <div class="participant-info">
    <span>PARTICIPANTE 04</span>
    <h3>Nome Completo</h3>
    <p class="participant-description">Descrição da função no projeto.</p>
    <ul class="participant-tags"><li>Responsabilidade real</li></ul>
  </div>
</article>
```

As classes de posição atuais organizam a equipe em formato de pirâmide:

- `.participant-card-lead`: técnico no topo;
- `.participant-card-left`: integrante à esquerda;
- `.participant-card-center`: integrante no centro;
- `.participant-card-right`: integrante à direita.

Se a quantidade de pessoas mudar, será necessário ajustar o `grid` da equipe em `style.css`. Em telas pequenas, os cartões devem virar uma única coluna; preserve as regras existentes dentro de `@media`.

### Quando a descrição ainda não estiver pronta

Use temporariamente:

```html
<p class="participant-description participant-description-empty">Descrição a adicionar.</p>
```

Quando o texto definitivo for inserido, remova `participant-description-empty`.

## 10. Como adicionar um registro de resultado

Dentro de `.result-grid`, copie um dos cartões horizontais:

```html
<!-- Novo momento registrado no projeto -->
<article class="result-card result-card-featured result-card-light reveal">
  <figure class="result-photo">
    <button class="result-photo-trigger" type="button" data-lightbox-trigger aria-label="Ampliar o registro">
      <img src="assets/registro.jpg" alt="Descrição acessível do registro" width="1600" height="900" loading="lazy" decoding="async">
    </button>
    <figcaption>Legenda visível na imagem.</figcaption>
  </figure>
  <div class="result-featured-copy">
    <span>04 / ETAPA</span>
    <h3>Título do momento</h3>
    <p>Descrição completa do que aconteceu e de sua contribuição para o projeto.</p>
  </div>
</article>
```

Use `result-card-light` para a versão clara e `result-card-accent` para a versão escura. Continue a numeração sem repetir etapas.

## 11. Como adicionar artigos e referências

### PDF na fundamentação teórica

1. envie o PDF para `assets/artigos/`;
2. copie um `.article-card` existente;
3. atualize número, título, autores, ano, resumo e caminho do botão.

Exemplo de botão:

```html
<a class="article-link" href="assets/artigos/artigo.pdf" target="_blank" rel="noopener noreferrer">
  Acessar PDF <span aria-hidden="true">↗</span>
</a>
```

### Referência bibliográfica

Na seção `#referencias`, acrescente uma `.reference-row`:

```html
<article class="reference-row">
  <span>[04]</span>
  <div>
    <h3>
      <a class="reference-title-link" href="assets/artigos/artigo.pdf" target="_blank" rel="noopener noreferrer">
        Título do artigo
      </a>
    </h3>
    <p>AUTORES. Dados da publicação. DOI:
      <a class="reference-doi" href="https://doi.org/DOI-AQUI" target="_blank" rel="noopener noreferrer">DOI-AQUI</a>.
    </p>
  </div>
</article>
```

Links externos devem usar `target="_blank"` e `rel="noopener noreferrer"`.

## 12. Como alterar ou adicionar PDFs

Os PDFs são arquivos comuns dentro de `assets`. Um link pode abrir o documento:

```html
<a href="assets/documento.pdf" target="_blank" rel="noopener noreferrer">Abrir PDF</a>
```

ou sugerir o download:

```html
<a href="assets/documento.pdf" download="nome-amigavel.pdf">Baixar PDF</a>
```

Se o arquivo tiver espaços ou acentos, o navegador pode convertê-los para códigos como `%20` e `%C3%A7`. A solução mais segura é renomear o arquivo antes de enviá-lo, usando letras minúsculas e hífens.

## 13. Diário de bordo Borke

A seção possui o ID `diario`. A logo do Clube Maker, no cabeçalho, aponta para `#diario`.

O botão atual abre uma versão externa do Borke no Canva. Para alterar o endereço, procure:

```html
<a class="journal-link" href="https://canva.link/ino42l26d4v7d6u"
```

e substitua apenas o valor de `href`.

A linha do tempo resumida fica em `.journal-timeline`. Como o diário ainda não possui datas editoriais confirmadas, os itens usam `ETAPA 01`, `ETAPA 02` e assim por diante. Acrescente uma data somente quando ela estiver registrada no Borke; não deduza datas a partir do nome das fotos.

Quando o diário estiver finalizado como PDF:

1. envie o arquivo para `assets/` ou `assets/artigos/`;
2. troque o link externo pelo caminho local do PDF;
3. mude o texto `EM PRODUÇÃO` para `DISPONÍVEL`;
4. atualize a descrição para indicar que o documento está concluído;
5. opcionalmente acrescente um segundo botão com o atributo `download`.

## 14. Como funciona o `style.css`

O CSS controla a apresentação do site. Ele está dividido por comentários que indicam a parte afetada.

### Variáveis de cor

No começo do arquivo:

```css
:root {
  --orange: #ff6a21;
  --ink: #090b0d;
  --paper: #f2f0ea;
  --muted: #9b9ea0;
  --line: rgba(255, 255, 255, 0.14);
}
```

Alterar uma variável modifica todos os lugares que usam `var(--nome)`. Essa é a maneira correta de ajustar a paleta geral.

### Unidades importantes

- `px`: tamanho fixo em pixels;
- `%`: valor relativo ao elemento pai;
- `vw`: porcentagem da largura da tela;
- `rem`: tamanho relativo à fonte principal do navegador;
- `clamp(mínimo, ideal, máximo)`: tamanho flexível com limites;
- `fr`: fração disponível em um grid.

Exemplo:

```css
font-size: clamp(50px, 6.4vw, 94px);
```

O texto cresce conforme a tela, mas nunca fica menor que 50 px nem maior que 94 px.

### Flexbox e Grid

- `display: flex` organiza elementos principalmente em uma direção.
- `display: grid` organiza linhas e colunas.
- `gap` define o espaço entre itens.
- `align-items` controla o alinhamento vertical.
- `justify-content` controla a distribuição horizontal.

Não altere `position`, `grid-template-columns` ou `overflow` sem testar tamanhos diferentes de tela, pois essas propriedades podem causar sobreposição ou rolagem horizontal.

### Classes visuais importantes

| Classe | Função |
|---|---|
| `.header` | cabeçalho e navegação |
| `.hero` | primeira seção |
| `.hero-copy` | título e texto inicial |
| `.hero-art` | área do modelo 3D |
| `.model-viewer` | tamanho do visualizador 3D |
| `.light-section` | fundo claro compartilhado |
| `.section-heading` | número, categoria e título das seções |
| `.project-journey` | visão geral do processo do projeto |
| `.article-card` | cartões dos artigos |
| `.course-track` e `.course-module` | trilha visual do minicurso |
| `.document-meta` | etiquetas de tipo, ano e páginas dos documentos |
| `.result-card` | cartões dos registros |
| `.journal-timeline` | resumo interno do diário Borke |
| `.participant-card` | cartões da equipe |
| `.reveal` | compatibilidade e conteúdo visível caso a animação não carregue |
| `.motion-item` | marca aplicada automaticamente aos elementos animados |

### Como mudar a barra de rolagem

As propriedades de Firefox ficam em `html`:

```css
scrollbar-width: thin;
scrollbar-color: var(--orange) #121416;
```

As regras `html::-webkit-scrollbar...` controlam Chrome, Edge e Safari.

## 15. Responsividade e celular

As regras que começam com `@media` são aplicadas apenas em determinadas larguras. Elas reorganizam o menu, as colunas, os cartões e o modelo 3D.

Exemplo:

```css
@media (max-width: 800px) {
  /* Regras para telas pequenas */
}
```

Ao editar a responsividade:

1. mantenha `max-width: 100%` em imagens e contêineres largos;
2. reduza grades para uma coluna quando não houver espaço;
3. evite larguras fixas maiores que a tela;
4. não use margens negativas grandes;
5. teste pelo menos em 320 px, 360 px, 768 px, 1366 × 768 e Full HD;
6. verifique se nenhum conteúdo exige rolagem para o lado.

O menu móvel depende das classes `.menu-button`, `.nav` e `.nav.open`. O submenu desktop depende de `.nav-more`, `.nav-more-button` e `.nav-more-menu`. O JavaScript adiciona e remove `open`; portanto, não renomeie essas classes isoladamente.

## 16. Como funciona o `script.js`

O arquivo possui quatro responsabilidades principais.

### Menu móvel

Ao clicar em `.menu-button`, o JavaScript alterna a classe `.open` no menu e atualiza `aria-expanded` e `aria-label` para acessibilidade.

O botão `.nav-more-button` controla o submenu **Mais** no desktop. Ele fecha ao escolher um link, clicar fora ou pressionar `Escape`.

### Cabeçalho e seção atual

Durante a rolagem, o script adiciona `.is-scrolled` ao cabeçalho e usa os links com `data-nav-link` para marcar o destino visível com `aria-current="location"`. Os links complementares também ativam discretamente o botão **Mais**.

### Ano do rodapé

Esta linha mantém o ano atualizado automaticamente:

```js
document.getElementById('year').textContent = new Date().getFullYear();
```

O rodapé precisa continuar contendo `<span id="year">`.

### Ampliação das imagens

O script encontra os botões nativos com `data-lightbox-trigger`, lê a imagem interna e abre o `.image-lightbox`.

O visitante pode fechar a imagem:

- pelo botão de fechar;
- clicando no fundo escuro;
- pressionando `Escape`.

Para que uma nova imagem de resultado receba essa função automaticamente, use o botão `.result-photo-trigger` com o atributo `data-lightbox-trigger` dentro de `.result-photo`.

## 17. Como funciona o `animations.js`

Todas as animações visuais estão concentradas em `assets/js/animations.js`. O arquivo verifica primeiro se GSAP e ScrollTrigger carregaram. Somente depois dessa verificação ele aplica estilos temporários; assim, uma falha de rede nunca deixa textos ou cards invisíveis.

### O que é animado

- a capa entra na ordem: categoria, título, texto, modelo 3D e botões;
- números e títulos das seções surgem em uma sequência curta;
- cards de pesquisa, minicurso, resultados, diário e referências entram em pequenos lotes;
- as fotos da equipe aparecem em sequência com um efeito curto de figurinha sendo colada;
- prévias de documentos e fotos importantes recebem uma revelação discreta;
- as órbitas decorativas da capa possuem parallax leve apenas no desktop com mouse;
- `clearProps` remove os estilos inline ao final, preservando os efeitos de hover definidos no CSS.

### Celular, desempenho e acessibilidade

Em telas de até 800 px, os deslocamentos e durações são menores, os cards entram individualmente e o parallax é desativado. A preferência `prefers-reduced-motion: reduce` remove as entradas, o parallax e as transições não essenciais. A impressão também força todos os elementos a permanecerem visíveis.

As animações usam apenas `opacity`, `transform` e, em poucas imagens, `clip-path`. Não há rolagem artificial, seções fixadas ou dezenas de animações iniciadas simultaneamente.

### Como animar um componente novo

Se o novo componente reutilizar uma classe existente, como `.article-card` ou `.result-card`, ele será reconhecido automaticamente. Para uma classe inédita:

1. abra `assets/js/animations.js`;
2. para um bloco único, acrescente o seletor à lista de blocos editoriais;
3. para vários cards, acrescente `[".nova-classe", 3]` à lista usada por `animateBatch`;
4. preserve o conteúdo visível no CSS e deixe o JavaScript controlar apenas o estado temporário;
5. teste com redução de movimento ativada e em uma tela de até 800 px.

Não adicione `opacity: 0` diretamente ao CSS permanente. Isso esconderia o conteúdo caso a biblioteca externa falhasse.

## 18. Como funciona o modelo 3D

O visualizador é formado por três partes:

1. `index.html` contém o `<canvas>` onde a cena aparece;
2. `style.css` define o tamanho e a aparência da área;
3. `model-viewer.js` carrega o STL e controla câmera, materiais, luzes e interação.

### Arquivo carregado

```js
loader.load('assets/fusion.stl', ...)
```

Para substituir a peça sem alterar o código, mantenha o novo arquivo com o nome `fusion.stl`. Para usar outro nome, atualize esse caminho.

### Câmera e posição inicial

```js
camera.position.set(0, 3.4, 6.1);
```

- primeiro valor: esquerda ou direita;
- segundo valor: altura;
- terceiro valor: distância e profundidade.

Pequenas mudanças já alteram bastante o enquadramento. Teste após cada ajuste.

A orientação inicial do objeto é controlada por:

```js
const initialRotationAxis = new THREE.Vector3(0, 1, 1).normalize();
modelRoot.quaternion.setFromAxisAngle(initialRotationAxis, Math.PI);
```

Alterar eixo e ângulo muda qual face aparece na frente. O ângulo usa radianos: `Math.PI` equivale a 180 graus e `Math.PI / 2` equivale a 90 graus.

### Controles de rotação

```js
controls.enablePan = false;
controls.enableZoom = false;
controls.rotateSpeed = 0.7;
controls.autoRotateSpeed = 1.15;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;
```

- `enablePan`: deslocamento lateral;
- `enableZoom`: aproximação pela roda do mouse;
- `rotateSpeed`: velocidade do arraste;
- `autoRotateSpeed`: velocidade da rotação automática;
- limites polares de `0` até `Math.PI`: giro vertical completo.

### Retorno automático

```js
const idleDelay = 5000;
const returnDuration = 850;
```

- `idleDelay` é o tempo sem interação antes de retornar, em milissegundos;
- `returnDuration` é a duração da animação de retorno.

Atualmente, após 5 segundos sem interação, a peça volta suavemente à posição inicial e retoma a rotação automática. Pessoas que ativaram a preferência de redução de movimento no sistema não recebem a rotação contínua.

### Escala do objeto

No carregamento da geometria:

```js
const scale = 3.25 / largestDimension;
```

Aumentar `3.25` deixa a peça maior; diminuir deixa menor. Se partes do modelo forem cortadas, primeiro reduza esse valor ou afaste a câmera. Aumentar apenas o contêiner no CSS pode não resolver o enquadramento.

### Cores e materiais

O código identifica componentes conectados da geometria para separar o corpo laranja das letras brancas. Se um novo STL tiver uma estrutura diferente, essa detecção pode não separar as partes como esperado.

Nesse caso, será necessário revisar em `model-viewer.js`:

- a detecção dos componentes conectados;
- a seleção dos componentes das letras;
- os materiais `MeshStandardMaterial`;
- as cores definidas em hexadecimal.

Antes de substituir o STL, exporte as letras e o corpo como sólidos separados ou componentes desconectados sempre que possível.

### Luzes e qualidade

- `HemisphereLight` fornece iluminação geral;
- `keyLight` é a luz principal alaranjada;
- `fillLight` suaviza áreas escuras;
- `renderer.setPixelRatio(...)` controla nitidez e custo de renderização;
- `antialias: true` suaviza bordas;
- sombras usam `PCFShadowMap`, com atualização automática preservada para manter o modelo visível.

Não use um `pixelRatio` muito alto, pois pode deixar o site lento em celulares.

## 19. Cache e números de versão

O HTML carrega os arquivos com sufixos como:

```html
<link rel="stylesheet" href="style.css?v=33">
<script type="module" src="model-viewer.js?v=10"></script>
<script src="script.js?v=6"></script>
<script src="assets/js/animations.js?v=4"></script>
```

O parâmetro `?v=` ajuda a impedir que o navegador continue usando uma versão antiga guardada em cache.

Após mudar um desses arquivos, aumente seu número:

- `style.css?v=33` → `style.css?v=34`;
- `model-viewer.js?v=10` → `model-viewer.js?v=11`;
- `script.js?v=6` → `script.js?v=7`;
- `animations.js?v=4` → `animations.js?v=5`.

O número não altera o nome real do arquivo.

## 20. Comentários no código

O projeto usa comentários para sinalizar a função de cada bloco.

Em HTML:

```html
<!-- Explica a parte seguinte -->
```

Em CSS:

```css
/* Explica o grupo de estilos seguinte */
```

Em JavaScript:

```js
// Explica a instrução ou o bloco seguinte
```

Ao adicionar uma nova parte, inclua um comentário curto explicando sua finalidade. Não use `<!-- -->` dentro de CSS ou JavaScript, pois essa sintaxe é exclusiva do HTML.

## 21. Acessibilidade

Preserve estes cuidados:

- toda imagem informativa precisa de `alt` descritivo;
- imagens apenas decorativas podem usar `alt=""`;
- botões precisam ter texto ou `aria-label` claro;
- mantenha foco visível para navegação por teclado;
- não retire `aria-expanded` do botão do menu;
- use títulos em ordem lógica: `h1`, depois `h2`, depois `h3`;
- mantenha contraste suficiente entre texto e fundo;
- links que abrem nova aba devem deixar clara sua função;
- não dependa apenas de cor para transmitir informação.

## 22. Como testar localmente

Evite abrir `index.html` somente com dois cliques. Módulos JavaScript e arquivos 3D podem ser bloqueados pelo protocolo `file://`.

Use um servidor local. Uma opção simples, caso Python esteja instalado, é executar na pasta do projeto:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

Checklist antes de publicar:

- todos os links do menu chegam à seção correta;
- imagens e PDFs abrem sem erro;
- o modelo STL carrega;
- o modelo gira com mouse e toque;
- após 5 segundos ele retorna e gira sozinho;
- o menu móvel abre, fecha e não cobre conteúdo importante;
- as animações não escondem conteúdo se a CDN for bloqueada;
- com redução de movimento ativada, os elementos aparecem sem deslocamento ou parallax;
- as imagens dos resultados ampliam e fecham corretamente;
- não existe rolagem horizontal;
- textos não ultrapassam cartões;
- nomes e descrições dos participantes estão corretos;
- o console do navegador não apresenta erros.

## 23. Publicação no GitHub Pages

O endereço publicado é:

```text
https://ryan20014737472.github.io/Fecci-fusion-360/
```

Fluxo normal:

1. faça as alterações no repositório;
2. confirme que os arquivos foram salvos na branch `main`;
3. aguarde o GitHub Pages processar a atualização;
4. abra o site e faça uma recarga forçada se ainda vir a versão antiga.

Recarga forçada:

- Windows/Linux: `Ctrl + F5` ou `Ctrl + Shift + R`;
- macOS: `Cmd + Shift + R`.

Se a publicação deixar de funcionar, confira no GitHub:

1. **Settings**;
2. **Pages**;
3. a fonte deve apontar para a branch e pasta usadas pelo projeto, normalmente `main` e `/ (root)`.

## 24. Problemas comuns

### A imagem não aparece

- confira o nome, a extensão e o caminho;
- verifique maiúsculas e minúsculas;
- confirme se o arquivo foi enviado para o repositório;
- evite acentos e espaços no nome;
- abra diretamente a URL do arquivo para confirmar que existe.

### O PDF retorna erro 404

- o `href` não corresponde ao caminho real;
- o arquivo pode estar em outra pasta;
- o nome pode ter sido alterado ao enviar;
- caracteres especiais podem não ter sido codificados corretamente.

### O CSS foi alterado, mas nada mudou

- aumente o número de `style.css?v=` em `index.html`;
- faça uma recarga forçada;
- verifique se a regra está sendo sobrescrita por outra regra mais abaixo;
- confirme se a chave `}` da regra foi fechada.

### O site passou a deslizar para o lado

- procure larguras fixas maiores que a tela;
- confira `width`, `min-width`, margens negativas e elementos posicionados;
- garanta `max-width: 100%` para imagens;
- revise a alteração dentro dos `@media`.

### O menu móvel não abre

- confirme que `script.js` está carregando;
- preserve `.menu-button`, `.nav` e `.open`;
- verifique erros anteriores no console, pois eles podem interromper o restante do script.

### O modelo 3D não aparece

- use um servidor local em vez de `file://`;
- confirme que `assets/fusion.stl` existe;
- verifique a conexão com `cdn.jsdelivr.net`;
- abra o console do navegador;
- confirme que o navegador oferece suporte a WebGL;
- aumente a versão `model-viewer.js?v=` após editar o código.

### O modelo está cortado

- reduza o valor de escala `3.25`;
- afaste a câmera aumentando sua distância;
- verifique a altura e largura de `.model-viewer`;
- teste também a regra móvel correspondente.

### A foto do participante fica mal enquadrada

Crie uma regra específica para aquela imagem, por exemplo:

```css
.participant-photo img[src*="helton"] {
  object-position: center 25%;
}
```

Prefira nomes de arquivo em letras minúsculas para que seletores e caminhos sejam previsíveis.

## 25. Boas práticas para futuras alterações

- faça uma mudança por vez e teste antes da próxima;
- copie componentes existentes para preservar a identidade visual;
- não apague comentários que ainda explicam corretamente o código;
- mantenha nomes de arquivos simples e descritivos;
- comprima imagens e PDFs grandes sem destruir a legibilidade;
- atualize o texto alternativo ao trocar uma imagem;
- atualize números, títulos e referências em todos os lugares relacionados;
- aumente o número de cache do arquivo alterado;
- verifique computador e celular antes de considerar a alteração pronta;
- use mensagens de commit que expliquem o que mudou.

Exemplos de mensagens de commit:

```text
Adiciona registro da aplicação do minicurso
Atualiza descrição dos participantes
Ajusta enquadramento do modelo 3D no celular
Inclui versão final do diário Borke
```

## 26. Regra de segurança antes de editar

Antes de mudar qualquer trecho, descubra a relação entre os arquivos:

- se alterar uma classe no HTML, procure a classe no CSS e no JavaScript;
- se alterar um ID, procure links que apontem para ele;
- se renomear uma imagem, atualize todos os caminhos que a utilizam;
- se mudar um arquivo JavaScript ou CSS, atualize seu número de cache;
- se substituir o STL, confirme escala, orientação, componentes e materiais.

Seguindo essas relações, o site pode evoluir sem perder o estilo, a responsividade ou as funções que já estão prontas.

