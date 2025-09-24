let width = 500;
let height = 500;
let maxIterations = 300;
let mandelbrotSetBuffer;
let zoomLevels = [
  { xMin: -2.75, xMax: 1.75, yMin: -1.75, yMax: 1.75 }, // Level 0
  { xMin: -2.5, xMax: 1.5, yMin: -1.5, yMax: 1.5 },     // Level 1
  { xMin: -2.25, xMax: 1.25, yMin: -1.25, yMax: 1.25 }, // Level 2
  { xMin: -2.0, xMax: 1.0, yMin: -1.0, yMax: 1.0 },     // Level 3
  { xMin: -1.75, xMax: 0.75, yMin: -0.75, yMax: 0.75 }, // Level 4
  { xMin: -1.5, xMax: 0.5, yMin: -0.5, yMax: 0.5 },     // Level 5
  { xMin: -1.25, xMax: 0.25, yMin: -0.25, yMax: 0.25 }, // Level 6
  { xMin: -1.0, xMax: 0.0, yMin: -0.5, yMax: 0.5 },     // Level 7
  { xMin: -0.75, xMax: -0.25, yMin: -0.75, yMax: 0.75 }, // Level 8
  { xMin: -0.5, xMax: 0.5, yMin: -0.5, yMax: 0.5 },     // Level 9
];

let currentZoom = 0;
let renderTimes = [];
let totalTime = 0;
let isRendering = false;
let params = {}; // Initialize params object
let maxThreads = 1;
let mandelbrotSet;

const mandelbrotOperator = function () {
  const sharedArray = params.sharedArray;
  const maxIterations = params.maxIterations;
  const width = params.width;
  const height = params.height;
  const xMin = params.xMin;
  const xMax = params.xMax;
  const yMin = params.yMin;
  const yMax = params.yMax;

  const map = (value, low1, high1, low2, high2) => low2 + (high2 - low2) * (value - low1) / (high1 - low1);

  const start = params.index.start || 0;
  const end = params.index.end;

  for (let index = start; index <= end; index++) {
    const x = index % width;
    const y = Math.floor(index / width);

    let a = map(x, 0, width, xMin, xMax);
    let b = map(y, 0, height, yMin, yMax);
    let n = 0;
    let z = 0;
    let zi = 0;

    while (n < maxIterations) {
      let aa = z * z - zi * zi + a;
      let bb = 2 * z * zi + b;
      z = aa;
      zi = bb;

      if (Math.abs(z + zi) > 16) {
        break;
      }
      n++;
    }

    Atomics.store(sharedArray, index, n);
  }
};

function setup() {
  const canvasEl = createCanvas(width, height);
  pixelDensity(1); // Ensure pixel density is 1 for consistency
  canvasEl.parent('hamstersCanvas'); // Attach the p5 canvas to the specific HTML canvas element


  mandelbrotSetBuffer = new SharedArrayBuffer(width * height * Uint32Array.BYTES_PER_ELEMENT);
  mandelbrotSet = new Uint32Array(mandelbrotSetBuffer);
  
  initializeMandelbrotParams();
  
  // Set up event listeners
  document.getElementById('startButton').addEventListener('click', startSimulation);
  document.getElementById('stopButton').addEventListener('click', stopSimulation);
  document.getElementById('iterations').addEventListener('change', updateIterations);
  document.getElementById('threadCount').addEventListener('change', updateThreads);

  populateThreadDropdown(); // Populate dropdown with thread options

  // Start simulation by default or on button click
  // startSimulation(); // Uncomment if you want to start on page load
}

function initializeMandelbrotParams() {
  params = {
    sharedArray: new Uint32Array(mandelbrotSetBuffer),
    maxIterations: maxIterations,
    width: width,
    height: height,
    dataType: 'Uint32',
    threads: parseInt(document.getElementById('threadCount').value, 10) || 1 // Number of threads
  };
}

function populateThreadDropdown() {
  const threadCountSelect = document.getElementById('threadCount');
  maxThreads = hamsters.maxThreads; // Get the maximum number of threads available

  // Create dropdown options for thread counts
  for (let i = 1; i <= maxThreads; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = i;
    threadCountSelect.add(option);
  }
}

function updateIterations() {
  maxIterations = parseInt(document.getElementById('iterations').value, 10);
  initializeMandelbrotParams(); // Reinitialize parameters with new maxIterations
}

function updateThreads() {
  params.threads = parseInt(document.getElementById('threadCount').value, 10);
  initializeMandelbrotParams(); // Reinitialize parameters with new thread count
}

function resetCanvas() {
  clear(); // Clear the canvas
  currentZoom = 0; // Reset zoom level
  renderTimes = []; // Clear previous render times
  totalTime = 0; // Reset total time
  document.getElementsByClassName("results")[0].style.display = "block";
}

function startSimulation() {
  if (!isRendering) {
    resetCanvas();
    isRendering = true;
    renderNextZoom(mandelbrotSet);
  }
}

function stopSimulation() {
  noLoop();
  isRendering = false;
}

function renderNextZoom(mandelbrotSet) {
  if (currentZoom < zoomLevels.length && isRendering) {
    params.sharedArray = mandelbrotSet;
    params.xMin = zoomLevels[currentZoom].xMin;
    params.xMax = zoomLevels[currentZoom].xMax;
    params.yMin = zoomLevels[currentZoom].yMin;
    params.yMax = zoomLevels[currentZoom].yMax;

    const startTime = performance.now();

    hamsters.promise(params, mandelbrotOperator).then((newMandelbrotSet) => {
      if (!isRendering) return; // Exit if rendering was stopped

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      renderTimes.push(renderTime);
      totalTime += renderTime;
      const averageTime = totalTime / renderTimes.length;

      document.getElementById('frameInfo').innerText = `Frame: ${currentZoom + 1}/10`;
      document.getElementById('renderTime').innerText = `Average Rendering Time: ${averageTime.toFixed(2)} ms`;

      drawMandelbrot(newMandelbrotSet);
      currentZoom++;
      setTimeout(() => renderNextZoom(newMandelbrotSet), 4); // Wait for 4ms before rendering the next zoom level
    });
  } else {
    stopSimulation();
  }
}

function drawMandelbrot(mandelbrotSet) {
  loadPixels();
  for (let index = 0; index < width * height; index++) {
    let n = mandelbrotSet[index];
    let x = index % width;
    let y = Math.floor(index / width);
    let brightness = map(n, 0, maxIterations, 0, 255);

    let pixelIndex = (x + y * width) * 4;
    pixels[pixelIndex] = brightness;        // Red
    pixels[pixelIndex + 1] = brightness;    // Green
    pixels[pixelIndex + 2] = brightness;    // Blue
    pixels[pixelIndex + 3] = 255;           // Alpha
  }
  updatePixels();
}
