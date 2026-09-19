// Localiza o visualizador antes de carregar as dependências 3D
const viewer = document.querySelector('[data-model-viewer]');

if (viewer) {
  const canvas = viewer.querySelector('.model-canvas');
  const loadingMessage = viewer.querySelector('.model-loading');
  const modelHint = viewer.querySelector('.model-hint');
  const modelFallback = viewer.querySelector('.model-fallback');
  const motionToggle = viewer.querySelector('.model-motion-toggle');
  let loadingFailed = false;
  let loadingDeadline = null;

  // O fallback permanece visível apenas se este arquivo não puder executar
  if (modelFallback) {
    modelFallback.hidden = true;
  }

  if (loadingMessage) {
    loadingMessage.hidden = false;
  }

  // Mostra uma mensagem amigável para qualquer falha de importação, WebGL ou STL
  const showError = (error) => {
    loadingFailed = true;
    window.clearTimeout(loadingDeadline);
    if (error) {
      console.error('Falha no visualizador 3D:', error);
    }

    viewer.classList.remove('is-loaded', 'is-dragging');
    viewer.removeAttribute('tabindex');

    if (motionToggle) {
      motionToggle.hidden = true;
    }

    if (modelHint) {
      modelHint.hidden = true;
    }

    if (loadingMessage) {
      loadingMessage.hidden = false;
      loadingMessage.textContent = 'Não foi possível carregar o modelo 3D. Recarregue a página para tentar novamente.';
      loadingMessage.classList.add('is-error');
    }
  };

  // Impede que uma estrutura incompleta provoque outro erro ao exibir a mensagem
  if (!(canvas instanceof HTMLCanvasElement) || !loadingMessage) {
    showError(new Error('Estrutura do visualizador 3D incompleta.'));
  } else {
    // Um pedido de rede pendurado não pode manter o estado de espera para sempre.
    // A rotina de falha passa a encerrar a cena assim que ela estiver disponível.
    let failLoading = showError;
    loadingDeadline = window.setTimeout(() => {
      failLoading(new Error('O carregamento do visualizador excedeu 30 segundos.'));
    }, 30000);

    // Importações dinâmicas permitem informar o erro caso a CDN não responda.
    // A inicialização começa depois da primeira pintura para não disputar
    // recursos com o conteúdo principal da página.
    const loadViewerDependencies = () => Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/loaders/STLLoader.js')
    ])
      .then(([THREE, controlsModule, loaderModule]) => {
        // Descarta imports que chegaram depois do prazo, sem reativar o canvas.
        if (loadingFailed) return;
        const { OrbitControls } = controlsModule;
        const { STLLoader } = loaderModule;

        // Cria e controla todos os recursos necessários para a cena interativa
        const initializeViewer = () => {
          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

          // Centraliza a câmera diante do 360 e mantém o F visível na face superior
          camera.position.set(0, 3.4, 6.1);

          // Configura a renderização com transparência, suavização e sombras
          const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
          });

          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
          renderer.outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.15;
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFShadowMap;
          renderer.shadowMap.autoUpdate = true;

          // Permite girar o modelo livremente com mouse ou toque
          const controls = new OrbitControls(camera, canvas);
          controls.enabled = false;
          controls.enableDamping = false;
          controls.enablePan = false;
          controls.enableZoom = false;
          controls.rotateSpeed = 0.7;
          controls.autoRotateSpeed = 1.15;
          controls.minPolarAngle = 0;
          controls.maxPolarAngle = Math.PI;
          controls.target.set(0, 0.05, 0);
          controls.update();

          // OrbitControls define touch-action inline; esta regra devolve rolagem vertical
          canvas.style.touchAction = 'pan-y pinch-zoom';

          // Adiciona iluminação ambiente e luzes direcionais para destacar o relevo
          scene.add(new THREE.HemisphereLight(0xfff2e7, 0x171a1c, 2.2));

          const keyLight = new THREE.DirectionalLight(0xffa05c, 4.5);
          keyLight.position.set(4, 6, 5);
          keyLight.castShadow = true;
          keyLight.shadow.mapSize.set(1024, 1024);
          scene.add(keyLight);

          const fillLight = new THREE.DirectionalLight(0x91b7ff, 1.15);
          fillLight.position.set(-4, 2, -3);
          scene.add(fillLight);

          // Agrupa o modelo para controlar sua orientação inicial e rotação pelo teclado
          const modelRoot = new THREE.Group();
          const initialRotationAxis = new THREE.Vector3(0, 1, 1).normalize();
          modelRoot.quaternion.setFromAxisAngle(initialRotationAxis, Math.PI);
          scene.add(modelRoot);

          // Guarda a posição de apresentação restaurada após cinco segundos sem interação
          const initialTarget = controls.target.clone();
          const presentationDirection = camera.position
            .clone()
            .sub(initialTarget)
            .normalize();
          const initialCameraPosition = camera.position.clone();
          const initialModelQuaternion = modelRoot.quaternion.clone();
          const reducedMotionQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          );
          const idleDelay = 5000;
          const returnDuration = 850;
          let prefersReducedMotion = reducedMotionQuery.matches;
          let idleTimer = null;
          let autoRotationFrame = null;
          let returnAnimationFrame = null;
          let lastAutoFrameTime = null;
          let modelRadius = 0;
          let modelReady = false;
          let viewerVisible = true;
          let viewerFailed = false;
          let rotationPausedByUser = false;

          // Cria uma sombra suave abaixo do objeto tridimensional
          const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(2.25, 64),
            new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 })
          );
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = -1.42;
          shadow.receiveShadow = true;
          scene.add(shadow);

          // Renderiza somente quando há alteração ou rotação automática visível
          const render = (updateShadow = false) => {
            if (viewerFailed) return;

            if (updateShadow) {
              renderer.shadowMap.needsUpdate = true;
            }

            renderer.render(scene, camera);
          };

          const stopAutoRotationLoop = () => {
            if (autoRotationFrame !== null) {
              window.cancelAnimationFrame(autoRotationFrame);
              autoRotationFrame = null;
            }

            lastAutoFrameTime = null;
          };

          const canAutoRotate = () =>
            modelReady
            && controls.autoRotate
            && viewerVisible
            && !document.hidden
            && !viewerFailed
            && !rotationPausedByUser;

          const animateAutomaticRotation = (currentTime) => {
            autoRotationFrame = null;

            if (!canAutoRotate()) return;

            const deltaTime =
              lastAutoFrameTime === null
                ? 0
                : Math.min((currentTime - lastAutoFrameTime) / 1000, 0.1);
            lastAutoFrameTime = currentTime;
            controls.update(deltaTime);
            render();
            autoRotationFrame = window.requestAnimationFrame(
              animateAutomaticRotation
            );
          };

          const syncAutoRotationLoop = () => {
            if (canAutoRotate()) {
              if (autoRotationFrame === null) {
                autoRotationFrame = window.requestAnimationFrame(
                  animateAutomaticRotation
                );
              }
            } else {
              stopAutoRotationLoop();
            }
          };

          const setAutomaticRotation = (active) => {
            controls.autoRotate =
              Boolean(active)
              && modelReady
              && !prefersReducedMotion
              && !viewerFailed
              && !rotationPausedByUser;
            syncAutoRotationLoop();
          };

          // Cancela somente a animação de retorno que estiver em andamento
          const cancelReturnAnimation = () => {
            if (returnAnimationFrame !== null) {
              window.cancelAnimationFrame(returnAnimationFrame);
              returnAnimationFrame = null;
            }
          };

          // Interrompe o giro automático assim que o visitante manipula a peça
          const stopAutomaticRotation = () => {
            window.clearTimeout(idleTimer);
            idleTimer = null;
            cancelReturnAnimation();
            setAutomaticRotation(false);
            controls.enabled = modelReady && !viewerFailed;
          };

          // Restaura a apresentação sem animação quando o modelo está fora da tela
          const applyInitialPosition = () => {
            camera.position.copy(initialCameraPosition);
            controls.target.copy(initialTarget);
            modelRoot.quaternion.copy(initialModelQuaternion);
            controls.update();
            render(true);
          };

          // Retorna suavemente ao enquadramento inicial e reinicia o giro automático
          const returnToInitialPosition = () => {
            idleTimer = null;

            if (
              !modelReady
              || prefersReducedMotion
              || viewerFailed
              || rotationPausedByUser
            ) return;

            cancelReturnAnimation();
            setAutomaticRotation(false);

            if (!viewerVisible || document.hidden) {
              applyInitialPosition();
              controls.enabled = true;
              setAutomaticRotation(true);
              return;
            }

            const startingCameraPosition = camera.position.clone();
            const startingTarget = controls.target.clone();
            const startingModelQuaternion = modelRoot.quaternion.clone();
            const startingOffset = startingCameraPosition
              .clone()
              .sub(startingTarget);
            const initialOffset = initialCameraPosition
              .clone()
              .sub(initialTarget);
            // Evita direção nula caso a câmera coincida com o alvo
            if (startingOffset.lengthSq() < 0.000001) {
              startingOffset.copy(initialOffset);
            }

            const startingRadius = Math.max(startingOffset.length(), 0.001);
            const initialRadius = Math.max(initialOffset.length(), 0.001);
            const startingDirection = startingOffset
              .divideScalar(startingRadius);
            const initialDirection = initialOffset
              .divideScalar(initialRadius);
            const directionRotation = new THREE.Quaternion()
              .setFromUnitVectors(startingDirection, initialDirection);
            const identityRotation = new THREE.Quaternion();
            const interpolatedRotation = new THREE.Quaternion();
            const interpolatedDirection = new THREE.Vector3();
            const startedAt = performance.now();

            // Os controles permanecem ativos para o primeiro gesto cancelar o retorno
            const updateReturn = (currentTime) => {
              if (!viewerVisible || document.hidden) {
                returnAnimationFrame = null;
                applyInitialPosition();
                setAutomaticRotation(true);
                return;
              }

              const progress = Math.min(
                (currentTime - startedAt) / returnDuration,
                1
              );
              const easedProgress = 1 - Math.pow(1 - progress, 3);

              controls.target.lerpVectors(
                startingTarget,
                initialTarget,
                easedProgress
              );
              interpolatedRotation.slerpQuaternions(
                identityRotation,
                directionRotation,
                easedProgress
              );
              interpolatedDirection
                .copy(startingDirection)
                .applyQuaternion(interpolatedRotation)
                .normalize();
              camera.position
                .copy(controls.target)
                .addScaledVector(
                  interpolatedDirection,
                  THREE.MathUtils.lerp(
                    startingRadius,
                    initialRadius,
                    easedProgress
                  )
                );
              modelRoot.quaternion.slerpQuaternions(
                startingModelQuaternion,
                initialModelQuaternion,
                easedProgress
              );
              controls.update();
              render(true);

              if (progress < 1) {
                returnAnimationFrame = window.requestAnimationFrame(updateReturn);
              } else {
                returnAnimationFrame = null;
                setAutomaticRotation(true);
              }
            };

            returnAnimationFrame = window.requestAnimationFrame(updateReturn);
          };

          const scheduleAutomaticRotation = () => {
            window.clearTimeout(idleTimer);
            idleTimer = null;

            if (
              !modelReady
              || prefersReducedMotion
              || viewerFailed
              || rotationPausedByUser
            ) return;

            idleTimer = window.setTimeout(
              returnToInitialPosition,
              idleDelay
            );
          };

          // Renderiza as alterações manuais sem manter um ciclo contínuo ligado
          controls.addEventListener('change', () => {
            if (!controls.autoRotate && returnAnimationFrame === null) {
              render();
            }
          });

          controls.addEventListener('start', () => {
            stopAutomaticRotation();
            viewer.classList.add('is-dragging');
          });

          controls.addEventListener('end', () => {
            viewer.classList.remove('is-dragging');
            scheduleAutomaticRotation();
          });

          // Remove o cursor de arraste caso o ponteiro seja cancelado fora da janela
          const finishPointerInteraction = () => {
            if (!viewer.classList.contains('is-dragging')) return;

            viewer.classList.remove('is-dragging');
            scheduleAutomaticRotation();
          };

          window.addEventListener('pointerup', finishPointerInteraction);
          window.addEventListener('pointercancel', finishPointerInteraction);
          window.addEventListener('blur', finishPointerInteraction);

          // Calcula a distância que mantém a esfera do STL inteira no canvas
          const fitCameraToModel = () => {
            if (modelRadius <= 0) {
              camera.updateProjectionMatrix();
              return;
            }

            const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
            const horizontalHalfFov = Math.atan(
              Math.tan(verticalHalfFov) * camera.aspect
            );
            const limitingHalfFov = Math.max(
              Math.min(verticalHalfFov, horizontalHalfFov),
              0.01
            );
            const fitDistance =
              (modelRadius * 1.08) / Math.sin(limitingHalfFov);
            const currentDirection = camera.position
              .clone()
              .sub(controls.target);

            if (currentDirection.lengthSq() < 0.000001) {
              currentDirection.copy(presentationDirection);
            } else {
              currentDirection.normalize();
            }

            camera.position
              .copy(controls.target)
              .addScaledVector(currentDirection, fitDistance);
            initialCameraPosition
              .copy(initialTarget)
              .addScaledVector(presentationDirection, fitDistance);
            camera.updateProjectionMatrix();
            controls.update();
          };

          // Ajusta câmera, resolução e canvas sempre que o contêiner muda de tamanho
          const resize = () => {
            const width = Math.max(viewer.clientWidth, 1);
            const height = Math.max(viewer.clientHeight, 1);
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

            if (renderer.getPixelRatio() !== pixelRatio) {
              renderer.setPixelRatio(pixelRatio);
            }

            camera.aspect = width / height;
            renderer.setSize(width, height, false);
            fitCameraToModel();
            render();
          };

          let resizeObserver = null;

          try {
            if (typeof window.ResizeObserver === 'function') {
              resizeObserver = new ResizeObserver(resize);
              resizeObserver.observe(viewer);
            } else {
              window.addEventListener('resize', resize);
            }
          } catch (error) {
            // Uma otimização ausente não deve impedir o carregamento do modelo
            console.warn('ResizeObserver indisponível:', error);
            resizeObserver?.disconnect();
            window.addEventListener('resize', resize);
          }

          // Suspende a renderização contínua quando o hero deixa a área visível
          let visibilityObserver = null;

          try {
            if (typeof window.IntersectionObserver === 'function') {
              visibilityObserver = new IntersectionObserver(([entry]) => {
                viewerVisible = entry?.isIntersecting ?? true;
                syncAutoRotationLoop();
              }, {
                threshold: 0,
                rootMargin: '120px 0px'
              });

              visibilityObserver.observe(viewer);
            }
          } catch (error) {
            // Sem o observador, o modelo continua funcional quando a aba está visível
            console.warn('IntersectionObserver indisponível:', error);
            visibilityObserver?.disconnect();
            viewerVisible = true;
          }

          // Pausa e retoma o giro conforme a visibilidade da aba
          document.addEventListener('visibilitychange', () => {
            syncAutoRotationLoop();
          });

          // Acompanha alterações da preferência de movimento sem recarregar a página
          const handleReducedMotionChange = (event) => {
            prefersReducedMotion = event.matches;
            window.clearTimeout(idleTimer);
            idleTimer = null;
            cancelReturnAnimation();
            controls.enabled = modelReady && !viewerFailed;

            if (prefersReducedMotion) {
              setAutomaticRotation(false);
            } else if (modelReady && !rotationPausedByUser) {
              setAutomaticRotation(true);
            }

            if (motionToggle) {
              motionToggle.disabled = prefersReducedMotion;
              motionToggle.textContent = prefersReducedMotion
                ? 'Movimento reduzido ativo'
                : rotationPausedByUser
                  ? 'Retomar rotação'
                  : 'Pausar rotação';
            }

            render();
          };

          if (typeof reducedMotionQuery.addEventListener === 'function') {
            reducedMotionQuery.addEventListener(
              'change',
              handleReducedMotionChange
            );
          } else if (typeof reducedMotionQuery.addListener === 'function') {
            reducedMotionQuery.addListener(handleReducedMotionChange);
          }

          // Permite pausar a rotação contínua sem impedir a manipulação manual
          if (motionToggle) {
            motionToggle.addEventListener('click', () => {
              if (!modelReady || viewerFailed || prefersReducedMotion) return;

              rotationPausedByUser = !rotationPausedByUser;
              motionToggle.setAttribute(
                'aria-pressed',
                String(rotationPausedByUser)
              );
              motionToggle.textContent = rotationPausedByUser
                ? 'Retomar rotação'
                : 'Pausar rotação';

              if (rotationPausedByUser) {
                stopAutomaticRotation();
              } else {
                setAutomaticRotation(true);
              }
            });
          }

          // Encerra os ciclos e apresenta o erro sem deixar o carregamento pendente
          const failViewer = (error) => {
            window.clearTimeout(idleTimer);
            idleTimer = null;
            cancelReturnAnimation();
            stopAutoRotationLoop();
            modelReady = false;
            viewerFailed = true;
            controls.autoRotate = false;
            controls.enabled = false;
            showError(error);
          };
          failLoading = failViewer;

          // Informa a perda do contexto gráfico em vez de manter um canvas congelado
          canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            failViewer(new Error('O contexto WebGL foi perdido.'));
          }, { once: true });

          // Prepara o carregamento do modelo criado no Fusion 360
          const loader = new STLLoader();

          loader.load(
            'assets/fusion.stl',
            (geometry) => {
              // Uma resposta tardia não deve desfazer um erro/timeout já informado.
              if (loadingFailed || viewerFailed) {
                geometry.dispose();
                return;
              }
              try {
                const position = geometry.getAttribute('position');

                if (
                  !position
                  || position.count < 3
                  || position.count % 3 !== 0
                ) {
                  throw new Error('O arquivo STL não contém triângulos válidos.');
                }

                // Calcula normais, centro, dimensões e escala proporcional
                geometry.computeVertexNormals();
                geometry.center();
                geometry.computeBoundingBox();
                geometry.computeBoundingSphere();

                const size = new THREE.Vector3();
                geometry.boundingBox.getSize(size);

                const largestDimension = Math.max(size.x, size.y, size.z);

                if (
                  !Number.isFinite(largestDimension)
                  || largestDimension <= 0
                ) {
                  throw new Error('O arquivo STL possui dimensões inválidas.');
                }

                const scale = 3.25 / largestDimension;
                const scaledRadius = geometry.boundingSphere?.radius * scale;

                if (!Number.isFinite(scaledRadius) || scaledRadius <= 0) {
                  throw new Error('O arquivo STL possui raio inválido.');
                }

                // Detecta componentes conectados para separar corpo, F e 360
                const triangleCount = position.count / 3;
                const coordinateScale = 600000 / largestDimension;
                const parents = new Int32Array(triangleCount);
                const ranks = new Uint8Array(triangleCount);
                const sharedVertices = new Map();

                for (
                  let triangle = 0;
                  triangle < triangleCount;
                  triangle += 1
                ) {
                  parents[triangle] = triangle;
                }

                const findRoot = (triangle) => {
                  let root = triangle;

                  while (parents[root] !== root) {
                    root = parents[root];
                  }

                  while (parents[triangle] !== triangle) {
                    const next = parents[triangle];
                    parents[triangle] = root;
                    triangle = next;
                  }

                  return root;
                };

                const join = (first, second) => {
                  let firstRoot = findRoot(first);
                  let secondRoot = findRoot(second);

                  if (firstRoot === secondRoot) return;

                  if (ranks[firstRoot] < ranks[secondRoot]) {
                    [firstRoot, secondRoot] = [secondRoot, firstRoot];
                  }

                  parents[secondRoot] = firstRoot;

                  if (ranks[firstRoot] === ranks[secondRoot]) {
                    ranks[firstRoot] += 1;
                  }
                };

                for (
                  let vertex = 0;
                  vertex < position.count;
                  vertex += 1
                ) {
                  const triangle = Math.floor(vertex / 3);
                  const vertexKey = [
                    Math.round(position.getX(vertex) * coordinateScale),
                    Math.round(position.getY(vertex) * coordinateScale),
                    Math.round(position.getZ(vertex) * coordinateScale)
                  ].join('|');

                  if (sharedVertices.has(vertexKey)) {
                    join(triangle, sharedVertices.get(vertexKey));
                  } else {
                    sharedVertices.set(vertexKey, triangle);
                  }
                }

                const componentBounds = new Map();
                const vertexPoint = new THREE.Vector3();

                for (
                  let triangle = 0;
                  triangle < triangleCount;
                  triangle += 1
                ) {
                  const root = findRoot(triangle);

                  if (!componentBounds.has(root)) {
                    componentBounds.set(root, new THREE.Box3());
                  }

                  const bounds = componentBounds.get(root);

                  for (let offset = 0; offset < 3; offset += 1) {
                    const vertex = triangle * 3 + offset;

                    vertexPoint.set(
                      position.getX(vertex),
                      position.getY(vertex),
                      position.getZ(vertex)
                    );
                    bounds.expandByPoint(vertexPoint);
                  }
                }

                const componentMaterials = new Map();

                componentBounds.forEach((bounds, root) => {
                  const dimensions = new THREE.Vector3();
                  bounds.getSize(dimensions);

                  const isOrangeBody =
                    dimensions.x >= size.x * 0.8
                    && dimensions.y >= size.y * 0.8
                    && dimensions.z >= size.z * 0.8;

                  componentMaterials.set(root, isOrangeBody ? 0 : 1);
                });

                geometry.clearGroups();

                let groupStart = 0;
                let currentMaterial = componentMaterials.get(findRoot(0));

                for (
                  let triangle = 1;
                  triangle < triangleCount;
                  triangle += 1
                ) {
                  const materialIndex = componentMaterials.get(
                    findRoot(triangle)
                  );
                  const vertexStart = triangle * 3;

                  if (materialIndex !== currentMaterial) {
                    geometry.addGroup(
                      groupStart,
                      vertexStart - groupStart,
                      currentMaterial
                    );
                    groupStart = vertexStart;
                    currentMaterial = materialIndex;
                  }
                }

                geometry.addGroup(
                  groupStart,
                  position.count - groupStart,
                  currentMaterial
                );

                // Define os materiais laranja e branco das partes do modelo
                const orangeMaterial = new THREE.MeshStandardMaterial({
                  color: 0xf2672b,
                  metalness: 0.2,
                  roughness: 0.34
                });

                const whiteMaterial = new THREE.MeshStandardMaterial({
                  color: 0xfffaf5,
                  metalness: 0.08,
                  roughness: 0.3
                });

                // Monta o modelo, corrige sua orientação e o adiciona à cena
                const mesh = new THREE.Mesh(
                  geometry,
                  [orangeMaterial, whiteMaterial]
                );
                mesh.scale.setScalar(scale);
                mesh.rotation.x = Math.PI / 2;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                modelRoot.add(mesh);
                modelRadius = scaledRadius;
                fitCameraToModel();

                window.clearTimeout(loadingDeadline);
                loadingMessage.hidden = true;
                loadingMessage.classList.remove('is-error');

                if (modelHint) {
                  modelHint.hidden = false;
                }

                viewer.classList.add('is-loaded');
                viewer.tabIndex = 0;
                modelReady = true;
                controls.enabled = true;

                if (motionToggle) {
                  motionToggle.hidden = false;
                  motionToggle.disabled = prefersReducedMotion;
                  motionToggle.setAttribute('aria-pressed', 'false');
                  motionToggle.textContent = prefersReducedMotion
                    ? 'Movimento reduzido ativo'
                    : 'Pausar rotação';
                }

                render(true);
                setAutomaticRotation(true);
              } catch (error) {
                geometry.dispose();
                failViewer(error);
              }
            },
            undefined,
            failViewer
          );

          // Oferece rotação completa também pelas setas do teclado
          const keyboardAxis = new THREE.Vector3();
          const keyboardRotation = new THREE.Quaternion();

          viewer.addEventListener('keydown', (event) => {
            if (
              event.target !== viewer
              || event.altKey
              || event.ctrlKey
              || event.metaKey
              || !modelReady
              || viewerFailed
            ) return;

            const rotationStep = 0.12;
            let rotationAngle = rotationStep;

            switch (event.key) {
              case 'ArrowLeft':
                keyboardAxis.set(0, 1, 0);
                rotationAngle *= -1;
                break;
              case 'ArrowRight':
                keyboardAxis.set(0, 1, 0);
                break;
              case 'ArrowUp':
                keyboardAxis.set(1, 0, 0);
                rotationAngle *= -1;
                break;
              case 'ArrowDown':
                keyboardAxis.set(1, 0, 0);
                break;
              default:
                return;
            }

            event.preventDefault();
            stopAutomaticRotation();
            keyboardRotation.setFromAxisAngle(
              keyboardAxis,
              rotationAngle
            );
            modelRoot.quaternion
              .premultiply(keyboardRotation)
              .normalize();
            render(true);
            scheduleAutomaticRotation();
          });

          // Executa o primeiro ajuste; a animação começa somente após o STL
          resize();
          render();
        };

        initializeViewer();
      })
      .catch(showError);

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(loadViewerDependencies, { timeout: 500 });
    } else {
      window.setTimeout(loadViewerDependencies, 0);
    }
  }
}
