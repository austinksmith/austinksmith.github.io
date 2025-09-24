// Initialize global variables
let grid;
let simulationTime = 0; // Track time
let fpsSum = 0; // Sum of FPS values for averaging
let frameCount = 0; // Count of frames to calculate average FPS
let startTime; // Time when the simulation starts
let isSimulationRunning = false; // To track simulation state
let params; // Parameters for Hamsters.js

// Weather condition mapping
const weatherConditions = {
  'sunny': 0,
  'cloudy': 1,
  'rainy': 2,
  'stormy': 3,
  'foggy': 4,
  'snowy': 5
};

//Settings
const cols = 50;
const rows = 50;
const cellSize = 10;
const maxTime = 600; // Run the simulation for 1000 frames
const dampingFactor = 0.90; // Adjusted to control transition rates

// Define transition probabilities
const transitionProbs = {
  'sunny': { cloudy: 0.10, rainy: 0.08, stormy: 0.05, foggy: 0.03, snowy: 0.02 },
  'cloudy': { sunny: 0.07, rainy: 0.12, stormy: 0.07, foggy: 0.03, snowy: 0.02 },
  'rainy': { sunny: 0.05, cloudy: 0.07, stormy: 0.15, foggy: 0.05, snowy: 0.03 },
  'stormy': { sunny: 0.04, cloudy: 0.08, rainy: 0.08, foggy: 0.20, snowy: 0.04 },
  'foggy': { sunny: 0.04, cloudy: 0.07, rainy: 0.04, stormy: 0.15, snowy: 0.12 },
  'snowy': { sunny: 0.06, cloudy: 0.06, rainy: 0.05, stormy: 0.04, foggy: 0.12 }
};

const operator = function() {
  const sharedArray = params.sharedArray; 
  const cols = params.cols;
  const rows = params.rows;
  const weatherConditions = params.weatherConditions;
  const dampingFactor = params.dampingFactor;
  const transitionProbs = params.transitionProbs;

  // Define a function to get neighbors
  function getNeighbors(x, y) {
      let neighbors = [];
      for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
              if (i !== 0 || j !== 0) {
                  let ni = (x + i + cols) % cols;
                  let nj = (y + j + rows) % rows;
                  neighbors.push(Atomics.load(sharedArray, ni + nj * cols));
              }
          }
      }
      return neighbors;
  }

  // Function to calculate the transition based on probability
  function calculateTransition(currentState, transitions, transitionProbs, dampingFactor) {
    for (let nextState in transitions) {
        if (Math.random() < (transitionProbs[nextState] + Math.random() * 0.05) * dampingFactor) {
            return transitions[nextState];
        }
    }
    return currentState;
  }

  // Function to find the key corresponding to a value in an object
  function findKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  // Determine the range of indices for this thread
  const start = params.index.start || 0;
  const end = params.index.end;

  for (let index = start; index <= end; index++) {
    const i = index % cols;
    const j = Math.floor(index / cols);
    const currentState = Atomics.load(sharedArray, index); 

    // Get the states of neighboring cells
    const neighbors = getNeighbors(i, j);
    const neighborSum = neighbors.reduce((sum, n) => sum + n, 0);
    const neighborAverage = neighborSum / neighbors.length;

    // Find the string key corresponding to the currentState value
    const currentStateKey = findKeyByValue(weatherConditions, currentState);

    // Transition logic with the optimized calculateTransition function
    const transitions = {
        'sunny': weatherConditions['sunny'],
        'cloudy': weatherConditions['cloudy'],
        'rainy': weatherConditions['rainy'],
        'stormy': weatherConditions['stormy'],
        'foggy': weatherConditions['foggy'],
        'snowy': weatherConditions['snowy']
    };

    let newState = calculateTransition(currentState, transitions, transitionProbs[currentStateKey], dampingFactor);

    Atomics.store(sharedArray, index, newState); 
  }
};

// Initialize and start Hamsters.js
function initializeParams() {
  // Create the SharedArrayBuffer and initialize grid
  const buffer = new SharedArrayBuffer(cols * rows * Uint8Array.BYTES_PER_ELEMENT);
  grid = new Uint8Array(buffer);

  // Get the selected starting weather condition from dropdown
  const startingWeather = parseInt(document.getElementById('startingWeather').value, 10);

  // Initialize grid with the selected starting weather condition
  for (let i = 0; i < grid.length; i++) {
    grid[i] = startingWeather;
  }

  // Get the selected number of threads from dropdown
  const threadCount = parseInt(document.getElementById('threadCount').value, 10);

  // Initialize params with the grid and other settings
  params = {
    sharedArray: grid, // Pass the SharedArrayBuffer directly
    cols: cols,
    rows: rows,
    weatherConditions: weatherConditions,
    dampingFactor: dampingFactor,
    dataType: 'Uint8',
    threads: threadCount, // Use selected number of threads
    transitionProbs: transitionProbs 
  };
}

function startSimulation() {
  if (isSimulationRunning) return;

  // Reset simulation state
  resetSimulation();

  initializeParams();

  // Record the start time
  startTime = performance.now();

  isSimulationRunning = true;
  frameRate(60); // Set frame rate to control the speed of the simulation
  loop(); // Ensure draw loop is active
}

function stopSimulation() {
  if (!isSimulationRunning) return;

  // Logic to stop the simulation
  isSimulationRunning = false;
  noLoop(); // Stop the draw loop
  // Note: Hamsters.js handles stopping by managing the threads internally
  displayResults();
}

function resetSimulation() {
  // Reset the global variables
  simulationTime = 0;
  fpsSum = 0;
  frameCount = 0;
  grid = new Uint8Array(cols * rows); // Reset the grid
  document.getElementsByClassName("results")[0].style.display = "none";

  // Get the selected starting weather condition from dropdown
  const startingWeather = parseInt(document.getElementById('startingWeather').value, 10);

  // Initialize grid with the selected starting weather condition
  for (let i = 0; i < grid.length; i++) {
    grid[i] = startingWeather;
  }
}

function setup() {

  const canvasEl = createCanvas(cols * cellSize, rows * cellSize); // Set canvas size to 400x400
  pixelDensity(1); // Ensure pixel density is 1 for consistency

  canvasEl.parent('hamstersCanvas'); // Attach the p5 canvas to the specific HTML canvas element

}

function draw() {
  if(!isSimulationRunning) {
    return;
  };

  if (simulationTime === maxTime) {
    stopSimulation(); // Stops the draw loop
    updateStats();
  } else {
    // Calculate and accumulate FPS
    const currentFPS = frameRate();
    fpsSum += currentFPS;
    frameCount++;

    if(simulationTime % 60 === 0) {
      updateStats();
    }

    displayGrid();

    // Refresh the params object with the latest grid values
    params.sharedArray = grid;
    // Run Hamsters.js to update the grid for this frame
    hamsters.promise(params, operator).then((results) => {
      grid = results;

      // Stop the simulation after a certain time
      simulationTime++;
    });
  }
}

function updateStats() {
  const elapsedTime = performance.now() - startTime;
  const averageFPS = frameCount > 0 ? fpsSum / frameCount : 0;

  // Display stats
  document.getElementById('stats').innerHTML = `
    <p>Average FPS: ${Math.round(averageFPS)}</p>
    <p>Total Frames: ${simulationTime}</p>
    <p>Total Elapsed Time: ${elapsedTime.toFixed(2)} ms</p>
  `;
}

function displayGrid() {
  for (let index = 0; index < grid.length; index++) {
    let state = Atomics.load(grid, index); // Use atomic load
    let i = index % cols; // Calculate the column
    let j = Math.floor(index / cols); // Calculate the row

    if (state === weatherConditions['sunny']) {
      fill(255, 255, 0); // Yellow for sunny
    } else if (state === weatherConditions['cloudy']) {
      fill(200, 200, 200); // Gray for cloudy
    } else if (state === weatherConditions['rainy']) {
      fill(0, 0, 255); // Blue for rainy
    } else if (state === weatherConditions['stormy']) {
      fill(100, 100, 100); // Dark gray for stormy
    } else if (state === weatherConditions['foggy']) {
      fill(200, 200, 255, 150); // Light blue for foggy
    } else if (state === weatherConditions['snowy']) {
      fill(255, 255, 255); // White for snowy
    }

    rect(i * cellSize, j * cellSize, cellSize, cellSize);
  }
}


function displayResults() {
  // Count the occurrences of each weather condition
  let counts = {
    'sunny': 0,
    'cloudy': 0,
    'rainy': 0,
    'stormy': 0,
    'foggy': 0,
    'snowy': 0
  };

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = i + j * cols;
      let state = Atomics.load(grid, index); // Use atomic load
      if (state === weatherConditions['sunny']) counts['sunny']++;
      else if (state === weatherConditions['cloudy']) counts['cloudy']++;
      else if (state === weatherConditions['rainy']) counts['rainy']++;
      else if (state === weatherConditions['stormy']) counts['stormy']++;
      else if (state === weatherConditions['foggy']) counts['foggy']++;
      else if (state === weatherConditions['snowy']) counts['snowy']++;
    }
  }

  // Determine the most common weather condition
  let mostCommon = '';
  let maxCount = 0;
  for (let condition in counts) {
    if (counts[condition] > maxCount) {
      mostCommon = condition;
      maxCount = counts[condition];
    }
  }

  // Display results including average FPS
  const averageFPS = frameCount > 0 ? fpsSum / frameCount : 0;
  document.getElementById('simulationResults').innerHTML = `
    <p>Weather Occurances:</p>
    <p>Sunny: ${counts['sunny']}</p>
    <p>Cloudy: ${counts['cloudy']}</p>
    <p>Rainy: ${counts['rainy']}</p>
    <p>Stormy: ${counts['stormy']}</p>
    <p>Foggy: ${counts['foggy']}</p>
    <p>Snowy: ${counts['snowy']}</p>
    <p>Most Common Weather: ${mostCommon}</p>
    <p>Average FPS: ${Math.round(averageFPS)}</p>
  `;
  document.getElementsByClassName("results")[0].style.display = "block";

}

// Populate the dropdown with thread options
function populateThreadDropdown() {
  const dropdown = document.getElementById('threadCount');
  const maxThreads = hamsters.maxThreads;
  for (let i = 1; i <= maxThreads; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.text = `${i}`;
    dropdown.add(option);
  }
}

//Populate Client Info
hamstersBenchmark.clientInfo();


// Initialize the thread dropdown
populateThreadDropdown();
