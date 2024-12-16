async function fetchData() {
  try {
    const response = await fetch("/starter-code/data.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function createQuizzesArray() {
  const data = await fetchData();
  if (!data || !data.quizzes) return [];
  return data.quizzes.map((quiz) => ({
    title: quiz.title,
    icon: quiz.icon,
  }));
}

async function populateQuizButtons() {
  const quizButtonsContainer = document.getElementById(
    "quiz-buttons-container"
  );
  const quizzesArray = await createQuizzesArray();
  quizzesArray.forEach(({ title, icon }) => {
    const listItem = document.createElement("li");
    const button = document.createElement("button");
    const iconImg = document.createElement("img");
    iconImg.src = icon;
    iconImg.alt = `${title} Icon`;
    iconImg.classList.add("quiz-icon");
    button.textContent = title;
    button.prepend(iconImg);
    button.classList.add("quiz-button");
    button.addEventListener("click", () => handleQuizSelection(title));
    listItem.appendChild(button);
    quizButtonsContainer.appendChild(listItem);
  });
}

function handleQuizSelection(title) {
  window.location.href = `/starter-code/quiz.html?quiz=${encodeURIComponent(
    title
  )}`;
}

document.addEventListener("DOMContentLoaded", populateQuizButtons);
