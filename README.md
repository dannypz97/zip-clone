# Zip Clone

A browser-based clone of the **Zip** path puzzle game, built with vanilla HTML, CSS, and JavaScript.

## How to Play

1. Open `index.html` in a browser (or serve it locally with `python3 -m http.server`).
2. **Drag** from the start cell (labeled **1**) and draw a path through adjacent cells.
3. Visit all numbered waypoints **in order** (1 → 2 → 3 → …).
4. Cover **every cell** on the 5×5 grid and end on the final waypoint to win.
5. Drag backward to undo, or use the **Undo** / **Reset** buttons.

Between waypoints you're free to choose any route — there are multiple valid solutions per level.

## Levels

| Level | Name         | Waypoints |
|-------|--------------|-----------|
| 1     | First Steps  | 4         |
| 2     | Winding Road | 5         |
| 3     | Spiral       | 5         |

## Tech Stack

- **HTML** — structure
- **CSS** — dark glassmorphism theme with Inter font
- **JavaScript** — game logic, drag-to-draw interaction, SVG path overlay