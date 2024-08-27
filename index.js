let numPoints = 200;
let multiplier = 1;
let frameCount = 0;
let maxFrames = 60;
let radius;
let points = [];
let colors = [];

function setup() {
  createCanvas(800, 800);
  radius = min(width, height) / 2 - 20;

  // Generate circle points and colors
  for (let i = 0; i < numPoints; i++) {
    let angle = map(i, 0, numPoints, 0, TWO_PI);
    let x = width / 2 + cos(angle) * radius;
    let y = height / 2 + sin(angle) * radius;
    points.push(createVector(x, y));

    // Generate a random color for each point
    colors.push(color(random(255), random(255), random(255)));
  }

  frameRate(30); // Control the speed of rendering
  noLoop(); // Stop loop initially, start with button click

  // Set up event listeners
  document.getElementById('startButton').addEventListener('click', startSimulation);
  document.getElementById('stopButton').addEventListener('click', stopSimulation);
}

function draw() {
  background(0);
  strokeWeight(2);

  // Draw connections based on the current multiplier
  for (let i = 0; i < numPoints; i++) {
    let start = points[i];
    let end = points[(i * multiplier) % numPoints];
    stroke(colors[i]);
    line(start.x, start.y, end.x, end.y);
  }

  frameCount++;
  
  // Every 10 frames, increase the multiplier
  if (frameCount % maxFrames === 0) {
    multiplier += 1;
  }

  // Display the current multiplier and frame count
  document.getElementById('frameInfo').innerText = `Frame: ${frameCount}`;
  document.getElementById('renderTime').innerText = `Multiplier: ${multiplier}`;

  if (multiplier >= 100) {
    stopSimulation(); // Stop after 100 frames or 10 cycles
  }
}

function startSimulation() {
  frameCount = 0;
  multiplier = 1;
  loop(); // Restart the loop
}

function stopSimulation() {
  noLoop(); // Stop the loop
}
