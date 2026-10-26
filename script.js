// this logs a check in the browser console so we know the JS file is loading properly.
console.log('JavaScript file is linked correctly.');

// this grabs all the important elements from the page so the game logic can control them.
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

// Create game state variables that track whether the gates are open and whether the game is running.
let gate1Open = false;
let gate2Open = false;
let powerReady = false; // this tracks whether the first switch has powered the machine.
let gameStarted = false;
let gameOver = false;
let seconds = 60;
let score = 0;
let timerId = null;
let animationId = null;

// this updates the UI in a more step-by-step way so it's easier to understand what is changing.
function updateDisplay() {
  // first, update the gate visuals
  if (gate1Open) {
    gateElements[0].classList.add('open');
  } else {
    gateElements[0].classList.remove('open');
  }

  if (gate2Open) {
    gateElements[1].classList.add('open');
  } else {
    gateElements[1].classList.remove('open');
  }

  // then update the text that says whether each gate is open or closed
  const gate1Status = document.getElementById('status1');
  const gate2Status = document.getElementById('status2');

  if (gate1Open) {
    gate1Status.textContent = 'Gate 1: Open';
  } else {
    gate1Status.textContent = 'Gate 1: Closed';
  }

  if (gate2Open) {
    gate2Status.textContent = 'Gate 2: Open';
  } else {
    gate2Status.textContent = 'Gate 2: Closed';
  }

  // then update the score and timer numbers
  timerDisplay.textContent = seconds;
  scoreDisplay.textContent = score;

  // then decide if the release button should be usable
  if (gameStarted && !gameOver) {
    releaseBtn.disabled = false;
  } else {
    releaseBtn.disabled = true;
  }

  // then decide if the switch buttons should be usable
  for (let i = 0; i < switches.length; i++) {
    if (gameStarted && !gameOver) {
      switches[i].disabled = false;
    } else {
      switches[i].disabled = true;
    }
  }
}

// Create a function that ends the round and shows either a win or lose message depending on the results or what happened.
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

// this handles clicking each switch and changes the gates based on the sequence of presses.
function activateSwitch(index) {
  if (!gameStarted || gameOver) return;
  switches[index].classList.add('active');
  // the correct sequence is left -> middle -> right, so the puzzle follows that order.
  // when the middle switch is pressed, it closes gate 1 and opens gate 2.
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

// this starts the timer and sets the game into play mode.
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

// this resets everything back to the starting state so the player can try again.
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

// this connects each switch button to the correct function when the player clicks it.
switches.forEach((button, index) => button.addEventListener('click', () => activateSwitch(index)));
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// this checks whether both gates are open before letting the player release the water.
releaseBtn.addEventListener('click', () => {
  if (!gameStarted || gameOver) return;
  if (gate1Open && gate2Open) {
    finishGame(true, 'Success! Clean water is flowing to the village!');
  } else {
    finishGame(false, 'The water was blocked by a closed gate. Restart and try another sequence.');
  }
});

// this runs once at the start so the game begins in a clean reset state.
resetGame();

