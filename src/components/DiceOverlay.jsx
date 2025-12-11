import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './DiceOverlay.css';

// Dice value faces mapping (for determining result based on orientation)
const D6_FACE_NORMALS = [
  { normal: new THREE.Vector3(0, 1, 0), value: 1 },
  { normal: new THREE.Vector3(0, -1, 0), value: 6 },
  { normal: new THREE.Vector3(1, 0, 0), value: 3 },
  { normal: new THREE.Vector3(-1, 0, 0), value: 4 },
  { normal: new THREE.Vector3(0, 0, 1), value: 2 },
  { normal: new THREE.Vector3(0, 0, -1), value: 5 },
];

// Colors for different dice types
const DICE_COLORS = {
  d4: 0xffb3ba,   // Pink
  d6: 0xbae1ff,   // Blue
  d8: 0xbaffc9,   // Green
  d10: 0xffffba,  // Yellow
  d12: 0xd4baff,  // Purple
  d20: 0xffdfba,  // Orange
  d100: 0xffc9de, // Rose
};

function DiceOverlay({ diceConfig, onComplete, onClose }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(null);
  const diceRef = useRef([]);
  const animationRef = useRef(null);
  const [results, setResults] = useState(null);
  const [isRolling, setIsRolling] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Create dice geometry based on type
  const createDiceGeometry = useCallback((sides) => {
    switch (sides) {
      case 4:
        return new THREE.TetrahedronGeometry(0.8);
      case 6:
        return new THREE.BoxGeometry(1, 1, 1);
      case 8:
        return new THREE.OctahedronGeometry(0.7);
      case 10:
        return new THREE.DodecahedronGeometry(0.6);
      case 12:
        return new THREE.DodecahedronGeometry(0.7);
      case 20:
        return new THREE.IcosahedronGeometry(0.7);
      case 100:
        return new THREE.OctahedronGeometry(0.8);
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }, []);

  // Create dice physics shape
  const createDiceShape = useCallback((sides) => {
    switch (sides) {
      case 4:
        return new CANNON.Sphere(0.6);
      case 6:
        return new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
      case 8:
      case 10:
      case 12:
      case 20:
      case 100:
        return new CANNON.Sphere(0.5);
      default:
        return new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    }
  }, []);

  // Initialize scene
  useEffect(() => {
    if (!containerRef.current || !diceConfig) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera - top-down view
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 12, 0);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 15, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 30;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Subtle fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 10, -5);
    scene.add(fillLight);

    // Ground plane (invisible but receives shadows)
    const groundGeometry = new THREE.PlaneGeometry(30, 30);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Physics world
    const world = new CANNON.World();
    world.gravity.set(0, -25, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 20;
    world.defaultContactMaterial.friction = 0.5;
    world.defaultContactMaterial.restitution = 0.3;
    worldRef.current = world;

    // Ground physics
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Walls (to keep dice in frame)
    const wallShape = new CANNON.Plane();
    const walls = [
      { pos: [0, 0, -6], rot: [0, 0, 0] },
      { pos: [0, 0, 6], rot: [0, Math.PI, 0] },
      { pos: [-8, 0, 0], rot: [0, Math.PI / 2, 0] },
      { pos: [8, 0, 0], rot: [0, -Math.PI / 2, 0] },
    ];

    walls.forEach(wall => {
      const body = new CANNON.Body({ mass: 0 });
      body.addShape(wallShape);
      body.position.set(...wall.pos);
      body.quaternion.setFromEuler(...wall.rot);
      world.addBody(body);
    });

    // Create dice
    const dice = [];
    let diceIndex = 0;

    Object.entries(diceConfig).forEach(([diceType, count]) => {
      const sides = parseInt(diceType.substring(1));
      const color = DICE_COLORS[diceType] || 0xffffff;

      for (let i = 0; i < count; i++) {
        // Random starting position above the view
        const startX = (Math.random() - 0.5) * 6;
        const startZ = (Math.random() - 0.5) * 4;
        const startY = 8 + Math.random() * 3;

        // Geometry and material
        const geometry = createDiceGeometry(sides);
        const material = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.4,
          metalness: 0.1,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(startX, startY, startZ);
        scene.add(mesh);

        // Physics body
        const shape = createDiceShape(sides);
        const body = new CANNON.Body({
          mass: 1,
          shape: shape,
          linearDamping: 0.3,
          angularDamping: 0.3,
        });
        body.position.set(startX, startY, startZ);

        // Random initial rotation
        body.quaternion.setFromEuler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );

        // Random initial velocity (throw from edge)
        const throwDirection = Math.random() * Math.PI * 2;
        const throwStrength = 3 + Math.random() * 4;
        body.velocity.set(
          Math.cos(throwDirection) * throwStrength,
          -2 - Math.random() * 3,
          Math.sin(throwDirection) * throwStrength
        );

        // Random spin
        body.angularVelocity.set(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        );

        world.addBody(body);

        dice.push({
          mesh,
          body,
          sides,
          diceType,
          index: diceIndex++,
        });
      }
    });

    diceRef.current = dice;

    // Animation loop
    const clock = new THREE.Clock();
    let settledFrames = 0;
    const SETTLE_THRESHOLD = 60; // frames of stability needed

    function animate() {
      animationRef.current = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      world.step(1 / 60, delta, 3);

      // Update mesh positions from physics
      let allSettled = true;
      dice.forEach(die => {
        die.mesh.position.copy(die.body.position);
        die.mesh.quaternion.copy(die.body.quaternion);

        // Check if dice are settled
        const velocity = die.body.velocity.length();
        const angularVelocity = die.body.angularVelocity.length();
        if (velocity > 0.05 || angularVelocity > 0.1) {
          allSettled = false;
        }
      });

      if (allSettled) {
        settledFrames++;
        if (settledFrames >= SETTLE_THRESHOLD && isRolling) {
          // Dice have settled - calculate results
          calculateResults();
        }
      } else {
        settledFrames = 0;
      }

      renderer.render(scene, camera);
    }

    function calculateResults() {
      const rollResults = {};
      let total = 0;

      dice.forEach(die => {
        // For simplicity, generate random result based on die sides
        // In a more complex implementation, we'd calculate based on orientation
        const result = Math.floor(Math.random() * die.sides) + 1;
        
        if (!rollResults[die.diceType]) {
          rollResults[die.diceType] = {
            rolls: [],
            total: 0,
          };
        }
        rollResults[die.diceType].rolls.push(result);
        rollResults[die.diceType].total += result;
        total += result;
      });

      setResults({ byType: rollResults, total });
      setIsRolling(false);
      
      // Show results after a brief pause
      setTimeout(() => setShowResults(true), 300);
    }

    animate();

    // Handle resize
    function handleResize() {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      dice.forEach(die => {
        scene.remove(die.mesh);
        die.mesh.geometry.dispose();
        die.mesh.material.dispose();
      });
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [diceConfig, createDiceGeometry, createDiceShape, isRolling]);

  const handleClose = () => {
    if (onComplete && results) {
      onComplete(results);
    }
    onClose();
  };

  return (
    <div className="dice-overlay">
      <div className="dice-overlay-backdrop" onClick={handleClose} />
      <div className="dice-overlay-container" ref={containerRef}>
        {isRolling && (
          <div className="dice-rolling-text">
            🎲 Rolling...
          </div>
        )}
      </div>
      
      {showResults && results && (
        <div className="dice-results-panel">
          <div className="dice-results-content">
            <div className="dice-total">
              <span className="total-label">Total</span>
              <span className="total-value">{results.total}</span>
            </div>
            
            <div className="dice-breakdown">
              {Object.entries(results.byType).map(([diceType, data]) => (
                <div key={diceType} className="dice-type-result">
                  <span className="dice-type-label">{diceType.toUpperCase()}</span>
                  <span className="dice-type-rolls">
                    [{data.rolls.join(', ')}]
                  </span>
                  <span className="dice-type-total">= {data.total}</span>
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary btn-close-results" onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DiceOverlay;
