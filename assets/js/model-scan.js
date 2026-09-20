/* Digitalização temporária do STL. Não altera a geometria nem as cores finais. */
export function createModelScan({ THREE, mesh, scene, renderer, shadow, render, onComplete, compact = false }) {
  const duration = compact ? 2200 : 2600;
  const particleCount = compact ? 450 : 1200;
  mesh.updateWorldMatrix(true, false);
  const bounds = new THREE.Box3().setFromObject(mesh);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const height = Math.max(size.y, 0.001);
  const positions = mesh.geometry.getAttribute('position');
  const triangles = positions.count / 3;
  const areas = new Float64Array(triangles);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const edge = new THREE.Vector3(), cross = new THREE.Vector3();
  let totalArea = 0;

  // Distribuição proporcional à área: evita acumular pontos em vértices do STL.
  for (let i = 0; i < triangles; i++) {
    a.fromBufferAttribute(positions, i * 3);
    b.fromBufferAttribute(positions, i * 3 + 1);
    c.fromBufferAttribute(positions, i * 3 + 2);
    totalArea += cross.subVectors(c, a).cross(edge.subVectors(b, a)).length() * 0.5;
    areas[i] = totalArea;
  }
  if (!Number.isFinite(totalArea) || totalArea <= 0) throw new Error('Superfície inválida para digitalização.');

  // Semente fixa: a distribuição não pisca nem muda a cada frame.
  let seed = 360;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const targets = new Float32Array(particleCount * 3);
  const seeds = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const area = random() * totalArea;
    let low = 0, high = triangles - 1;
    while (low < high) { const middle = (low + high) >>> 1; if (areas[middle] < area) low = middle + 1; else high = middle; }
    a.fromBufferAttribute(positions, low * 3);
    b.fromBufferAttribute(positions, low * 3 + 1);
    c.fromBufferAttribute(positions, low * 3 + 2);
    const u = Math.sqrt(random()), v = random();
    a.multiplyScalar(1 - u).addScaledVector(b, u * (1 - v)).addScaledVector(c, u * v);
    a.applyMatrix4(mesh.matrixWorld).toArray(targets, i * 3);
    seeds[i] = random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(targets, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  const uniforms = {
    uSweep: { value: -0.15 }, uMinY: { value: bounds.min.y }, uHeight: { value: height },
    uPixelRatio: { value: Math.min(renderer.getPixelRatio(), 2) },
    uColor: { value: new THREE.Color('#ff6a21') },
  };
  // A GPU aproxima os pontos da superfície; o JS atualiza apenas a faixa de varredura.
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, toneMapped: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute float aSeed;
      uniform float uSweep, uMinY, uHeight, uPixelRatio;
      varying float vAlpha;
      void main() {
        float layer = (position.y - uMinY) / uHeight;
        float distanceToScan = layer - uSweep;
        float gathered = 1.0 - smoothstep(0.0, 0.28, distanceToScan);
        vec3 drift = vec3(sin(aSeed * 71.0), 0.7 + aSeed * 0.5, cos(aSeed * 53.0)) * uHeight * 0.18;
        vec3 formed = position + drift * (1.0 - gathered);
        vAlpha = smoothstep(-0.12, -0.01, distanceToScan) * (1.0 - smoothstep(0.18, 0.35, distanceToScan));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(formed, 1.0);
        gl_PointSize = (2.0 + aSeed * 2.0) * uPixelRatio;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float radius = length(gl_PointCoord - vec2(0.5));
        float alpha = (1.0 - smoothstep(0.18, 0.5, radius)) * vAlpha;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.name = 'fusion-scan-particles';

  // Faixa luminosa plana, sem bloom, textura externa ou pós-processamento.
  const beam = new THREE.Group();
  const width = size.x * 1.08, depth = size.z * 1.08;
  const planeGeometry = new THREE.PlaneGeometry(width, depth);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: '#ff6a21', transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  beam.add(plane);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-width / 2, 0, -depth / 2), new THREE.Vector3(width / 2, 0, -depth / 2),
    new THREE.Vector3(width / 2, 0, depth / 2), new THREE.Vector3(-width / 2, 0, depth / 2),
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: '#ff6a21', transparent: true, opacity: 0.75, depthWrite: false, toneMapped: false });
  beam.add(new THREE.LineLoop(lineGeometry, lineMaterial));
  beam.position.set(center.x, bounds.min.y - height * 0.15, center.z);

  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), beam.position.y);
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const previousPlanes = materials.map(m => m.clippingPlanes);
  const previousClipping = renderer.localClippingEnabled;
  const previousShadow = shadow.visible;
  const previousCastShadow = mesh.castShadow;
  let frame = null, startedAt = null, lastFrame = -Infinity, disposed = false;
  const frameInterval = compact ? 1000 / 30 : 0;

  // dispose é idempotente e restaura também os materiais em interrupções.
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    if (frame !== null) cancelAnimationFrame(frame);
    scene.remove(points, beam);
    materials.forEach((m, i) => { m.clippingPlanes = previousPlanes[i]; m.needsUpdate = true; });
    renderer.localClippingEnabled = previousClipping;
    shadow.visible = previousShadow;
    mesh.castShadow = previousCastShadow;
    geometry.dispose(); material.dispose(); planeGeometry.dispose(); planeMaterial.dispose();
    lineGeometry.dispose(); lineMaterial.dispose();
  };

  try {
    materials.forEach(m => { m.clippingPlanes = [clip]; m.needsUpdate = true; });
    renderer.localClippingEnabled = true;
    shadow.visible = false;
    mesh.castShadow = false;
    scene.add(points, beam);
  } catch (error) { dispose(); throw error; }

  const tick = (now) => {
    if (disposed) return;
    if (startedAt === null) startedAt = now;
    const progress = Math.min((now - startedAt) / duration, 1);
    if (progress >= 1) { onComplete(); return; }
    if (now - lastFrame >= frameInterval) {
      lastFrame = now;
      const sweep = -0.15 + progress * 1.35;
      uniforms.uSweep.value = sweep;
      uniforms.uPixelRatio.value = Math.min(renderer.getPixelRatio(), 2);
      clip.constant = bounds.min.y + height * sweep;
      beam.position.y = clip.constant;
      beam.visible = sweep >= 0 && sweep <= 1;
      try { render(true); } catch (error) { console.warn('Digitalização interrompida:', error); onComplete(); return; }
    }
    frame = requestAnimationFrame(tick);
  };
  return { particleCount, dispose, start() { if (!disposed && frame === null) frame = requestAnimationFrame(tick); } };
}
