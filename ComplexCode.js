/*
Filename: ComplexCode.js

Description: 
This code generates a maze using the Prim's algorithm and solves it using the A* algorithm. The maze is visualized using HTML5 canvas and the solution is displayed in real-time.

Instructions:
- Open index.html in a web browser to see the maze generation and solving in action.

*/

// Canvas setup
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Cell class
class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = [true, true, true, true]; // Top, Right, Bottom, Left
  }
}

// Maze class
class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];

    // Create cells
    for (let row = 0; row < this.rows; row++) {
      const rowCells = [];
      for (let col = 0; col < this.cols; col++) {
        rowCells.push(new Cell(row, col));
      }
      this.grid.push(rowCells);
    }

    // Set start and end points
    this.start = this.grid[0][0];
    this.end = this.grid[this.rows - 1][this.cols - 1];

    // Generate maze
    this.generateMaze();
  }

  generateMaze() {
    const stack = []; // Stack for backtracking

    // Start at the initial cell
    let currentCell = this.start;
    currentCell.visited = true;

    // Recursive function to build the maze
    const buildMaze = () => {
      const neighbors = this.getUnvisitedNeighbors(currentCell);

      if (neighbors.length > 0) {
        // Randomly pick a neighbor
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const randomNeighbor = neighbors[randomIndex];

        // Remove the wall between the current cell and the neighbor
        this.removeWall(currentCell, randomNeighbor);

        // Push current cell to the stack
        stack.push(currentCell);

        // Move to the neighbor
        currentCell = randomNeighbor;
        currentCell.visited = true;
      } else if (stack.length > 0) {
        // Backtrack if no unvisited neighbors
        currentCell = stack.pop();
      } else {
        // Finished generating maze
        return;
      }

      // Recursively continue building the maze
      requestAnimationFrame(buildMaze);
    };

    // Start building the maze
    requestAnimationFrame(buildMaze);
  }

  getUnvisitedNeighbors(cell) {
    const { row, col } = cell;
    const neighbors = [];

    // Check top neighbor
    if (row > 0 && !this.grid[row - 1][col].visited) {
      neighbors.push(this.grid[row - 1][col]);
    }

    // Check right neighbor
    if (col < this.cols - 1 && !this.grid[row][col + 1].visited) {
      neighbors.push(this.grid[row][col + 1]);
    }

    // Check bottom neighbor
    if (row < this.rows - 1 && !this.grid[row + 1][col].visited) {
      neighbors.push(this.grid[row + 1][col]);
    }

    // Check left neighbor
    if (col > 0 && !this.grid[row][col - 1].visited) {
      neighbors.push(this.grid[row][col - 1]);
    }

    return neighbors;
  }

  removeWall(cellA, cellB) {
    const rowDiff = cellA.row - cellB.row;
    const colDiff = cellA.col - cellB.col;

    if (rowDiff === 1) {
      // Remove bottom wall of cellA and top wall of cellB
      cellA.walls[2] = false;
      cellB.walls[0] = false;
    } else if (rowDiff === -1) {
      // Remove top wall of cellA and bottom wall of cellB
      cellA.walls[0] = false;
      cellB.walls[2] = false;
    } else if (colDiff === 1) {
      // Remove right wall of cellA and left wall of cellB
      cellA.walls[1] = false;
      cellB.walls[3] = false;
    } else if (colDiff === -1) {
      // Remove left wall of cellA and right wall of cellB
      cellA.walls[3] = false;
      cellB.walls[1] = false;
    }
  }
}

// A* algorithm class
class AStarSolver {
  constructor(maze) {
    this.maze = maze;
    this.openSet = [];
    this.closedSet = [];
    this.start = maze.start;
    this.end = maze.end;

    // Initialize open set with the start cell
    this.openSet.push(this.start);

    // Run A* algorithm
    this.solve();
  }

  solve() {
    const solveMaze = () => {
      if (this.openSet.length > 0) {
        // Get the cell with the lowest fScore from the open set
        let lowestIndex = 0;
        for (let i = 0; i < this.openSet.length; i++) {
          if (
            this.openSet[i].fScore < this.openSet[lowestIndex].fScore ||
            (this.openSet[i].fScore === this.openSet[lowestIndex].fScore &&
              this.openSet[i].hScore < this.openSet[lowestIndex].hScore)
          ) {
            lowestIndex = i;
          }
        }
        const currentCell = this.openSet[lowestIndex];

        // Check if the current cell is the end cell
        if (currentCell === this.end) {
          this.traceSolution();
          return;
        }

        // Move the current cell from the open set to the closed set
        this.openSet.splice(lowestIndex, 1);
        this.closedSet.push(currentCell);

        // Check neighbors
        const neighbors = this.maze.getUnvisitedNeighbors(currentCell);
        for (let i = 0; i < neighbors.length; i++) {
          const neighbor = neighbors[i];

          // Ignore neighbors that are in the closed set or walls
          if (
            this.closedSet.includes(neighbor) ||
            this.maze.hasWall(currentCell, neighbor)
          ) {
            continue;
          }

          // Calculate tentative gScore
          const tentativeGScore = currentCell.gScore + 1;

          // Check if the neighbor is already in the open set
          let neighborInOpenSet = false;
          for (let j = 0; j < this.openSet.length; j++) {
            if (this.openSet[j] === neighbor) {
              neighborInOpenSet = true;
              break;
            }
          }

          if (!neighborInOpenSet || tentativeGScore < neighbor.gScore) {
            // Update neighbor's gScore and hScore
            neighbor.gScore = tentativeGScore;
            neighbor.hScore = this.calculateHeuristic(neighbor, this.end);
            neighbor.parent = currentCell;

            if (!neighborInOpenSet) {
              // Add neighbor to the open set
              this.openSet.push(neighbor);
            }
          }
        }

        // Continue solving
        requestAnimationFrame(solveMaze);
      }
    };

    // Start solving the maze
    requestAnimationFrame(solveMaze);
  }

  calculateHeuristic(cellA, cellB) {
    const rowDiff = Math.abs(cellA.row - cellB.row);
    const colDiff = Math.abs(cellA.col - cellB.col);
    return rowDiff + colDiff;
  }

  traceSolution() {
    let currentCell = this.end;

    while (currentCell !== this.start) {
      currentCell.solution = true;
      currentCell = currentCell.parent;
    }

    // Display the solution
    this.maze.display();
  }
}

// Maze visualization
Maze.prototype.display = function () {
  const cellSize = Math.min(canvasWidth / this.cols, canvasHeight / this.rows);
  const halfCellSize = cellSize / 2;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  for (let row = 0; row < this.rows; row++) {
    for (let col = 0; col < this.cols; col++) {
      const cell = this.grid[row][col];

      const x = col * cellSize;
      const y = row * cellSize;

      // Draw walls
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      if (cell.walls[0]) ctx.moveTo(x, y); // Top
      ctx.lineTo(x + cellSize, y); // Right
      if (cell.walls[1]) ctx.moveTo(x + cellSize, y); // Right
      ctx.lineTo(x + cellSize, y + cellSize); // Bottom
      if (cell.walls[2]) ctx.moveTo(x + cellSize, y + cellSize); // Bottom
      ctx.lineTo(x, y + cellSize); // Left
      if (cell.walls[3]) ctx.moveTo(x, y + cellSize); // Left
      ctx.lineTo(x, y); // Top
      ctx.stroke();

      // Fill start and end cells
      if (cell === this.start || cell === this.end) {
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      // Fill solution cells
      if (cell.solution) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(x + halfCellSize * 0.2, y + halfCellSize * 0.2, halfCellSize * 0.6, halfCellSize * 0.6);
      }
    }
  }
};

// Create maze and solve it
const maze = new Maze(40, 40);
const solver = new AStarSolver(maze);