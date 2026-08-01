import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const viewer = document.querySelector('[data-model-viewer]');

if (viewer) {
  const canvas = viewer.querySelector('.model-canvas');
  const loadingMessage = viewer.querySelector('.model-loading');

  const showError = () => {
    loadingMessage.hidden = false;
    loadingMessage.textContent = 'Não foi possível carregar o modelo 3D.';
    loadingMessage.classList.add('is-error');
  };

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.2, 2.8, 4.8);

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

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.rotateSpeed = 0.7;
    controls.minPolarAngle = Math.PI * 0.16;
    controls.maxPolarAngle = Math.PI * 0.84;
    controls.target.set(0, 0.05, 0);
    controls.update();

    scene.add(new THREE.HemisphereLight(0xfff2e7, 0x171a1c, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffa05c, 4.5);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x91b7ff, 1.15);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const modelRoot = new THREE.Group();
    modelRoot.rotation.y = -0.52;
    modelRoot.rotation.z = 0.06;
    scene.add(modelRoot);

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.25, 64),
      new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.42;
    shadow.receiveShadow = true;
    scene.add(shadow);

    const render = () => {
      renderer.render(scene, camera);
    };

    controls.addEventListener('change', render);

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

    const loader = new STLLoader();

    loader.load(
      'assets/fusion.stl',
      (geometry) => {
        geometry.computeVertexNormals();
        geometry.center();
        geometry.computeBoundingBox();

        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const largestDimension = Math.max(size.x, size.y, size.z);
        const scale = 3.25 / largestDimension;

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

        const mesh = new THREE.Mesh(geometry, [orangeMaterial, whiteMaterial]);
        mesh.scale.setScalar(scale);
        mesh.rotation.x = -Math.PI / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        modelRoot.add(mesh);

        loadingMessage.hidden = true;
        viewer.classList.add('is-loaded');
        render();
      },
      undefined,
      showError
    );

    viewer.addEventListener('pointerdown', () => {
      viewer.classList.add('is-dragging');
    });

    window.addEventListener('pointerup', () => {
      viewer.classList.remove('is-dragging');
    });

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
          modelRoot.rotation.x = Math.max(modelRoot.rotation.x - rotationStep, -1.1);
          break;
        case 'ArrowDown':
          modelRoot.rotation.x = Math.min(modelRoot.rotation.x + rotationStep, 1.1);
          break;
        default:
          handled = false;
      }

      if (handled) {
        event.preventDefault();
        render();
      }
    });

    resize();
  } catch (error) {
    showError();
  }
}
