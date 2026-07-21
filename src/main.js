import './style.css'
import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; 

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg-canvas'),
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// 2. Load the Image as Texture
const textureLoader = new THREE.TextureLoader();
// เราจะดึงรูปจากโฟลเดอร์ public/bg.png
const bgTexture = textureLoader.load('./bg.png');

// สร้างแผ่นสี่เหลี่ยม (Plane) สำหรับแปะรูป
const geometry = new THREE.PlaneGeometry(16, 9); // สัดส่วน 16:9
const material = new THREE.MeshBasicMaterial({ 
  map: bgTexture,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// 2.5 พื้นหลังแบบเส้นๆ (Animated Grid)
const gridGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const gridMaterial = new THREE.MeshBasicMaterial({ 
  color: 0x555555, 
  wireframe: true, 
  transparent: true, 
  opacity: 0.3 
});
const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
gridMesh.position.z = -15; // ถอยไปอยู่ข้างหลังรูป
scene.add(gridMesh);

// ปรับขนาดแผ่นรูปให้เต็มจอพอดี
const scalePlane = () => {
  const aspect = window.innerWidth / window.innerHeight;
  const imageAspect = 16 / 9;
  let scale = 1.2; // ขยายเผื่อขอบไว้ตอนขยับเมาส์
  
  if (aspect > imageAspect) {
    plane.scale.set(aspect * scale, aspect * scale, 1);
  } else {
    plane.scale.set(scale, scale, 1); 
  }
}
scalePlane();

// 3. Mouse Interaction (Parallax effect)
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX);
  mouseY = (event.clientY - windowHalfY);
});

// 4. Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // ทำให้เส้นกริดด้านหลังหมุนช้าๆ ให้ดูเคลื่อนไหว
  gridMesh.rotation.z -= 0.001;

  // คำนวณเป้าหมายการหมุน
  targetX = mouseX * 0.0005;
  targetY = mouseY * 0.0005;
  
  // ทำให้ภาพเอียงตามเมาส์แบบนุ่มนวล
  plane.rotation.y += 0.05 * (targetX - plane.rotation.y);
  plane.rotation.x += 0.05 * (targetY - plane.rotation.x);
  
  // ขยับตำแหน่งภาพสวนทางเล็กน้อยให้ดูมีมิติความลึก (Depth)
  plane.position.x += 0.05 * (-targetX * 2 - plane.position.x);
  plane.position.y += 0.05 * (targetY * 2 - plane.position.y);

  renderer.render(scene, camera);
}

animate();

// 5. Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  scalePlane();
});
