/**
 * Zip Game – Level Data
 *
 * Each level defines:
 *   id        – level number
 *   name      – display name
 *   gridSize  – always 5 for now
 *   numbers   – "row,col" → sequential number (fixed waypoints, incrementally numbered)
 *   solution  – full path as [row,col] pairs
 *
 * Constraints:
 *   - No two fixed numbers are adjacent (including diagonals; Chebyshev distance ≥ 2)
 *   - Path length is less than 25 for simplicity
 *   - Fixed numbers are sequential: 1, 2, 3, …
 */

const LEVELS = [
    {
        id: 1,
        name: "First Steps",
        gridSize: 5,
        // Path length: 12
        numbers: {
            "0,0": 1,
            "2,1": 4,
            "0,2": 7,
            "2,3": 12,
        },
        solution: [
            [0, 0], [1, 0], [2, 0], [2, 1], [2, 2],
            [1, 2], [0, 2], [0, 3], [0, 4], [1, 4],
            [2, 4], [2, 3],
        ],
    },
    {
        id: 2,
        name: "Winding Road",
        gridSize: 5,
        // Path length: 15
        numbers: {
            "0,0": 1,
            "0,4": 5,
            "1,2": 8,
            "2,0": 11,
            "4,2": 15,
        },
        solution: [
            [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 4], [1, 3], [1, 2], [1, 1], [1, 0],
            [2, 0], [3, 0], [4, 0], [4, 1], [4, 2],
        ],
    },
    {
        id: 3,
        name: "Serpentine",
        gridSize: 5,
        // Path length: 18
        numbers: {
            "4,4": 1,
            "2,4": 3,
            "1,2": 9,
            "0,0": 13,
            "4,1": 18,
        },
        solution: [
            [4, 4], [3, 4], [2, 4], [2, 3], [3, 3],
            [4, 3], [4, 2], [3, 2], [2, 2], [1, 2],
            [0, 2], [0, 1], [0, 0], [1, 0], [2, 0],
            [2, 1], [3, 1], [4, 1],
        ],
    },
];
