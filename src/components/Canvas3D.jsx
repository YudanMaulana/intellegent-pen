import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Canvas3D({ scene, currentTime, isPlaying, isPortrait }) {
  const mountRef = useRef(null);
  
  // Keep track of parameters for animations
  const stateRef = useRef({
    scene,
    currentTime,
    isPlaying,
    clickAnimationTime: 0,
    clicked: false,
    isPortrait
  });

  // Sync props to stateRef for use in the animation loop
  useEffect(() => {
    // Detect transitions to scene 2 to trigger the pen click
    if (scene === 2 && stateRef.current.scene !== 2) {
      stateRef.current.clicked = false;
      stateRef.current.clickAnimationTime = 0;
    }
    
    stateRef.current.scene = scene;
    stateRef.current.currentTime = currentTime;
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.isPortrait = isPortrait;
  }, [scene, currentTime, isPlaying, isPortrait]);

  useEffect(() => {
    const currentMount = mountRef.current;
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Setup Scene, Camera, Renderer
    const threeScene = new THREE.Scene();
    
    // Add dark workspace grid / atmosphere
    threeScene.fog = new THREE.FogExp2(0x0a0a0c, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // 2. Setup Lighting (Dramatic Product Lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    threeScene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xffffff, 35);
    spotlight.position.set(5, 8, 5);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.8;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 2048;
    spotlight.shadow.mapSize.height = 2048;
    threeScene.add(spotlight);

    // Front soft light to illuminate pen details
    const frontLight = new THREE.DirectionalLight(0xffffff, 2.5);
    frontLight.position.set(0, 2, 6);
    threeScene.add(frontLight);

    // Fill light (cyan/blue accent)
    const fillLight = new THREE.DirectionalLight(0x00f2fe, 4);
    fillLight.position.set(-6, -2, -2);
    threeScene.add(fillLight);

    // Rim light (soft purple accent)
    const rimLight = new THREE.DirectionalLight(0x764ba2, 5);
    rimLight.position.set(-2, 5, -5);
    threeScene.add(rimLight);

    // 3. Create procedural 3D Pen
    const penGroup = new THREE.Group();
    threeScene.add(penGroup);

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x4a4c54, // Sleek premium titanium grey instead of pitch black
      metalness: 0.8,
      roughness: 0.22,
      envMapIntensity: 1.5
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe5e5e7,
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 2.0
    });

    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x00f2fe,
      emissiveIntensity: 0.0,
      roughness: 0.2
    });

    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x5a5c64, // Brightened tip material
      metalness: 0.8,
      roughness: 0.18
    });

    // Pen parts geometries
    // Main lower body
    const lowerBodyGeo = new THREE.CylinderGeometry(0.24, 0.2, 2.5, 32);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, bodyMat);
    lowerBody.position.y = -0.5;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    penGroup.add(lowerBody);

    // Main upper body
    const upperBodyGeo = new THREE.CylinderGeometry(0.24, 0.24, 2.0, 32);
    const upperBody = new THREE.Mesh(upperBodyGeo, bodyMat);
    upperBody.position.y = 1.75;
    upperBody.castShadow = true;
    upperBody.receiveShadow = true;
    penGroup.add(upperBody);

    // LED Ring Band
    const ledGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.12, 32);
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.y = 0.75;
    penGroup.add(ledMesh);

    // Chrome accents
    const ring1Geo = new THREE.CylinderGeometry(0.248, 0.248, 0.04, 32);
    const ring1 = new THREE.Mesh(ring1Geo, chromeMat);
    ring1.position.y = 0.83;
    penGroup.add(ring1);

    const ring2 = new THREE.Mesh(ring1Geo, chromeMat);
    ring2.position.y = 0.67;
    penGroup.add(ring2);

    // Conical Tip
    const tipGeo = new THREE.ConeGeometry(0.2, 0.7, 32);
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    tipMesh.position.y = -2.1;
    tipMesh.rotation.x = Math.PI;
    tipMesh.castShadow = true;
    penGroup.add(tipMesh);

    // Metal point
    const nibGeo = new THREE.ConeGeometry(0.07, 0.22, 32);
    const nibMesh = new THREE.Mesh(nibGeo, chromeMat);
    nibMesh.position.y = -2.5;
    nibMesh.rotation.x = Math.PI;
    penGroup.add(nibMesh);

    // Clip (Sleek pocket clip)
    const clipGroup = new THREE.Group();
    clipGroup.position.set(0, 2.0, 0.22);
    
    const clipArmGeo = new THREE.BoxGeometry(0.05, 1.2, 0.05);
    const clipArm = new THREE.Mesh(clipArmGeo, chromeMat);
    clipArm.position.y = -0.5;
    clipGroup.add(clipArm);

    const clipTopGeo = new THREE.BoxGeometry(0.05, 0.08, 0.12);
    const clipTop = new THREE.Mesh(clipTopGeo, chromeMat);
    clipTop.position.set(0, 0.04, -0.04);
    clipGroup.add(clipTop);

    penGroup.add(clipGroup);

    // Clickable button
    const buttonGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 32);
    const buttonMesh = new THREE.Mesh(buttonGeo, chromeMat);
    buttonMesh.position.y = 2.85; // Default y
    penGroup.add(buttonMesh);

    // 4. Soundwave Visualizer Rings (for Scene 3)
    const ringsGroup = new THREE.Group();
    threeScene.add(ringsGroup);

    const ringCount = 3;
    const soundRings = [];
    const ringLineMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0
    });

    for (let i = 0; i < ringCount; i++) {
      const circleGeo = new THREE.BufferGeometry();
      const points = [];
      const steps = 64;
      for (let s = 0; s <= steps; s++) {
        const theta = (s / steps) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0));
      }
      circleGeo.setFromPoints(points);
      const ringLine = new THREE.Line(circleGeo, ringLineMat.clone());
      ringLine.scale.setScalar(0.1);
      ringsGroup.add(ringLine);
      soundRings.push({
        mesh: ringLine,
        phase: i / ringCount // offset starting phases
      });
    }

    // 5. Data Flow Particles (for Scene 4)
    const particlesGroup = new THREE.Group();
    threeScene.add(particlesGroup);
    
    const pCount = 24;
    const particles = [];
    const pMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.8
    });
    
    for (let i = 0; i < pCount; i++) {
      const pGeo = new THREE.SphereGeometry(0.02 + Math.random() * 0.02, 6, 6);
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.set(0, 0, 0);
      particlesGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: 0.03 + Math.random() * 0.06,
        speedZ: (Math.random() - 0.5) * 0.05,
        life: Math.random()
      });
    }

    // 6. Animation settings & Lerping targets
    let reqId;
    const targetCameraPos = new THREE.Vector3(0, 0, 8);
    const targetPenPos = new THREE.Vector3(0, 0, 0);
    const targetPenRot = new THREE.Euler(0, 0, 0);
    let targetLEDIntensity = 0;

    const clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const state = stateRef.current;
      const time = state.currentTime;

      // Update positions based on scenes
      switch (state.scene) {
        case 1: // The Problem: Dark, deactivated, floating
          if (state.isPortrait) {
            targetCameraPos.set(0, 0, 8.5);
            targetPenPos.set(0, 1.2, -1.2);
          } else {
            targetCameraPos.set(0, 0, 8);
            targetPenPos.set(0, 0, -1);
          }
          targetPenRot.set(0.4, 0.8 + Math.sin(time * 0.2) * 0.3, 0.2);
          targetLEDIntensity = 0.0;
          
          ringsGroup.visible = false;
          particlesGroup.visible = false;
          break;

        case 2: // The Solution: Focus, click, light-up
          if (state.isPortrait) {
            targetCameraPos.set(0, 0.2, 8.0);
            targetPenPos.set(0, 1.2, 0);
          } else {
            targetCameraPos.set(0, 0.2, 7.5);
            targetPenPos.set(0, 0.3, 0);
          }
          targetPenRot.set(0.1, 0.6, -0.05);

          // Animate button click translation
          if (state.isPlaying) {
            // Click happens in the first 2 seconds of Scene 2 (7s - 9s in global timeline)
            const localSec = time - 7;
            if (localSec >= 0.5 && localSec <= 1.2) {
              // Button goes down
              const progress = (localSec - 0.5) / 0.7; // 0 to 1
              const buttonY = 2.85 - Math.sin(progress * Math.PI) * 0.14;
              buttonMesh.position.y = buttonY;
              
              if (localSec >= 0.85) {
                targetLEDIntensity = 2.0; // LED fires
              }
            } else {
              buttonMesh.position.y = 2.85;
              if (localSec > 1.2) {
                targetLEDIntensity = 1.5;
              }
            }
          } else {
            buttonMesh.position.y = 2.85;
            targetLEDIntensity = 1.5;
          }

          ringsGroup.visible = false;
          particlesGroup.visible = false;
          break;

        case 3: // Recording: Laying flat/angled, spinning, soundwaves
          if (state.isPortrait) {
            targetCameraPos.set(0, 0, 7.5);
            targetPenPos.set(0, 0.9, 0.5);
          } else {
            targetCameraPos.set(0, 0, 6.8);
            targetPenPos.set(0, -0.2, 0.5);
          }
          
          // Animate pen flat rotation
          targetPenRot.set(
            1.15,
            (state.isPlaying ? time * 1.5 : 3.0),
            0.1
          );

          // LED pulsates during recording
          targetLEDIntensity = 1.5 + Math.sin(time * 8) * 0.6;
          
          // Animate expanding soundwave rings from pen tip (-2.5 y in penGroup local coord)
          ringsGroup.visible = true;
          particlesGroup.visible = false;

          // Find pen tip absolute position
          const tipWorldPos = new THREE.Vector3(0, -2.5, 0);
          tipWorldPos.applyMatrix4(penGroup.matrixWorld);
          ringsGroup.position.copy(tipWorldPos);
          ringsGroup.rotation.copy(penGroup.rotation);

          soundRings.forEach(ring => {
            if (state.isPlaying) {
              ring.phase += delta * 0.5;
              if (ring.phase > 1) ring.phase = 0;
            }
            
            const scale = 0.1 + ring.phase * 3.5;
            ring.mesh.scale.setScalar(scale);
            
            // Fade-out as it grows
            const opacity = Math.sin(ring.phase * Math.PI) * 0.8;
            ring.mesh.material.opacity = opacity;
            ring.mesh.material.transparent = true;
          });
          break;

        case 4: // AI Processing: Transcription, upright, data particles
          if (state.isPortrait) {
            targetCameraPos.set(0, 0.4, 7.8);
            targetPenPos.set(0, 1.3, 0);
          } else {
            targetCameraPos.set(0, 0.4, 7.2);
            targetPenPos.set(-1.8, 0.4, 0);
          }
          targetPenRot.set(0.15, time * 0.4, -0.08);
          targetLEDIntensity = 1.5;

          ringsGroup.visible = false;
          particlesGroup.visible = true;

          // Align particles to pen tip
          const pTipPos = new THREE.Vector3(0, -2.5, 0);
          pTipPos.applyMatrix4(penGroup.matrixWorld);
          particlesGroup.position.copy(pTipPos);

          particles.forEach(p => {
            if (state.isPlaying) {
              p.life += delta * 0.4;
              if (p.life > 1) {
                p.life = 0;
                p.mesh.position.set(0, 0, 0);
                p.speedX = (Math.random() - 0.5) * 0.1;
                p.speedY = 0.08 + Math.random() * 0.12;
                p.speedZ = (Math.random() - 0.5) * 0.1;
              }
              
              p.mesh.position.x += p.speedX * 60 * delta;
              p.mesh.position.y += p.speedY * 60 * delta;
              p.mesh.position.z += p.speedZ * 60 * delta;
            }

            p.mesh.material.opacity = (1 - p.life) * 0.8;
            const pScale = (1 - p.life) * 1.5;
            p.mesh.scale.setScalar(pScale);
          });
          break;

        case 5: // AI Scoring: Left side, orbit, soft pulsing
          if (state.isPortrait) {
            targetCameraPos.set(0, 0.0, 7.8);
            targetPenPos.set(0, 1.3, 0);
          } else {
            targetCameraPos.set(0, 0.0, 6.5);
            targetPenPos.set(-2.0, 0.0, 0);
          }
          targetPenRot.set(0.2, time * 0.25, -0.05);
          targetLEDIntensity = 1.0 + Math.sin(time * 2) * 0.25;

          ringsGroup.visible = false;
          particlesGroup.visible = false;
          break;

        case 6: // Final: Right side, premium presentation angle
          if (state.isPortrait) {
            targetCameraPos.set(0, 0.0, 8.0);
            targetPenPos.set(0, 1.2, 0);
          } else {
            targetCameraPos.set(0, 0.0, 7.2);
            targetPenPos.set(1.6, -0.4, 0);
          }
          targetPenRot.set(0.35, 0.6 + Math.sin(time * 0.1) * 0.15, -0.25);
          targetLEDIntensity = 2.0;

          ringsGroup.visible = false;
          particlesGroup.visible = false;
          break;

        default:
          break;
      }

      // Smoothly interpolate positions & lighting
      camera.position.lerp(targetCameraPos, 0.08);
      penGroup.position.lerp(targetPenPos, 0.08);
      
      // Interpolate rotation
      penGroup.rotation.x = THREE.MathUtils.lerp(penGroup.rotation.x, targetPenRot.x, 0.08);
      penGroup.rotation.y = THREE.MathUtils.lerp(penGroup.rotation.y, targetPenRot.y, 0.08);
      penGroup.rotation.z = THREE.MathUtils.lerp(penGroup.rotation.z, targetPenRot.z, 0.08);

      // LED glowing material intensity
      ledMat.emissiveIntensity = THREE.MathUtils.lerp(ledMat.emissiveIntensity, targetLEDIntensity, 0.15);

      renderer.render(threeScene, camera);
    };

    animate();

    // 7. Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose Geometries and Materials
      lowerBodyGeo.dispose();
      upperBodyGeo.dispose();
      ledGeo.dispose();
      ring1Geo.dispose();
      tipGeo.dispose();
      nibGeo.dispose();
      clipArmGeo.dispose();
      clipTopGeo.dispose();
      buttonGeo.dispose();

      bodyMat.dispose();
      chromeMat.dispose();
      ledMat.dispose();
      tipMat.dispose();
      pMat.dispose();
      ringLineMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="canvas-container" 
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: 'none' // Let mouse events pass to overlays
      }}
    />
  );
}
