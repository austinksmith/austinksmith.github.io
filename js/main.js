
const resolutionSettings = {
    '3840x2160': {
        width: '700px',
        height: '393px',
        top: 'calc(53vh + 80px)',
        left: 'calc(20vw + 40px)'
    },
    '2560x1440': {
        width: '500px',
        height: '281px',
        top: 'calc(54vh + 40px)',
        left: 'calc(20vw + 20px)'
    },
    '1920x1080': {
        width: 'calc(10vw + 150px)',
        height: 'calc(7.5vh + 100px)',
        top: 'calc(57vh + 20px)',
        left: 'calc(21vw + 10px)'
    },
    '1600x900': {
        width: '400px',
        height: '225px',
        top: 'calc(60vh - 60px)',
        left: 'calc(22vw - 60px)'
    },
    '1366x768': {
        width: '300px',
        height: '225px',
        top: 'calc(65vh - 100px)',
        left: 'calc(28vw - 100px)'
    },
    '1280x720': {
        width: '250px',
        height: '188px',
        top: 'calc(65vh - 80px)',
        left: 'calc(28vw - 80px)'
    },
    '854x480': {
        width: '150px',
        height: '85px',
        top: 'calc(61vh - 20px)',
        left: 'calc(23vw - 20px)'
    }
};

function applyResolutionSettings() {
    const width = window.screen.width;
    const height = window.screen.height;
    const resolutionKey = `${width}x${height}`;
    const settings = resolutionSettings[resolutionKey] || resolutionSettings['1920x1080'];

    const canvas = document.getElementById('monitor-canvas');
    canvas.style.width = settings.width;
    canvas.style.height = settings.height;
    canvas.style.top = settings.top;
    canvas.style.left = settings.left;
}

function initThreeJS() {
    const canvas = document.getElementById('monitor-canvas');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();
}

// Apply resolution-specific settings and initialize Three.js
applyResolutionSettings();
initThreeJS();

// Adjust canvas size on window resize
window.addEventListener('resize', () => {
    applyResolutionSettings();
    initThreeJS();
});