document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  const score = localStorage.getItem("quizScore");
  const totalQuestions = localStorage.getItem("totalQuestions");

  document.getElementById("score-value").textContent = score;
  document.getElementById("total-questions").textContent = totalQuestions;

  document.getElementById("play-again-button").addEventListener("click", () => {
    window.location.href = "./index.html";
  });
});

function getQuizQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("quiz");
}

async function fetchData() {
  try {
    const response = await fetch("/starter-code/data.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function fetchQuizData() {
  const quizQuery = getQuizQuery();
  const data = await fetchData();
  const quiz = data.quizzes.find((q) => q.title === quizQuery);
  if (quiz) {
    return quiz;
  } else {
    console.error("Quiz not found");
    return null;
  }
}

async function renderHeader() {
  const quiz = await fetchQuizData();
  if (!quiz) return;

  const header = document.querySelector("header div:first-child");
  header.innerHTML = "";
  const icon = document.createElement("img");
  icon.src = quiz.icon;
  icon.alt = quiz.title;
  header.appendChild(icon);
  const title = document.createElement("h1");
  title.textContent = quiz.title;
  header.appendChild(title);

  const scoreContainer = document.querySelector(
    ".score-container > div:first-child"
  );
  scoreContainer.innerHTML = "";
  const scoreIcon = document.createElement("img");
  scoreIcon.src = quiz.icon;
  scoreIcon.alt = quiz.title;
  const scoreTitle = document.createElement("h2");
  scoreTitle.textContent = quiz.title;

  scoreContainer.appendChild(scoreIcon);
  scoreContainer.appendChild(scoreTitle);
}
