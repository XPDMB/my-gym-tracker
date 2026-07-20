import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050202, 0.003); // หมอกสีดำอมแดงดุดัน

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 40);
// เอียงกล้องลงนิดหน่อยเพื่อมองกราฟ
camera.lookAt(0, 0, 0);

const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// 2. เส้นกราฟพื้นผิว (Wireframe Terrain)
const planeGeo = new THREE.PlaneGeometry(250, 250, 40, 40);
planeGeo.rotateX(-Math.PI / 2); // วางราบนอนลง

const planeMat = new THREE.MeshBasicMaterial({ 
    color: 0xff1111, // สีแดงดุดัน (Aggressive Red)
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.position.y = -15;
scene.add(plane);

// เก็บค่า Y เริ่มต้นของแต่ละจุดเพื่อทำแอนิเมชันคลื่น
const vertices = planeGeo.attributes.position.array;
const originalY = new Float32Array(vertices.length / 3);
for(let i = 0; i < vertices.length; i += 3) {
    originalY[i/3] = vertices[i+1];
}

// 3. แท่งกราฟ 3D (3D Bar Charts)
const bars = [];
const barGeo = new THREE.BoxGeometry(2, 1, 2);
const barMat = new THREE.MeshPhongMaterial({ 
    color: 0xff3300, // สีส้มแดง
    emissive: 0xaa0000, // เรืองแสงสีแดงเข้ม
    emissiveIntensity: 0.5,
    shininess: 100,
    transparent: true,
    opacity: 0.8
});

// สร้างแท่งกราฟหลายๆ แท่งสุ่มกระจัดกระจาย
for (let i = 0; i < 50; i++) {
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.x = (Math.random() - 0.5) * 150;
    bar.position.z = (Math.random() - 0.5) * 100 - 10;
    bar.position.y = -15; 
    
    bar.userData = {
        targetHeight: Math.random() * 25 + 5,
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
    };
    
    scene.add(bar);
    bars.push(bar);
}

// 4. Data Particles (อนุภาคข้อมูลลอยไปมา)
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 1500;
const posArray = new Float32Array(particleCount * 3);
for(let i=0; i<particleCount*3; i++) {
    posArray[i] = (Math.random() - 0.5) * 200;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
    size: 0.3,
    color: 0xffaa00, // สีส้มทอง
    transparent: true,
    opacity: 0.6
});
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// 5. แสงสว่าง (Lighting)
const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff0000, 10, 100);
pointLight.position.set(0, 10, 0);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xff5500, 2);
directionalLight.position.set(10, 20, -10);
scene.add(directionalLight);

// 6. แอนิเมชันลูป
const clock = new THREE.Clock();
let mouseX = 0;
let mouseY = 0;

// รับค่าเมาส์เพื่อหมุนฉาก 3D เล็กน้อย
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // แอนิเมชันให้พื้นผิวเป็นคลื่น (เหมือนกราฟที่ผันผวน)
    const positionAttribute = planeGeo.attributes.position;
    const vertexArray = positionAttribute.array;
    for(let i = 0; i < vertexArray.length; i += 3) {
        const x = vertexArray[i];
        const z = vertexArray[i+2];
        vertexArray[i+1] = originalY[i/3] + Math.sin(x * 0.1 + time * 1.5) * 3 + Math.cos(z * 0.1 + time) * 2;
    }
    positionAttribute.needsUpdate = true;

    // แอนิเมชันแท่งกราฟ (เด้งขึ้นลงตามจังหวะ)
    bars.forEach(bar => {
        const scaleY = (Math.sin(time * bar.userData.speed * 50 + bar.userData.phase) + 1) * 0.5 * bar.userData.targetHeight + 0.1;
        bar.scale.y = scaleY;
        bar.position.y = -15 + (scaleY / 2);
    });

    // หมุนอนุภาคข้อมูล
    particlesMesh.rotation.y = time * 0.02;
    particlesMesh.rotation.x = time * 0.01;

    // ขยับกล้องตามเมาส์นิดหน่อย
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += ((mouseY * 2 + 15) - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

// จัดการเรื่องการย่อ/ขยายหน้าต่างเบราว์เซอร์
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
