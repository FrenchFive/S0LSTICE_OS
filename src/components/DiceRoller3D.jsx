import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './DiceRoller3D.css';

function DiceRoller3D({ onRollComplete, externalRoll = null }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff5e6);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Table (ground)
    const tableGeometry = new THREE.BoxGeometry(20, 0.5, 20);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xbae1ff,
      roughness: 0.8
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.receiveShadow = true;
    table.position.y = -0.25;
    scene.add(table);

    // Physics world
    const world = new CANNON.World();
    world.gravity.set(0, -30, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;

    // Table physics
    const tableShape = new CANNON.Box(new CANNON.Vec3(10, 0.25, 10));
    const tableBody = new CANNON.Body({ mass: 0 });
    tableBody.addShape(tableShape);
    tableBody.position.set(0, -0.25, 0);
    world.addBody(tableBody);

    // Wall physics bodies
    const wallMaterial = new CANNON.Material();
    const wallShape1 = new CANNON.Box(new CANNON.Vec3(10, 5, 0.25));
    const wallShape2 = new CANNON.Box(new CANNON.Vec3(0.25, 5, 10));

    const walls = [
      { shape: wallShape1, position: [0, 5, 10] },
      { shape: wallShape1, position: [0, 5, -10] },
      { shape: wallShape2, position: [10, 5, 0] },
      { shape: wallShape2, position: [-10, 5, 0] }
    ];

    walls.forEach(wall => {
      const body = new CANNON.Body({ mass: 0, material: wallMaterial });
      body.addShape(wall.shape);
      body.position.set(...wall.position);
      world.addBody(body);
    });

    // Dice storage
    const dice = [];

    function createDie(sides, position, rotation) {
      let geometry, scale;
      
      switch(sides) {
        case 6:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          scale = 1;
          break;
        case 10:
          geometry = new THREE.OctahedronGeometry(0.7);
          scale = 1;
          break;
        case 20:
          geometry = new THREE.IcosahedronGeometry(0.8);
          scale = 1;
          break;
        case 100:
          geometry = new THREE.OctahedronGeometry(0.7);
          scale = 1.2;
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
          scale = 1;
      }

      const colors = [0xffb3ba, 0xbae1ff, 0xffffba, 0xbaffc9, 0xd4baff];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.5,
        metalness: 0.1
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.scale.setScalar(scale);
      mesh.position.copy(position);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z);
      scene.add(mesh);

      // Physics body
      const shape = new CANNON.Box(new CANNON.Vec3(scale * 0.5, scale * 0.5, scale * 0.5));
      const body = new CANNON.Body({
        mass: 1,
        shape: shape,
        material: new CANNON.Material({
          friction: 0.3,
          restitution: 0.4
        })
      });
      body.position.copy(position);
      body.quaternion.set(rotation.x, rotation.y, rotation.z, 1);
      
      // Apply initial force
      const force = new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 10
      );
      body.applyImpulse(force, new CANNON.Vec3(0, 0, 0));
      
      const torque = new CANNON.Vec3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
      body.angularVelocity.copy(torque);

      world.addBody(body);

      return { mesh, body, sides };
    }

    function rollDice(type, count) {
      // Clear existing dice
      dice.forEach(die => {
        scene.remove(die.mesh);
        world.removeBody(die.body);
      });
      dice.length = 0;

      setIsRolling(true);

      // Create new dice
      for (let i = 0; i < count; i++) {
        const position = new THREE.Vector3(
          (Math.random() - 0.5) * 4,
          8 + i * 2,
          (Math.random() - 0.5) * 4
        );
        const rotation = new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        
        const die = createDie(type, position, rotation);
        dice.push(die);
      }

      // Wait for dice to settle
      setTimeout(() => {
        const results = dice.map(die => {
          return Math.floor(Math.random() * die.sides) + 1;
        });

        setIsRolling(false);
        if (onRollComplete) {
          onRollComplete(results);
        }
      }, 3000);
    }

    // Animation loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      const deltaTime = Math.min(clock.getDelta(), 0.1);
      world.step(1 / 60, deltaTime, 3);

      // Update mesh positions from physics
      dice.forEach(die => {
        die.mesh.position.copy(die.body.position);
        die.mesh.quaternion.copy(die.body.quaternion);
      });

      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // Expose roll function
    containerRef.current.rollDice = rollDice;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      const container = containerRef.current;
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onRollComplete]);

  // Handle external rolls (from other players)
  useEffect(() => {
    if (externalRoll && containerRef.current && containerRef.current.rollDice) {
      containerRef.current.rollDice(externalRoll.sides, externalRoll.count);
    }
  }, [externalRoll]);

  return (
    <div className="dice-roller-3d">
      <div ref={containerRef} className="dice-canvas" />
      {isRolling && (
        <div className="rolling-indicator">
          🎲 Rolling dice...
        </div>
      )}
    </div>
  );
}

export default DiceRoller3D;
