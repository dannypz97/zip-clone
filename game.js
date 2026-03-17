/**
 * Zip Game Clone – Core Game Logic
 * Drag-to-draw · Free-form routing between sequential waypoints
 * Circle nodes on thick lines · All 25 cells must be covered
 */

(function () {
    "use strict";

    /* ── State ────────────────────────────────────────── */
    let currentLevel = null;
    let path = [];           // "row,col" strings in visit order
    let fixedNumbers = {};   // "row,col" → sequential label (1, 2, 3 …)
    let startKey = "";
    let endKey = "";
    let totalCells = 25;
    let maxWaypoint = 0;     // highest numbered waypoint
    let nextWaypoint = 2;    // next waypoint the path must reach (1 is start)
    let isWon = false;
    let isDragging = false;

    /* ── DOM refs ─────────────────────────────────────── */
    const gridEl = document.getElementById("grid");
    const statusEl = document.getElementById("status");
    const pathSvg = document.getElementById("path-svg");
    const confettiCanvas = document.getElementById("confetti-canvas");
    const moveCountEl = document.getElementById("move-count");
    const moveTotalEl = document.getElementById("move-total");

    /* ── Helpers ──────────────────────────────────────── */
    const key = (r, c) => `${r},${c}`;
    const parseKey = (k) => k.split(",").map(Number);

    function areAdjacent(k1, k2) {
        const [r1, c1] = parseKey(k1);
        const [r2, c2] = parseKey(k2);
        return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    }

    /* ── Grid Rendering ───────────────────────────────── */
    function renderGrid() {
        gridEl.innerHTML = "";
        pathSvg.innerHTML = "";
        const size = currentLevel.gridSize;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.dataset.row = r;
                cell.dataset.col = c;
                const k = key(r, c);

                if (fixedNumbers[k] !== undefined) {
                    cell.classList.add("fixed");
                    cell.textContent = fixedNumbers[k];
                }

                // Pointer events for drag-to-draw
                cell.addEventListener("pointerdown", (e) => onPointerDown(e, k));
                cell.addEventListener("pointerenter", () => onPointerEnter(k));
                cell.addEventListener("pointerup", () => onPointerUp());

                gridEl.appendChild(cell);
            }
        }

        document.addEventListener("pointerup", onPointerUp);
    }

    /* ── Pointer / Drag Handlers ──────────────────────── */
    function onPointerDown(e, k) {
        if (isWon) return;
        e.preventDefault();

        // Start fresh from start cell
        if (path.length === 0) {
            if (k !== startKey) return;
            path.push(k);
            isDragging = true;
            updateUI();
            return;
        }

        const head = path[path.length - 1];

        // Clicking the head → begin dragging from current position
        if (k === head) {
            isDragging = true;
            return;
        }

        // Clicking a cell already on the path → trim back to that cell
        const idx = path.indexOf(k);
        if (idx !== -1) {
            trimPathTo(idx);
            isDragging = true;
            updateUI();
            return;
        }

        // Clicking adjacent valid cell → extend and start dragging
        if (areAdjacent(head, k) && !path.includes(k) && isValidMove(k)) {
            addToPath(k);
            isDragging = true;
            updateUI();
            checkWin();
            return;
        }
    }

    function onPointerEnter(k) {
        if (!isDragging || isWon) return;
        if (path.length === 0) return;

        const head = path[path.length - 1];

        // Backtrack: entering the cell before head undoes the head
        if (path.length >= 2 && k === path[path.length - 2]) {
            removeFromPath();
            updateUI();
            return;
        }

        // Extend path
        if (areAdjacent(head, k) && !path.includes(k) && isValidMove(k)) {
            addToPath(k);
            updateUI();
            checkWin();
        }
    }

    function onPointerUp() {
        isDragging = false;
    }

    /* ── Path Mutation (tracks nextWaypoint) ──────────── */
    function addToPath(k) {
        path.push(k);
        if (fixedNumbers[k] !== undefined && fixedNumbers[k] === nextWaypoint) {
            nextWaypoint++;
        }
    }

    function removeFromPath() {
        const removed = path.pop();
        if (fixedNumbers[removed] !== undefined && fixedNumbers[removed] === nextWaypoint - 1) {
            nextWaypoint--;
        }
    }

    function trimPathTo(idx) {
        // Remove cells from the end back to idx (exclusive)
        while (path.length > idx + 1) {
            removeFromPath();
        }
    }

    /* ── Move Validation ──────────────────────────────── */
    function isValidMove(k) {
        // If the target cell is a fixed waypoint…
        if (fixedNumbers[k] !== undefined) {
            // You can ONLY step on the NEXT required waypoint
            if (fixedNumbers[k] !== nextWaypoint) return false;
        }
        return true;
    }

    /* ── Update UI ────────────────────────────────────── */
    function updateUI() {
        const cells = gridEl.querySelectorAll(".cell");
        cells.forEach((cell) => {
            const r = +cell.dataset.row;
            const c = +cell.dataset.col;
            const k = key(r, c);
            cell.classList.remove("on-path");
            if (path.includes(k)) {
                cell.classList.add("on-path");
            }
        });

        drawPathOverlay();
        moveCountEl.textContent = path.length;

        if (!isWon) {
            if (path.length === 0) {
                statusEl.textContent = "Drag from the start number to begin";
                statusEl.className = "status-bar";
            } else {
                statusEl.textContent = `${path.length} / ${totalCells} cells`;
                statusEl.className = "status-bar";
            }
        }
    }

    /* ── Draw SVG Overlay: Lines + Circle Nodes ───────── */
    function drawPathOverlay() {
        pathSvg.innerHTML = "";
        if (path.length === 0) return;

        const cellFull = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--cell-size")
        );
        const gap = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--cell-gap")
        );
        const step = cellFull + gap;
        const half = cellFull / 2;

        const coords = path.map((k) => {
            const [r, c] = parseKey(k);
            return { x: c * step + half, y: r * step + half };
        });

        // Draw lines
        for (let i = 0; i < coords.length - 1; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", coords[i].x);
            line.setAttribute("y1", coords[i].y);
            line.setAttribute("x2", coords[i + 1].x);
            line.setAttribute("y2", coords[i + 1].y);
            pathSvg.appendChild(line);
        }

        // Draw circle nodes — skip fixed cells (they already show their number)
        for (let i = 0; i < coords.length; i++) {
            const k = path[i];
            if (fixedNumbers[k] !== undefined) continue;

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", coords[i].x);
            circle.setAttribute("cy", coords[i].y);
            circle.setAttribute("r", 12);
            if (i === coords.length - 1) circle.classList.add("head-node");
            pathSvg.appendChild(circle);
        }

        // If head is a fixed cell, draw a subtle ring
        const lastK = path[path.length - 1];
        if (fixedNumbers[lastK] !== undefined) {
            const lastCoord = coords[coords.length - 1];
            const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ring.setAttribute("cx", lastCoord.x);
            ring.setAttribute("cy", lastCoord.y);
            ring.setAttribute("r", 18);
            ring.setAttribute("fill", "none");
            ring.setAttribute("stroke", "#fff");
            ring.setAttribute("stroke-width", "2.5");
            ring.setAttribute("opacity", "0.6");
            pathSvg.appendChild(ring);
        }
    }

    /* ── Win Check ────────────────────────────────────── */
    function checkWin() {
        if (path.length !== totalCells) return;
        if (path[path.length - 1] !== endKey) return;
        // Verify all waypoints were visited
        if (nextWaypoint !== maxWaypoint + 1) return;

        isWon = true;
        statusEl.textContent = "🎉 Level Complete!";
        statusEl.className = "status-bar win";
        launchConfetti();
    }

    /* ── Controls ─────────────────────────────────────── */
    window.undoMove = function () {
        if (isWon || path.length <= 1) return;
        removeFromPath();
        updateUI();
    };

    window.resetPath = function () {
        isWon = false;
        path = [startKey];
        nextWaypoint = 2;
        updateUI();
    };

    /* ── Level Loading ────────────────────────────────── */
    window.loadLevel = function (id) {
        const level = LEVELS.find((l) => l.id === id);
        if (!level) return;
        currentLevel = level;
        fixedNumbers = { ...level.numbers };
        totalCells = level.gridSize * level.gridSize;
        isWon = false;
        isDragging = false;
        path = [];
        nextWaypoint = 2;

        // Find start (label 1) and end (highest label)
        maxWaypoint = 0;
        for (const [k, num] of Object.entries(fixedNumbers)) {
            if (num === 1) startKey = k;
            if (num > maxWaypoint) { maxWaypoint = num; endKey = k; }
        }

        // Update level buttons
        document.querySelectorAll(".level-btn").forEach((btn) => {
            btn.classList.toggle("active", +btn.dataset.level === id);
        });

        moveTotalEl.textContent = totalCells;

        renderGrid();
        updateUI();
    };

    /* ── Confetti ─────────────────────────────────────── */
    function launchConfetti() {
        const ctx = confettiCanvas.getContext("2d");
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;

        const pieces = Array.from({ length: 120 }, () => ({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            r: Math.random() * 6 + 3,
            color: ["#7c5cfc", "#a78bfa", "#4cd964", "#ff3b5c", "#00c8ff", "#fff"][
                Math.floor(Math.random() * 6)
            ],
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            spin: Math.random() * 0.2 - 0.1,
            angle: Math.random() * Math.PI * 2,
        }));

        let frame = 0;
        const maxFrames = 180;

        function draw() {
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
            for (const p of pieces) {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 1 - frame / maxFrames;
                ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
                ctx.restore();
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.spin;
                p.vy += 0.05;
            }
            frame++;
            if (frame < maxFrames) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
        requestAnimationFrame(draw);
    }

    /* ── Init ─────────────────────────────────────────── */
    loadLevel(1);
})();
