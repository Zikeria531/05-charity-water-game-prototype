// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Waterworks: Level 1. Everything resets when the player restarts.
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const feedback = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');
const releaseBtn = document.getElementById('releaseBtn');
const resetBtn = document.getElementById('resetBtn');
const switches = [1, 2, 3].map(n => document.getElementById(`switch${n}`));
const gateElements = [document.getElementById('gate1'), document.getElementById('gate2')];
const flow = document.getElementById('flow');
const reservoirWater = document.getElementById('reservoirWater');
const villageWater = document.getElementById('villageWater');
let gate1Open = false;
let gate2Open = false;
let powerReady = false; // The first switch prepares the gate system.
let gameStarted = false;
let gameOver = false;
let seconds = 60;
let score = 0;
let timerId = null;
let animationId = null;

function updateDisplay() {
  gateElements[0].classList.toggle('open', gate1Open);
  gateElements[1].classList.toggle('open', gate2Open);
  document.getElementById('status1').textContent = `Gate 1: ${gate1Open ? 'Open' : 'Closed'}`;
  document.getElementById('status2').textContent = `Gate 2: ${gate2Open ? 'Open' : 'Closed'}`;
  timerDisplay.textContent = seconds;
  scoreDisplay.textContent = score;
  releaseBtn.disabled = !gameStarted || gameOver;
  switches.forEach(button => button.disabled = !gameStarted || gameOver);
}

function finishGame(won, message) {
  gameOver = true;
  clearInterval(timerId);
  feedback.textContent = message;
  if (won) {
    score = 100 + seconds * 2;
    flow.classList.add('running');
    reservoirWater.style.height = '18%';
    animationId = setTimeout(() => villageWater.classList.add('full'), 2400);
  }
  updateDisplay();
}

function activateSwitch(index) {
  if (!gameStarted || gameOver) return;
  switches[index].classList.add('active');
  // The correct sequence is left -> middle -> right.
  // Pressing the middle switch closes Gate 1 while opening Gate 2.
  if (index === 0) {
    powerReady = true;
    gate1Open = true;
    feedback.textContent = 'A mechanism hums to life. Gate 1 opens!';
  } else if (index === 1) {
    if (!powerReady) {
      feedback.textContent = 'Nothing happens. This mechanism may need power first.';
    } else {
      gate1Open = false;
      gate2Open = true;
      feedback.textContent = 'Gate 2 opens, but Gate 1 closes!';
    }
  } else {
    if (powerReady && gate2Open) {
      gate1Open = true;
      feedback.textContent = 'Gate 1 reopens. Both gates are clear!';
    } else {
      feedback.textContent = 'The final mechanism is locked. Try the other switches.';
    }
  }
  updateDisplay();
}

function startGame() {
  if (gameStarted) return;
  gameStarted = true;
  startBtn.disabled = true;
  feedback.textContent = 'The clock is running! Click the switches in the environment.';
  updateDisplay();
  timerId = setInterval(() => {
    seconds--;
    if (seconds <= 0) {
      seconds = 0;
      finishGame(false, 'Time is up! Restart to try the puzzle again.');
    } else updateDisplay();
  }, 1000);
}

function resetGame() {
  clearInterval(timerId);
  clearTimeout(animationId);
  timerId = null;
  animationId = null;
  gate1Open = false;
  gate2Open = false;
  powerReady = false;
  gameStarted = false;
  gameOver = false;
  seconds = 60;
  score = 0;
  startBtn.disabled = false;
  switches.forEach(button => button.classList.remove('active'));
  flow.classList.remove('running');
  reservoirWater.style.height = '76%';
  villageWater.classList.remove('full');
  feedback.textContent = 'Press Start to begin. Then click the three switches in the scene.';
  updateDisplay();
}

switches.forEach((button, index) => button.addEventListener('click', () => activateSwitch(index)));
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
releaseBtn.addEventListener('click', () => {
  if (!gameStarted || gameOver) return;
  if (gate1Open && gate2Open) {
    finishGame(true, 'Success! Clean water is flowing to the village!');
  } else {
    finishGame(false, 'The water was blocked by a closed gate. Restart and try another sequence.');
  }
});
resetGame();

