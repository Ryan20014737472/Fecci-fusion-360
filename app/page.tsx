const fusionLogo =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Fusion360_Logo.png";

export default function Home() {
  return (
    <main>
      <nav className="nav" aria-label="Navegação principal">
        <a className="brand" href="#inicio" aria-label="FECCI — início">
          <span className="brandMark">F</span>
          <span>Projeto FECCI</span>
        </a>
        <div className="navLinks">
          <a href="#projeto">O projeto</a>
          <a href="#processo">Processo</a>
        </div>
      </nav>

      <section className="hero" id="inicio">
        <div className="heroCopy">
          <span className="eyebrow">FECCI • projeto em desenvolvimento</span>
          <h1>Da ideia ao modelo.<br />Do modelo à realidade.</h1>
          <p>
            Um projeto criado para a FECCI que transforma conceitos em soluções
            por meio de desenho, prototipagem e modelagem 3D.
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#projeto">Conheça o projeto <span>↗</span></a>
            <span className="edition">Edição 2026</span>
          </div>
        </div>

        <div className="heroVisual" aria-label="Representação de uma peça em modelagem 3D">
          <span className="orbit orbitOne" />
          <span className="orbit orbitTwo" />
          <div className="model">
            <div className="modelTop" />
            <div className="modelFace modelFaceLeft" />
            <div className="modelFace modelFaceRight" />
            <span className="modelHole" />
          </div>
          <div className="coordinate"><i /> X&nbsp;&nbsp; Y&nbsp;&nbsp; Z</div>
        </div>
      </section>

      <section className="fusionStrip" aria-label="Tecnologia utilizada">
        <span className="stripLabel">DESENVOLVIDO COM</span>
        <img src={fusionLogo} alt="Autodesk Fusion 360" />
        <p>Modelagem 3D • Simulação • Prototipagem</p>
      </section>

      <section className="projectSection" id="projeto">
        <div className="sectionIntro">
          <span className="sectionNumber">01</span>
          <div>
            <span className="eyebrow dark">NOSSO PROJETO</span>
            <h2>Projetar é resolver.</h2>
          </div>
        </div>
        <div className="projectGrid">
          <p className="lead">
            Estamos desenvolvendo uma solução que une criatividade, engenharia
            e tecnologia para responder a um desafio real.
          </p>
          <p>
            O Fusion 360 é a base do nosso processo: nele, testamos ideias,
            refinamos medidas e visualizamos cada detalhe antes de construir o
            protótipo. Em breve, esta área receberá o problema, a solução e os
            resultados completos da equipe.
          </p>
        </div>
      </section>

      <section className="processSection" id="processo">
        <div className="processHeader">
          <span className="eyebrow">COMO ESTAMOS CONSTRUINDO</span>
          <h2>Um processo que evolui<br />a cada teste.</h2>
        </div>
        <div className="steps">
          {[['01', 'Investigar', 'Entender o desafio e as necessidades reais.'],
            ['02', 'Projetar', 'Transformar ideias em modelos precisos no Fusion.'],
            ['03', 'Testar', 'Avaliar, ajustar e preparar o protótipo final.']].map(([n, title, text]) => (
            <article className="step" key={n}>
              <span>{n}</span><h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <div><span className="brandMark small">F</span><strong>Projeto FECCI</strong></div>
        <p>Em desenvolvimento pela nossa equipe • 2026</p>
      </footer>
    </main>
  );
}
