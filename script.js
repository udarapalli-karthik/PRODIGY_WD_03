
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let gameMode = "PvP";
let scores = { X: 0, O: 0, Draw: 0 };

const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnIndicator = document.getElementById('turnIndicator');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const overlay = document.getElementById('overlay');
const resultMsg = document.getElementById('resultMsg');
const pvpModeBtn = document.getElementById('pvpMode');
const pveModeBtn = document.getElementById('pveMode');
const themeToggle = document.getElementById('themeToggle');
const particleContainer = document.getElementById('particleContainer');
const playerXNameElement = document.getElementById('playerXName');
const playerONameElement = document.getElementById('playerOName');


const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];


function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
        particleContainer.appendChild(particle);
    }
}


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);

    if (type === 'click') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start(); osc.stop(audioCtx.currentTime + 0.4);
    }
}

function updateScoreboard() {
    scoreXElement.textContent = scores.X.toString().padStart(2, '0');
    scoreOElement.textContent = scores.O.toString().padStart(2, '0');
    scoreDrawElement.textContent = scores.Draw.toString().padStart(2, '0');
    localStorage.setItem('cyber_tictactoe_scores', JSON.stringify(scores));
}

function getPlayerName(player) {
    if (player === "X") {
        return "KARTHIK";
    } else {
        return gameMode === "PvE" ? "SYSTEM" : "UDAY";
    }
}

function updatePlayerNames() {
    playerXNameElement.textContent = getPlayerName("X");
    playerONameElement.textContent = getPlayerName("O");
}

function initScores() {
    const saved = localStorage.getItem('cyber_tictactoe_scores');
    if (saved) { scores = JSON.parse(saved); updateScoreboard(); }
}


function handleCellClick(e) {
    const index = e.target.getAttribute('data-index');
    if (board[index] !== "" || !isGameActive) return;

    makeMove(index, currentPlayer);

    if (isGameActive && gameMode === "PvE" && currentPlayer === "O") {
        boardElement.style.pointerEvents = 'none';
        setTimeout(() => {
            computerMove();
            boardElement.style.pointerEvents = 'auto';
        }, 800);
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].innerText = player;
    cells[index].classList.add(player.toLowerCase(), 'filled');
    playSound('click');

    if (checkWin()) {
        endGame(false);
    } else if (board.every(c => c !== "")) {
        endGame(true);
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateTurnIndicator();
    }
}

function updateTurnIndicator() {
    const name = getPlayerName(currentPlayer);
    turnIndicator.innerText = `${name}-LINK STABLE`;
    turnIndicator.className = `score-tag ${currentPlayer.toLowerCase()}`;
}

function checkWin() {
    for (let combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            combo.forEach(i => cells[i].classList.add('winner'));
            return true;
        }
    }
    return false;
}

function endGame(draw) {
    isGameActive = false;
    if (draw) {
        scores.Draw++;
        resultMsg.innerHTML = "RESULT: DRAW";
    } else {
        scores[currentPlayer]++;
        const winnerName = getPlayerName(currentPlayer);
        const loser = currentPlayer === 'X' ? 'O' : 'X';
        const loserName = getPlayerName(loser);
        resultMsg.innerHTML = `WINNER: ${winnerName}<br><span style="font-size: 0.6em; opacity: 0.8">LOSER: ${loserName}</span>`;
        playSound('win');
    }
    updateScoreboard();
    setTimeout(() => overlay.classList.add('active'), 600);
}

function computerMove() {
    if (!isGameActive) return;
    let move = findBestMove("O") || findBestMove("X") || (board[4] === "" ? 4 : null);
    if (move === null) {
        const avail = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
        move = avail[Math.floor(Math.random() * avail.length)];
    }
    if (move !== null) makeMove(move, "O");
}

function findBestMove(player) {
    for (let combo of WINNING_COMBINATIONS) {
        const [a, b, c] = combo;
        const vals = [board[a], board[b], board[c]];
        if (vals.filter(v => v === player).length === 2 && vals.filter(v => v === "").length === 1) {
            return combo[vals.indexOf("")];
        }
    }
    return null;
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    overlay.classList.remove('active');
    updateTurnIndicator();
    cells.forEach(c => { c.innerText = ""; c.className = "cell"; });
}

cells.forEach(c => c.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

pvpModeBtn.addEventListener('click', () => {
    gameMode = "PvP";
    pvpModeBtn.classList.add('active'); pveModeBtn.classList.remove('active');
    updatePlayerNames();
    resetGame();
});

pveModeBtn.addEventListener('click', () => {
    gameMode = "PvE";
    pveModeBtn.classList.add('active'); pvpModeBtn.classList.remove('active');
    updatePlayerNames();
    resetGame();
});

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.innerText = theme === 'dark' ? '🌓' : '☀️';
});


createParticles();
initScores();
updatePlayerNames();
updateTurnIndicator();
