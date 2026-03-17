/**
 * Zip Game Clone – Core Game Logic
 * Drag-to-draw interaction · Circle nodes on thick lines
 */

(function () {
    "use strict";

    /* ── State ────────────────────────────────────────── */
    let currentLevel = null;
    let path = [];           // array of "row,col" strings
    let fixedNumbers = {};   // "row,col" → number
    let startKey = "";
    let endKey = "";
    let totalCells = 0;      // path length for current level
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

    function cellElement(k) {
        const [r, c] = parseKey(k);
        return gridEl.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
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

                // --- Drag events (pointer) ---
                cell.addEventListener("pointerdown", (e) => onPointerDown(e, k));
                cell.addEventListener("pointerenter", () => onPointerEnter(k));
                cell.addEventListener("pointerup", () => onPointerUp());

                gridEl.appendChild(cell);
            }
        }

        // Capture pointerup even outside cells
        document.addEventListener("pointerup", onPointerUp);
    }

    /* ── Pointer / Drag Handlers ──────────────────────── */
    function onPointerDown(e, k) {
        if (isWon) return;
        e.preventDefault();

        // If path is empty, only start cell can begin
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

        // Clicking a cell on the path → trim path back to that cell
        const idx = path.indexOf(k);
        if (idx !== -1) {
            path = path.slice(0, idx + 1);
            isDragging = true;
            updateUI();
            return;
        }

        // Clicking adjacent valid cell → extend and start dragging
        if (areAdjacent(head, k) && !path.includes(k) && isValidMove(k)) {
            path.push(k);
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

        // Backtrack: if entering the cell before head, undo head
        if (path.length >= 2 && k === path[path.length - 2]) {
            path.pop();
            updateUI();
            return;
        }

        // Extend path
        if (areAdjacent(head, k) && !path.includes(k) && isValidMove(k)) {
            path.push(k);
            updateUI();
            checkWin();
        }
    }

    function onPointerUp() {
        isDragging = false;
    }

    /* ── Move Validation ──────────────────────────────── */
    function isValidMove(k) {
        const nextIndex = path.length; // 0-indexed position for the new cell

        // If the target cell has a fixed number, it must match nextIndex + 1
        if (fixedNumbers[k] !== undefined) {
            if (fixedNumbers[k] !== nextIndex + 1) return false;
        }

        // Check: is there a fixed number that must appear at position nextIndex+1?
        const requiredNumber = nextIndex + 1;
        const requiredKey = Object.keys(fixedNumbers).find(
            (fk) => fixedNumbers[fk] === requiredNumber
        );
        if (requiredKey && requiredKey !== k) return false;

        return true;
    }

    /* ── Update UI ────────────────────────────────────── */
    function updateUI() {
        // Update cell classes
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

        // Draw circle nodes (skip fixed cells — their number label is sufficient)
        for (let i = 0; i < coords.length; i++) {
            const k = path[i];
            if (fixedNumbers[k] !== undefined) continue; // fixed cell keeps its number

            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", coords[i].x);
            circle.setAttribute("cy", coords[i].y);
            circle.setAttribute("r", 12);
            if (i === coords.length - 1) circle.classList.add("head-node");
            pathSvg.appendChild(circle);
        }

        // If head is a fixed cell, add a subtle ring around it
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

        isWon = true;
        statusEl.textContent = "🎉 Level Complete!";
        statusEl.className = "status-bar win";
        launchConfetti();
    }

    /* ── Controls ─────────────────────────────────────── */
    window.undoMove = function () {
        if (isWon || path.length <= 1) return;
        path.pop();
        updateUI();
    };

    window.resetPath = function () {
        if (isWon) isWon = false;
        path = [startKey];
        updateUI();
    };

    /* ── Level Loading ────────────────────────────────── */
    window.loadLevel = function (id) {
        const level = LEVELS.find((l) => l.id === id);
        if (!level) return;
        currentLevel = level;
        fixedNumbers = { ...level.numbers };
        totalCells = level.solution.length;
        isWon = false;
        isDragging = false;
        path = [];

        // Find start (min number) and end (max number)
        let minNum = Infinity, maxNum = -Infinity;
        for (const [k, num] of Object.entries(fixedNumbers)) {
            if (num < minNum) { minNum = num; startKey = k; }
            if (num > maxNum) { maxNum = num; endKey = k; }
        }

        // Update level buttons
        document.querySelectorAll(".level-btn").forEach((btn) => {
            btn.classList.toggle("active", +btn.dataset.level === id);
        });

        // Update total display
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
