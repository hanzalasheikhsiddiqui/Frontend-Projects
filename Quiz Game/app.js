const nameBox = document.getElementById("name-box");
const nameInput = document.getElementById("name-input-box");
const nameSubmitBtn = document.getElementById("name-submit-button");
const quizSection = document.getElementById("quiz-section");
const questionEl = document.querySelector("#question h2");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultSection = document.getElementById("result");
const scoreEl = document.getElementById("score");
const resultMessageEl = document.getElementById("result-message");

let currentQuestionIndex = 0;
let score = 0;

// Questions array (25 questions)
const quizData = [
  // HTML Questions
  {
    question: "What does HTML stand for?",
    options: [
      "Hyperlinks and Text Markup Language",
      "Home Tool Markup Language",
      "Hyper Text Markup Language",
      "Hyper Transfer Markup Language"
    ],
    answer: "Hyper Text Markup Language"
  },
  {
    question: "Which tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<hyper>"],
    answer: "<a>"
  },
  {
    question: "Which tag is used to display an image?",
    options: ["<img>", "<image>", "<picture>", "<src>"],
    answer: "<img>"
  },
  {
    question: "What attribute is used to open a link in a new tab?",
    options: ['window="_blank"', 'tab="_new"', 'target="_blank"', 'newtab="true"'],
    answer: 'target="_blank"'
  },
  {
    question: "Which tag is used to create an ordered list?",
    options: ["<ol>", "<ul>", "<li>", "<list>"],
    answer: "<ol>"
  },
  {
    question: "Which tag defines the largest heading?",
    options: ["<h1>", "<heading>", "<h6>", "<title>"],
    answer: "<h1>"
  },
  {
    question: "What is the correct HTML for inserting a line break?",
    options: ["<lb>", "<break>", "<br>", "<line>"],
    answer: "<br>"
  },
  {
    question: "Which element is used to create a form?",
    options: ["<input>", "<form>", "<div>", "<table>"],
    answer: "<form>"
  },
  {
    question: "Which attribute specifies an alternate text for an image?",
    options: ["alt", "title", "src", "caption"],
    answer: "alt"
  },

  // CSS Questions
  {
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Colorful Style Sheets",
      "Computer Style Sheets",
      "Creative Style System"
    ],
    answer: "Cascading Style Sheets"
  },
  {
    question: "Which property is used to change the text color?",
    options: ["font-color", "text-color", "color", "fgcolor"],
    answer: "color"
  },
  {
    question: "How do you add a background color in CSS?",
    options: [
      "color: blue;",
      "background-color: blue;",
      "bgcolor: blue;",
      "background:color(blue);"
    ],
    answer: "background-color: blue;"
  },
  {
    question: "Which property controls the text size?",
    options: ["font-size", "text-size", "size", "font-style"],
    answer: "font-size"
  },
  {
    question: "How do you select all <p> elements in CSS?",
    options: ["p {}", ".p {}", "#p {}", "paragraph {}"],
    answer: "p {}"
  },
  {
    question: "How can you center text in CSS?",
    options: [
      "text-position: center;",
      "text-align: center;",
      "align: middle;",
      "text-center: yes;"
    ],
    answer: "text-align: center;"
  },
  {
    question: "Which property is used to make text bold?",
    options: ["font-weight", "font-bold", "text-weight", "bold-text"],
    answer: "font-weight"
  },
  {
    question: "How do you make a comment in CSS?",
    options: ["// comment", "/* comment */", "<!-- comment -->", "** comment **"],
    answer: "/* comment */"
  },

  // JavaScript Questions
  {
    question: "What does JS stand for?",
    options: ["Java Structure", "JavaScript", "Just Script", "JSON Script"],
    answer: "JavaScript"
  },
  {
    question: "How do you write 'Hello World' in an alert box?",
    options: [
      'msg("Hello World");',
      'alert("Hello World");',
      'alertBox("Hello World");',
      'prompt("Hello World");'
    ],
    answer: 'alert("Hello World");'
  },
  {
    question: "Which symbol is used for comments in JavaScript (single line)?",
    options: ["<!-- comment -->", "/* comment */", "// comment", "** comment **"],
    answer: "// comment"
  },
  {
    question: "How do you create a function in JavaScript?",
    options: [
      "function = myFunc()",
      "create function myFunc()",
      "function myFunc() {}",
      "def myFunc() {}"
    ],
    answer: "function myFunc() {}"
  },
  {
    question: "How do you call a function named testFunction?",
    options: [
      "call testFunction;",
      "testFunction();",
      "callFunction(testFunction);",
      "run testFunction();"
    ],
    answer: "testFunction();"
  },
  {
    question: "Which operator is used to assign a value to a variable?",
    options: ["-", "=", "x", "*"],
    answer: "="
  },
  {
    question: 'What will typeof "123" return?',
    options: ["number", "integer", "string", "text"],
    answer: "string"
  },
  {
    question: "Which keyword declares a constant in JavaScript?",
    options: ["let", "const", "var", "define"],
    answer: "const"
  }
];
  

nameSubmitBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name !== "") {
    nameBox.style.display = "none";
    quizSection.style.display = "block";
    showQuestion();
  } else {
    alert("Please enter your name to start!");
  }
});

function showQuestion() {
  resetState();
  const currentQuestion = quizData[currentQuestionIndex];
  questionEl.textContent = currentQuestion.question;
  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.addEventListener("click", selectAnswer);
    optionsContainer.appendChild(button);
  });
}

function resetState() {
  nextButton.style.display = "none";
  while (optionsContainer.firstChild) {
    optionsContainer.removeChild(optionsContainer.firstChild);
  }
}

function selectAnswer(e) {
  const selectedOption = e.target;
  const answer = quizData[currentQuestionIndex].answer;
  if (selectedOption.textContent === answer) {
    score++;
    selectedOption.classList.add("correct");
  } else {
    selectedOption.classList.add("wrong");
  }
  // Disable all options
  Array.from(optionsContainer.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === answer) {
      btn.classList.add("correct");
    }
  });
  nextButton.style.display = "inline-block";
}

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  quizSection.style.display = "none";
  resultSection.style.display = "block";
  scoreEl.textContent = `${score} / ${quizData.length}`;
  const name = nameInput.value.trim();
  resultMessageEl.textContent = `Well done, ${name}!`;
}
