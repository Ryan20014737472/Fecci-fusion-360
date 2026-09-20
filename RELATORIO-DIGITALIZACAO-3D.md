# Relatório completo — digitalização 3D do Fusion

Data: 20/09/2026.

## 1. Resultado implementado

A peça original é revelada de baixo para cima, acompanhada de uma faixa luminosa
e partículas laranjas. Os pontos se aproximam de posições reais da superfície
do STL: não são uma imagem sobreposta nem uma nuvem sem relação com a peça.
Depois da faixa, aparecem os materiais originais: corpo laranja e letras
`F` e `360` brancas.

A animação acontece uma vez por carregamento da página, na primeira vez em que
o visualizador entra na tela. A câmera permanece estável durante a formação.
Ao terminar, o efeito é removido e o giro automático normal é retomado.

## 2. Comportamento para o visitante

1. O STL e suas dependências são carregados com a proteção de timeout existente.
2. Quando a peça fica visível, começa a digitalização.
3. A faixa sobe; partículas convergem e dão lugar à superfície sólida.
4. Ao terminar, reaparecem a instrução de arraste e o botão de pausar rotação.

É possível concluir o efeito imediatamente:

- pelo botão **Concluir digitalização**;
- iniciando um arraste com o mouse/toque;
- usando as setas do teclado com foco no visualizador;
- pressionando Escape com foco no visualizador.

Arrastar continua funcionando no mesmo gesto. O retorno à posição inicial após
cinco segundos sem interação foi preservado. Se a aba é ocultada ou o usuário
rola para longe durante o efeito, a formação é concluída; ela não reinicia ao voltar.

## 3. Parâmetros

| Configuração | Desktop | Tela até 800 px ou ponteiro de toque |
| --- | --- | --- |
| Duração nominal | 2,6 segundos | 2,2 segundos |
| Partículas | 1.200 | 450 |
| Atualizações do scanner | Conforme requestAnimationFrame | No máximo 30 por segundo |
| Cor das partículas/faixa | `#ff6a21` | `#ff6a21` |
| Reprodução | Uma vez por carregamento | Uma vez por carregamento |

As durações são nominais: compilação de shaders e capacidade do dispositivo
podem afetar a fluidez. Não há promessa de uma taxa mínima de quadros.

## 4. Implementação técnica

O módulo `assets/js/model-scan.js` usa o Three.js que o projeto já carregava.
Não foi adicionada outra biblioteca, vídeo, textura externa ou pós-processamento.

- Amostragem de triângulos proporcional à área distribui os pontos sobre o STL.
- Uma semente fixa impede redistribuição aleatória entre frames.
- Um único objeto `Points` desenha as partículas; o shader aproxima cada uma da superfície.
- Um plano de recorte revela os materiais do modelo na altura da varredura.
- Uma faixa translúcida e um contorno retangular representam o scanner.
- O JavaScript atualiza valores globais do efeito, não um array de milhares de posições por frame.
- O scanner não usa GSAP nem modifica textos ou animações de interface.

O módulo temporariamente desativa a projeção de sombra da peça e a sombra de
apoio, evitando uma sombra da peça completa antes de sua formação. Ambos os
estados são restaurados ao concluir. A configuração permanente de sombras do
visualizador não foi alterada.

## 5. Performance e liberação de recursos

Não há giro automático concorrendo com a digitalização. Antes de entrar na
tela, o efeito aguarda sem criar suas geometrias. No celular a quantidade de
partículas cai de 1.200 para 450.

O novo módulo tem aproximadamente 7,5 KB de JavaScript antes da compressão de
transferência. Não há novas imagens ou vídeos para baixar durante a abertura.

A função `dispose()` é idempotente e:

- cancela o frame agendado da digitalização;
- remove partículas e faixa da cena;
- libera três geometrias e três materiais temporários;
- remove o plano de recorte dos materiais originais;
- restaura o estado anterior de clipping e sombras.

No teste instrumentado, após o efeito a cena voltou a duas geometrias em uso
(peça e sombra), sem o objeto de partículas, e a limpeza foi executada uma única vez.
O modelo original e seus materiais não são descartados pela digitalização.

## 6. Acessibilidade e situações especiais

- Com `prefers-reduced-motion: reduce`, a peça aparece completa sem digitalização.
- Se a preferência muda durante a animação, ela é concluída imediatamente.
- Com economia de dados sinalizada por `navigator.connection.saveData`, o módulo do scanner não é solicitado.
- Impressão dispensa/conclui o efeito e mostra a peça completa.
- O botão de concluir é nativo e reutiliza o tamanho mínimo de toque existente.
- Quando esse botão some após o clique, o foco retorna ao visualizador.
- A mensagem “Digitalizando em 3D…” usa `role="status"`, sem anunciar percentuais a cada frame.

O módulo do scanner é opcional. Se falhar ou demorar mais de 1,5 segundo para
carregar, a peça normal continua disponível. A falha do efeito não deve ser
confundida com a falha das dependências essenciais ou do STL, que mantêm seu
tratamento de erro e prazo de 30 segundos.

## 7. Arquivos

| Arquivo | Alteração |
| --- | --- |
| `assets/js/model-scan.js` | Novo módulo: partículas, faixa, recorte e limpeza |
| `model-viewer.js` | Importação opcional, início, interrupções e integração com os controles |
| `index.html` | Status, botão de concluir e versão `model-viewer.js?v=12` |
| `README.md` | Documentação de configuração e manutenção |
| `RELATORIO-DIGITALIZACAO-3D.md` | Este relatório |

`style.css`, `script.js` e `assets/js/animations.js` não precisaram ser modificados.
As classes dos controles existentes foram reutilizadas. A identidade visual,
as fotografias, o STL, as cores finais e o conteúdo científico permanecem.

## 8. Testes executados

Chrome real em Windows, com o site servido por interceptação dos arquivos
locais e as dependências Three.js reais:

- Sintaxe de JavaScript validada com `node --check`.
- Inspeção visual de capturas durante a formação e após sua conclusão.
- Desktop: 1.200 partículas e conclusão normal.
- Mobile em viewport de 390 × 844, com toque: 450 partículas e conclusão normal.
- Peça fora da tela: permanece pendente até a primeira visualização.
- Interrupções pelo botão, arraste, setas, Escape, movimento reduzido, impressão e saída da área visível.
- Cores dos materiais restauradas: `f2672b` e `fffaf5`.
- Sem partículas residuais; clipping desligado e sombras restauradas.
- Pausa da rotação, arraste e setas do teclado após a conclusão, com mudança efetiva dos pixels do canvas.
- Preferência de movimento reduzido já ativada na abertura.
- Economia de dados ativada na abertura.
- Falha HTTP do módulo opcional e atraso superior a 1,5 segundo: modelo completo preservado.
- Sem erros JavaScript/WebGL nos cenários normais.
- Regressão dos textos em 360, 768 e 1366 px: fade sem inversão de opacidade, sem transformações nas palavras, navegação rápida e movimento reduzido preservados.

As simulações de falha produzem o erro de rede esperado, mas não impedem a
exibição do modelo normal.

Limitações: não foram testados todos os celulares físicos, GPUs, Safari ou
Firefox. Viewport e toque em Chrome não equivalem a medir FPS em um Android
de entrada. O limite de partículas e a limpeza reduzem o custo, mas dispositivos
diferentes podem renderizar com fluidez diferente.

## 9. Como editar no futuro

- Duração e número de partículas: constantes no início de `model-scan.js`.
- Cor da varredura: `#ff6a21` nos materiais e no uniforme `uColor`.
- Movimento de convergência: cálculo `drift` no vertex shader.
- Não aplique o efeito aos textos nem altere `animations.js` para controlar o STL.
- Preserve `dispose()` e chame a conclusão antes de permitir mudanças manuais na peça.
- Ao atualizar o módulo, aumente o `?v=` de sua importação no visualizador e o `?v=` do visualizador no HTML.
- Publique os arquivos juntos para evitar HTML apontando para um módulo ainda inexistente.

## 10. Referências técnicas

Consulta à documentação oficial para clipping, partículas e shaders:

- [Three.js — Material e clippingPlanes](https://threejs.org/docs/pages/Material.html)
- [Three.js — Points](https://threejs.org/docs/pages/Points.html)
- [Three.js — ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html)

Essas APIs foram utilizadas no Three.js 0.184.0 já fixado pelo projeto.
