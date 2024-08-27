const canvas = document.getElementById('tetris-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Ensure BLOCK_SIZE is set correctly
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

// Colors for tetrominoes
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// Tetromino shapes
const SHAPES = [
    [],
    [[1, 1, 1, 1]],                 // I
    [[2, 0, 0], [2, 2, 2]],         // J
    [[0, 0, 3], [3, 3, 3]],         // L
    [[4, 4], [4, 4]],               // O
    [[0, 5, 5], [5, 5, 0]],         // S
    [[6, 6, 6], [0, 6, 0]],         // T
    [[7, 7, 0], [0, 7, 7]]          // Z
];

// Fill cell with color
function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Class to handle the game state
class Tetris {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.getEmptyGrid();
        this.reset();
    }

    reset() {
        this.grid = this.getEmptyGrid();
        this.activeTetromino = this.createTetromino();
        this.nextTetromino = this.createTetromino();
        this.draw();
    }

    getEmptyGrid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    createTetromino() {
        const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
        const shape = SHAPES[typeId];
        return {
            x: Math.floor((COLS - shape[0].length) / 2),
            y: 0,
            shape,
            color: COLORS[typeId],
            rotation: 0
        };
    }

    rotateTetromino() {
        const tetromino = JSON.parse(JSON.stringify(this.activeTetromino)); // Deep clone the tetromino
        tetromino.shape = this.rotateShape(tetromino.shape);
        if (!this.isCollision(tetromino)) {
            this.activeTetromino.shape = tetromino.shape;
            this.activeTetromino.rotation = (this.activeTetromino.rotation + 1) % 4;
        }
    }

    rotateShape(shape) {
        const N = shape.length;
        const M = shape[0].length;
        const rotatedShape = Array.from({ length: M }, () => Array(N).fill(0));
        for (let i = 0; i < N; ++i) {
            for (let j = 0; j < M; ++j) {
                rotatedShape[j][N - i - 1] = shape[i][j];
            }
        }
        return rotatedShape;
    }

    drawGrid() {
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= COLS; x++) {
            this.ctx.moveTo(x * BLOCK_SIZE, 0);
            this.ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        }
        for (let y = 0; y <= ROWS; y++) {
            this.ctx.moveTo(0, y * BLOCK_SIZE);
            this.ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        }
        this.ctx.stroke();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background with black
        this.drawGrid();
        this.drawTetromino(this.activeTetromino);
    }

    drawTetromino(tetromino) {
        tetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    drawCell(tetromino.x + x, tetromino.y + y, tetromino.color);
                }
            });
        });
    }

    moveTetromino(offset) {
        this.activeTetromino.x += offset;
        if (this.isCollision()) {
            this.activeTetromino.x -= offset;
        }
    }

    dropTetromino() {
        this.activeTetromino.y += 1;
        if (this.isCollision()) {
            this.activeTetromino.y -= 1;
            this.mergeTetromino();
            this.activeTetromino = this.nextTetromino;
            this.nextTetromino = this.createTetromino();
        }
    }    

    isCollision(tetromino = null) {
        const { shape, x, y, rotation } = tetromino || this.activeTetromino;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] > 0) {
                    const newX = x + col;
                    const newY = y + row;
                    if (
                        newX < 0 ||
                        newX >= COLS ||
                        newY >= ROWS ||
                        this.grid[newY] && this.grid[newY][newX] !== 0
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    mergeTetromino() {
        this.activeTetromino.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.grid[this.activeTetromino.y + y][this.activeTetromino.x + x] = value;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = ROWS - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(COLS).fill(0));
                linesCleared++;
            }
        }
        return linesCleared;
    }
}


// Initialize the game
function initGame() {
    const tetris = new Tetris(ctx);
    tetris.draw();

    document.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') {
            tetris.moveTetromino(-1);
        } else if (event.key === 'ArrowRight') {
            tetris.moveTetromino(1);
        } else if (event.key === ' ') {
            tetris.dropTetromino();
        } else if (event.key === 'ArrowUp') {
            tetris.rotateTetromino();
        }
        tetris.draw();
    });
    

    setInterval(() => {
        tetris.dropTetromino();
        tetris.draw();
    }, 1000);
}

initGame();
