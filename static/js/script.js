let word = "";
let guessedLetters = [];
let attemptsLeft = 6;
let hangmanPartsDrawn = 0; // Track the number of parts drawn

// Drawing the base and the pole
function drawHangmanBase() {
  const canvas = document.getElementById("hangman-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

  // Adjusted base position
  const baseY = 270; // Y position of the base

  // Base
  ctx.beginPath();
  ctx.moveTo(40, baseY);
  ctx.lineTo(260, baseY);
  ctx.lineWidth = 3;
  ctx.stroke();

  // Vertical Pole
  ctx.beginPath();
  ctx.moveTo(50, baseY);
  ctx.lineTo(50, 40); // Adjust height for vertical pole
  ctx.stroke();

  //Supporting Diagonal Brace
  ctx.beginPath();
  ctx.moveTo(50, 100);
  ctx.lineTo(100, 40);
  ctx.stroke();

  // Horizontal Beam
  ctx.beginPath();
  ctx.moveTo(48.5, 40);
  ctx.lineTo(152, 40); // Adjust for beam length
  ctx.stroke();

  // Rope
  ctx.beginPath();
  ctx.moveTo(150, 40);
  ctx.lineTo(150, 70); // Adjust rope length
  ctx.stroke();
}

// Function to draw each part of the hangman
function drawNextHangmanPart() {
  const canvas = document.getElementById("hangman-canvas");
  const ctx = canvas.getContext("2d");

  const parts = [
    // Head
    () => {
      ctx.beginPath();
      ctx.arc(150, 90, 20, 0, Math.PI * 2); // Center head at 150,90
      ctx.lineWidth = 3;
      ctx.stroke();
    },
    // Body
    () => {
      ctx.beginPath();
      ctx.moveTo(150, 110); // Move body lower
      ctx.lineTo(150, 160);
      ctx.stroke();
    },
    // Left Arm
    () => {
      ctx.beginPath();
      ctx.moveTo(150, 120); // Adjust arm start position
      ctx.lineTo(130, 160); // Adjust arm angle and length
      ctx.stroke();
    },
    // Right Arm
    () => {
      ctx.beginPath();
      ctx.moveTo(150, 120); // Adjust arm start position
      ctx.lineTo(170, 160); // Adjust arm angle and length
      ctx.stroke();
    },
    // Left Leg
    () => {
      ctx.beginPath();
      ctx.moveTo(150, 160);
      ctx.lineTo(130, 220);
      ctx.stroke();
    },
    // Right Leg
    () => {
      ctx.beginPath();
      ctx.moveTo(150, 160);
      ctx.lineTo(170, 220);
      ctx.stroke();
    },
  ];

  if (hangmanPartsDrawn < parts.length) {
    parts[hangmanPartsDrawn]();
    hangmanPartsDrawn++;
  }
}

async function startGame() {
  const response = await fetch("/start_game");
  const data = await response.json();
  word = data.word;
  document.getElementById("hidden-word").textContent = data.hidden_word;
  document.getElementById("attempts-left").textContent = data.attempts_left;

  guessedLetters = [];
  attemptsLeft = 6;
  hangmanPartsDrawn = 0;

  document.getElementById("letters").innerHTML = "";
  document.getElementById("message").textContent = "";
  document.getElementById("error-message").textContent = "";
  drawHangmanBase();

  const guessInput = document.getElementById("guess");

  guessInput.removeEventListener("keydown", handleKeydown);
  guessInput.addEventListener("keydown", handleKeydown);
}

function handleKeydown(event) {
  if (event.key === "Enter") {
    makeGuess();
  }
}

async function makeGuess() {
  const guessInput = document.getElementById("guess");
  const guess = guessInput.value.toLowerCase();

  if (attemptsLeft <= 0) {
    document.getElementById("error-message").textContent =
      "No attempts left! Game over.";
    return;
  }

  if (!guess) return;

  if (guessedLetters.includes(guess)) {
    document.getElementById(
      "error-message"
    ).textContent = `Letter " ${guess} " already used!`;
    guessInput.value = "";
    guessInput.focus(); // Refocus the input field
    return;
  }

  const response = await fetch("/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      word,
      guessed_letters: guessedLetters,
      guess,
      attempts_left: attemptsLeft,
    }),
  });

  const data = await response.json();

  if (data.error) {
    document.getElementById("error-message").textContent = data.error;
  } else {
    document.getElementById("error-message").textContent = "";
    document.getElementById("hidden-word").textContent = data.hidden_word;
    document.getElementById("attempts-left").textContent = data.attempts_left;
    attemptsLeft = data.attempts_left;
    guessedLetters.push(guess);

    const letterElement = document.createElement("div");
    letterElement.textContent = guess;
    letterElement.classList.add("letter");
    if (word.includes(guess)) {
      letterElement.classList.add("correct");
    } else {
      letterElement.classList.add("incorrect");
      drawNextHangmanPart();
    }
    document.getElementById("letters").appendChild(letterElement);

    if (data.game_over) {
      if (data.hidden_word.includes("_")) {
        document.getElementById(
          "message"
        ).textContent = `You lost! The word was: ${data.word}`;
      } else {
        document.getElementById("message").textContent =
          "Congratulations! You guessed the word!";
      }
    }
  }

  guessInput.value = "";
  guessInput.focus(); // Refocus the input field
}

startGame();
