let currentQuestionIndex = 0; // Track the current question (0-based index)
let score = 0; // Initialize score
let selectedOption = null; // Track the selected option

// Fetch Data Function
async function fetchData() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Get Quiz Query from URL
function getQuizQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("quiz");
}

// Get Question Index Query from URL
function getQuestionIndexQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const questionParam = parseInt(urlParams.get("question") || "1", 10); // Default to 1 if not specified
  return questionParam - 1; // Convert to 0-based index
}

// Update URL Query Parameters
function updateURL(quiz, questionIndex) {
  const url = new URL(window.location.href);
  url.searchParams.set("quiz", quiz);
  url.searchParams.set("question", questionIndex + 1); // Convert back to 1-based index
  window.history.pushState({}, "", url.toString());
}

// Fetch Quiz Data Based on Query
async function fetchQuizData() {
  const quizQuery = getQuizQuery();
  const data = await fetchData();
  const quiz = data.quizzes.find((q) => q.title === quizQuery);

  if (quiz) return quiz;
  console.error("Quiz not found:", quizQuery);
  return null;
}

// Render Header
async function renderHeader() {
  const quiz = await fetchQuizData();
  if (!quiz) return;

  document.getElementById("quiz-icon").src = quiz.icon;
  document.getElementById("quiz-icon").alt = quiz.title;
  document.getElementById("quiz-title").textContent = quiz.title;
}

// Render Progress Bar
function renderProgressBar(index, totalQuestions) {
  const progressBar = document.getElementById("progress-bar");
  const progressPercentage = ((index + 1) / totalQuestions) * 100; // Calculate percentage
  progressBar.style.width = `${progressPercentage}%`; // Update width
}

async function renderQuestion(question, index, totalQuestions, quiz) {
  // Update URL
  updateURL(quiz.title, index);

  // Populate question details
  document.getElementById("question-number").textContent = `Question ${
    index + 1
  } of ${totalQuestions}`;
  document.getElementById("question-text").textContent = question.question;

  // Update progress bar
  renderProgressBar(index, totalQuestions);

  // Populate options
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = ""; // Clear existing options

  // Define option labels (A, B, C, etc.)
  const optionLabels = ["A", "B", "C", "D"];

  question.options.forEach((option, optionIndex) => {
    const optionItem = document.createElement("li");
    optionItem.className = "option-item"; // Add class to the <li> element

    // Create a span for the label (A, B, etc.)
    const optionLabel = document.createElement("span");
    optionLabel.className = "option-label";
    optionLabel.textContent = optionLabels[optionIndex]; // Add the label

    // Create the button for the option
    const optionButton = document.createElement("button");
    optionButton.textContent = option;

    // Option click handler
    optionButton.addEventListener("click", () => handleOptionSelection(option));

    // Append label and button to the option item
    optionItem.appendChild(optionLabel);
    optionItem.appendChild(optionButton);
    optionsContainer.appendChild(optionItem);
  });

  // Reset submit button
  const submitButton = document.getElementById("submit-button");
  submitButton.textContent = "Submit Answer";
  submitButton.disabled = true; // Initially disabled
}

// Handle Option Selection
function handleOptionSelection(option) {
  selectedOption = option; // Save the selected option
  const buttons = document.querySelectorAll(".options button");
  const optionItems = document.querySelectorAll(".option-item"); // Get all option items

  // Remove 'selected-item' class from all options
  optionItems.forEach((optionItem) => {
    optionItem.classList.remove("selected-item");
  });

  // Add 'selected-item' class to the selected option
  buttons.forEach((button, index) => {
    if (button.textContent === option) {
      optionItems[index].classList.add("selected-item"); // Add class to the corresponding option-item
    }
  });

  const submitButton = document.getElementById("submit-button");
  submitButton.disabled = false; // Enable the submit button
}

// Navigate to the Next Question
async function navigateQuestion(quiz, index) {
  const questions = quiz.questions;
  currentQuestionIndex = index;
  renderQuestion(
    questions[currentQuestionIndex],
    currentQuestionIndex,
    questions.length,
    quiz
  );
}

// Handle Quiz Submission
async function handleQuizSubmission() {
  const quiz = await fetchQuizData();
  if (!quiz) return;

  const totalQuestions = quiz.questions.length;

  // Store score in localStorage
  localStorage.setItem("quizScore", score);
  localStorage.setItem("totalQuestions", totalQuestions);

  // Redirect to completion page
  window.location.href = `./complete.html?quiz=${encodeURIComponent(
    getQuizQuery()
  )}`;
}

function handleSubmit(question, index, totalQuestions, quiz) {
  const submitButton = document.getElementById("submit-button");

  if (submitButton.textContent === "Submit Answer") {
    // Check if the selected option is correct
    const isCorrect = selectedOption === question.answer;
    if (isCorrect) {
      score++;
    }

    // Reveal options
    const optionItems = document.querySelectorAll(".option-item");
    const buttons = document.querySelectorAll(".options button");
    const labels = document.querySelectorAll(".option-label");

    buttons.forEach((button, buttonIndex) => {
      button.disabled = true; // Disable all buttons
      const optionItem = optionItems[buttonIndex]; // Get corresponding option-item container
      const optionLabel = labels[buttonIndex]; // Get corresponding option-label

      // Always highlight the correct answer
      if (button.textContent === question.answer) {
        optionItem.classList.add("correct-item"); // Mark as correct
      }

      // Add selected-label and icon to the selected option
      if (button.textContent === selectedOption) {
        optionLabel.classList.add("selected-label");
        optionItem.classList.add("selected-item"); // Highlight the selected item

        // Add the appropriate icon based on correctness
        const iconSrc = isCorrect
          ? "./assets/images/icon-correct.svg"
          : "./assets/images/icon-incorrect.svg";
        appendIcon(
          optionItem,
          iconSrc,
          isCorrect ? "Correct Icon" : "Incorrect Icon"
        );

        // Add incorrect styling if the selected option is wrong
        if (!isCorrect) {
          optionItem.classList.add("incorrect-item"); // Mark as incorrect
        }
      }
    });

    // Update button text
    submitButton.textContent =
      index < totalQuestions - 1 ? "Next Question" : "Finish Quiz";
  } else if (submitButton.textContent === "Next Question") {
    navigateQuestion(quiz, index + 1);
  } else if (submitButton.textContent === "Finish Quiz") {
    handleQuizSubmission();
  }
}

// Utility function to append an icon to an option item
function appendIcon(optionItem, iconSrc, altText) {
  const icon = document.createElement("img");
  icon.src = iconSrc;
  icon.alt = altText;
  icon.className = "option-icon"; // Add a class for styling the icon
  optionItem.appendChild(icon); // Append the icon to the option item
}

// Initialize Quiz on Page Load
document.addEventListener("DOMContentLoaded", async () => {
  const quiz = await fetchQuizData();
  if (!quiz) return;

  renderHeader(); // Render header
  const questions = quiz.questions;
  currentQuestionIndex = getQuestionIndexQuery();
  renderQuestion(
    questions[currentQuestionIndex],
    currentQuestionIndex,
    questions.length,
    quiz
  );

  const submitButton = document.getElementById("submit-button");
  submitButton.addEventListener("click", () => {
    handleSubmit(
      questions[currentQuestionIndex],
      currentQuestionIndex,
      questions.length,
      quiz
    );
  });
});
