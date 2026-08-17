const questionText = document.getElementById("question-text");
const answerOptions = document.getElementById("answer-options");
const feedback = document.getElementById("feedback");

let currentAnswer = null;

function generateQuestion() {
  // Temporary: only simple mod questions
  const modulus = Math.floor(Math.random() * 5) + 2; // 2 to 6
  const number = Math.floor(Math.random() * 20) + 1;

  currentAnswer = number % modulus;

  questionText.textContent = `${number} mod ${modulus} = ?`;

  // Generate answer options (0 to modulus-1)
  const options = [];
  for (let i = 0; i < modulus; i++) {
    options.push(i);
  }

  answerOptions.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(option));
    answerOptions.appendChild(button);
  });

  feedback.textContent = "";
}

function checkAnswer(selected) {
  if (selected === currentAnswer) {
    feedback.textContent = "Correct!";
    feedback.style.color = "#a6e3a1";
  } else {
    feedback.textContent = `Wrong. Answer was ${currentAnswer}`;
    feedback.style.color = "#f38ba8";
  }

  // Wait a moment, then new question
  setTimeout(generateQuestion, 1000);
}

generateQuestion();
