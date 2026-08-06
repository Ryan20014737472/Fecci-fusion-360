// Importa a biblioteca 3D, os controles de rotação e o carregador de arquivos STL
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

// Localiza o visualizador presente na seção inicial da página
const viewer = document.querySelector('[data-model-viewer]');

if (viewer) {
  const canvas = viewer.querySelector('.model-canvas');
  const loadingMessage = viewer.querySelector('.model-loading');

  // Mostra uma mensagem amigável caso o modelo não possa ser carregado
  const showError = () => {
    loadingMessage.hidden = false;
    loadingMessage.textContent = 'Não foi possível carregar o modelo 3D.';
    loadingMessage.classList.add('is-error');
  };

  try {
    // Cria a cena e posiciona a câmera diante do modelo
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    // Centraliza a câmera diante do 360 e mantém o F visível na face superior
    camera.position.set(0, 3.4, 6.1);

    // Configura a renderização com transparência, suavização e sombras
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Permite girar o modelo livremente com mouse ou toque
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.7;
    controls.autoRotateSpeed = 1.15;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0.05, 0);
    controls.update();

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
    // Troca as faces superior e frontal para iniciar com F em cima e 360 à frente
    const initialRotationAxis = new THREE.Vector3(0, 1, 1).normalize();
    modelRoot.quaternion.setFromAxisAngle(initialRotationAxis, Math.PI);
    scene.add(modelRoot);

    // Guarda a posição de apresentação para restaurá-la após alguns segundos sem interação
    const initialCameraPosition = camera.position.clone();
    const initialTarget = controls.target.clone();
    const initialModelQuaternion = modelRoot.quaternion.clone();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const idleDelay = 5000;
    const returnDuration = 850;
    let idleTimer;
    let returnAnimationFrame;
    let modelReady = false;

    // Cria uma sombra suave abaixo do objeto tridimensional
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.25, 64),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.42;
    shadow.receiveShadow = true;
    scene.add(shadow);

    // Renderiza a cena continuamente para permitir a rotação automática suave
    const render = () => {
      renderer.render(scene, camera);
    };

    const animate = () => {
      if (modelReady && controls.autoRotate) {
        controls.update();
      }

      render();
      window.requestAnimationFrame(animate);
    };

    // Interrompe o giro automático assim que o visitante começa a manipular a peça
    const stopAutomaticRotation = () => {
      window.clearTimeout(idleTimer);
      window.cancelAnimationFrame(returnAnimationFrame);
      controls.autoRotate = false;
      controls.enabled = true;
    };

    // Retorna suavemente ao enquadramento inicial e reinicia o giro automático
    const returnToInitialPosition = () => {
      if (!modelReady) return;

      const startingCameraPosition = camera.position.clone();
      const startingTarget = controls.target.clone();
      const startingModelQuaternion = modelRoot.quaternion.clone();
      const startedAt = performance.now();

      controls.autoRotate = false;
      controls.enabled = false;

      const updateReturn = (currentTime) => {
        const progress = Math.min((currentTime - startedAt) / returnDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(
          startingCameraPosition,
          initialCameraPosition,
          easedProgress
        );
        controls.target.lerpVectors(startingTarget, initialTarget, easedProgress);
        modelRoot.quaternion.slerpQuaternions(
          startingModelQuaternion,
          initialModelQuaternion,
          easedProgress
        );
        controls.update();

        if (progress < 1) {
          returnAnimationFrame = window.requestAnimationFrame(updateReturn);
        } else {
          controls.enabled = true;
          controls.autoRotate = !prefersReducedMotion;
        }
      };

      if (prefersReducedMotion) {
        camera.position.copy(initialCameraPosition);
        controls.target.copy(initialTarget);
        modelRoot.quaternion.copy(initialModelQuaternion);
        controls.enabled = true;
        controls.update();
        return;
      }

      returnAnimationFrame = window.requestAnimationFrame(updateReturn);
    };

    const scheduleAutomaticRotation = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(returnToInitialPosition, idleDelay);
    };

    controls.addEventListener('start', stopAutomaticRotation);
    controls.addEventListener('end', scheduleAutomaticRotation);

    // Ajusta a câmera e o canvas quando o tamanho da janela muda
    const resize = () => {
      const width = Math.max(viewer.clientWidth, 1);
      const height = Math.max(viewer.clientHeight, 1);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewer);

    // Prepara o carregamento do modelo criado no Fusion 360
    const loader = new STLLoader();

    loader.load(
      'assets/fusion.stl',
      (geometry) => {
        // Calcula normais, centro, dimensões e escala proporcional da geometria
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const largestDimension = Math.max(size.x, size.y, size.z);
        const scale = 3.25 / largestDimension;

        // Detecta os componentes conectados para separar o corpo laranja do F e do 360
        const position = geometry.getAttribute('position');
        const triangleCount = position.count / 3;
        const parents = new Int32Array(triangleCount);
        const sharedVertices = new Map();

        for (let triangle = 0; triangle < triangleCount; triangle += 1) {
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
          const firstRoot = findRoot(first);
          const secondRoot = findRoot(second);

          if (firstRoot !== secondRoot) {
            parents[secondRoot] = firstRoot;
          }
        };

        for (let vertex = 0; vertex < position.count; vertex += 1) {
          const triangle = Math.floor(vertex / 3);
          const vertexKey = [
            position.getX(vertex).toFixed(4),
            position.getY(vertex).toFixed(4),
            position.getZ(vertex).toFixed(4)
          ].join('|');

          if (sharedVertices.has(vertexKey)) {
            join(triangle, sharedVertices.get(vertexKey));
          } else {
            sharedVertices.set(vertexKey, triangle);
          }
        }

        const componentBounds = new Map();

        for (let triangle = 0; triangle < triangleCount; triangle += 1) {
          const root = findRoot(triangle);

          if (!componentBounds.has(root)) {
            componentBounds.set(root, new THREE.Box3());
          }

          const bounds = componentBounds.get(root);

          for (let offset = 0; offset < 3; offset += 1) {
            const vertex = triangle * 3 + offset;
            bounds.expandByPoint(new THREE.Vector3(
              position.getX(vertex),
              position.getY(vertex),
              position.getZ(vertex)
            ));
          }
        }

        const componentMaterials = new Map();

        componentBounds.forEach((bounds, root) => {
          const dimensions = new THREE.Vector3();
          bounds.getSize(dimensions);

          const isOrangeBody =
            dimensions.x > 50 &&
            dimensions.y > 40 &&
            dimensions.z > 40;

          componentMaterials.set(root, isOrangeBody ? 0 : 1);
        });

        geometry.clearGroups();

        let groupStart = 0;
        let currentMaterial = componentMaterials.get(findRoot(0));

        for (let triangle = 1; triangle < triangleCount; triangle += 1) {
          const materialIndex = componentMaterials.get(findRoot(triangle));
          const vertexStart = triangle * 3;

          if (materialIndex !== currentMaterial) {
            geometry.addGroup(groupStart, vertexStart - groupStart, currentMaterial);
            groupStart = vertexStart;
            currentMaterial = materialIndex;
          }
        }

        geometry.addGroup(groupStart, position.count - groupStart, currentMaterial);

        // Define os materiais laranja e branco usados nas partes do modelo
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
        const mesh = new THREE.Mesh(geometry, [orangeMaterial, whiteMaterial]);
        mesh.scale.setScalar(scale);
        mesh.rotation.x = Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        modelRoot.add(mesh);

        loadingMessage.hidden = true;
        viewer.classList.add('is-loaded');
        modelReady = true;
        controls.autoRotate = !prefersReducedMotion;
        render();
      },
      undefined,
      showError
    );

    // Altera o cursor enquanto o visitante segura e arrasta o modelo
    viewer.addEventListener('pointerdown', () => {
      stopAutomaticRotation();
      viewer.classList.add('is-dragging');
    });

    window.addEventListener('pointerup', () => {
      viewer.classList.remove('is-dragging');
    });

    // Oferece rotação completa também pelas setas do teclado
    viewer.addEventListener('keydown', (event) => {
      if (!modelRoot.children.length) return;

      const rotationStep = 0.12;
      let handled = true;

      switch (event.key) {
        case 'ArrowLeft':
          modelRoot.rotation.y -= rotationStep;
          break;
        case 'ArrowRight':
          modelRoot.rotation.y += rotationStep;
          break;
        case 'ArrowUp':
          modelRoot.rotation.x -= rotationStep;
          break;
        case 'ArrowDown':
          modelRoot.rotation.x += rotationStep;
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
        stopAutomaticRotation();
        render();
        scheduleAutomaticRotation();
      }
    });

    // Executa o primeiro ajuste e inicia o ciclo de animação do visualizador
    resize();
    animate();
  } catch (error) {
    showError();
  }
}
