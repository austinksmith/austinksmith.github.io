
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
    '960x1080': {
        width: '250px',
        height: '188px',
        top: 'calc(65vh - 80px)',
        left: 'calc(10vw - 80px)'
    },
    '925x972': {
        width: '250px',
        height: '188px',
        top: 'calc(65vh - 80px)',
        left: 'calc(-8vw - 80px)'
    },
    '885x885': {
        width: '250px',
        height: '188px',
        top: 'calc(65vh - 80px)',
        left: 'calc(10vw - 80px)'
    },
    '885x599': {
        width: '150px',
        height: '120px',
        top: 'calc(60vh - 20px)',
        left: 'calc(20vw - 20px)'
    },
    '854x480': {
        width: '150px',
        height: '85px',
        top: 'calc(61vh - 20px)',
        left: 'calc(23vw - 20px)'
    }
};

const canvas = document.getElementById('monitor-canvas');

let camera, renderer;

function applyResolutionSettings() {
    const width = window.screen.width;
    const height = window.screen.height;
    const resolutionKey = `${width}x${height}`;
    const settings = resolutionSettings[resolutionKey] || approximateSettings(width, height);
    canvas.style.width = settings.width;
    canvas.style.height = settings.height;
    canvas.style.top = settings.top;
    canvas.style.left = settings.left;
}

function approximateSettings(width, height) {
    let closestKey = null;
    let closestDistance = Infinity;

    for (const key in resolutionSettings) {
        const [keyWidth, keyHeight] = key.split('x').map(Number);
        const distance = Math.sqrt(Math.pow(keyWidth - width, 2) + Math.pow(keyHeight - height, 2));

        if (distance < closestDistance) {
            closestDistance = distance;
            closestKey = key;
        }
    }

    console.log(`No exact match found for ${width}x${height}. Closest match is ${closestKey}`);
    return resolutionSettings[closestKey];
}

function initThreeJS() {
    const scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
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

window.addEventListener('resize', () => {
    applyResolutionSettings();
    
    // Update camera aspect ratio
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(canvas.width, canvas.height);

    // Log the camera and renderer sizes for debugging
    console.log(`Camera aspect: ${camera.aspect}`);
    console.log(`Renderer size: ${canvas.width}x${canvas.height}`);
});