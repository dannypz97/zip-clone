/**
 * Zip Game – Level Data
 *
 * Each level defines:
 *   id        – level number
 *   name      – display name
 *   gridSize  – always 5 for now
 *   numbers   – "row,col" → sequential waypoint label (1, 2, 3, …)
 *               The path must visit ALL 25 cells and pass through waypoints in order.
 *   solution  – one valid Hamiltonian path (for future hints)
 *
 * Constraints:
 *   - All 25 cells must be covered
 *   - No two fixed waypoints are adjacent (including diagonals; Chebyshev ≥ 2)
 *   - Waypoints are labeled sequentially: 1, 2, 3, …
 *   - 1 is the start, highest number is the end
 *   - Between waypoints the player is free to choose any route
 */

const LEVELS = [
    {
        id: 1,
        name: "First Steps",
        gridSize: 5,
        numbers: {
            "0,0": 1,   // start
            "2,2": 2,
            "4,0": 3,
            "4,4": 4,   // end
        },
        solution: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
            [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
            [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
            [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
        ],
    },
    {
        id: 2,
        name: "Winding Road",
        gridSize: 5,
        numbers: {
            "0,0": 1,   // start
            "4,0": 2,
            "0,2": 3,
            "4,2": 4,
            "0,4": 5,   // end
        },
        solution: [
            [0, 0], [1, 0], [2, 0], [3, 0], [4, 0],
            [4, 1], [3, 1], [2, 1], [1, 1], [0, 1],
            [0, 2], [1, 2], [2, 2], [3, 2], [4, 2],
            [4, 3], [3, 3], [2, 3], [1, 3], [0, 3],
            [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
        ],
    },
    {
        id: 3,
        name: "Spiral",
        gridSize: 5,
        numbers: {
            "0,0": 1,   // start
            "2,4": 2,
            "4,2": 3,
            "2,0": 4,
            "2,2": 5,   // end
        },
        solution: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 4], [2, 4], [3, 4], [4, 4], [4, 3],
            [4, 2], [4, 1], [4, 0], [3, 0], [2, 0],
            [1, 0], [1, 1], [1, 2], [1, 3], [2, 3],
            [3, 3], [3, 2], [3, 1], [2, 1], [2, 2],
        ],
    },
];
