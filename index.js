const TOTAL_TASK_TIME = 60;

const startButton = document.querySelector(".start-btn");
const gameScreen = document.getElementById("game-screen");
const displayArea = document.getElementById("display-area");
const participantIdInput = document.getElementById("participant-id");
const groupIdInput = document.getElementById("group-id");

let participant = {
    id: 0,
    groupId: ''
}

const colors = [
    { name: "red", code: "red", key: "d" },
    { name: "green", code: "green", key: "f" },
    { name: "blue", code: "blue", key: "j" },
    { name: "black", code: "black", key: "k" },
];

let currentColor = null;
let correctCount = 0;
let mistakeCount = 0;
let currentRound = 0;
let isWarmup = true; // Warmup phase for first 5 rounds
let timer; // Timer for the 60-second countdown

participantIdInput.addEventListener('input', function () {
    participant.id = this.value;
    checkReadyToStart();
})

groupIdInput.addEventListener('input', function () {
    participant.groupId = this.value;
    checkReadyToStart();
})

startButton.addEventListener("click", () => {
    document.body.style.cursor = 'none';
    document.querySelector(".instructions").style.display = "none";
    startButton.style.display = "none";
    gameScreen.style.display = "block";
    document.querySelector(".participant-data").style.display = "none";
    nextTrial();
});

// Show results at the end of the experiment
function showResults() {
    document.body.style.cursor = 'auto';

    // Create the results container
    const resultsContainer = document.createElement('div');
    resultsContainer.classList.add('results-container');
    resultsContainer.innerHTML = `
        <h4>Results</h4>
        <table class="results-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Group ID</th>
                    <th>Correct Count</th>
                    <th>Mistake Count</th>
                    <th class="action-column">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td id="result-id">${participant.id}</td>
                    <td id="result-group-id">${participant.groupId}</td>
                    <td id="result-correct">${correctCount}</td>
                    <td id="result-mistakes">${mistakeCount}</td>
                    <td>
                        <button class="copy-button" id="copy-button">
                            Copy
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    document.body.innerHTML = '';
    document.body.appendChild(resultsContainer);

    // Add event listener to the Copy button
    const copyButton = document.getElementById('copy-button');
    copyButton.addEventListener('click', () => {
        const resultData = {
            id: participant.id,
            groupId: participant.groupId,
            correctCount,
            mistakeCount
        };

        // Copy results to the clipboard
        const resultText = `${resultData.id}\t${resultData.groupId}\t${resultData.correctCount}\t${resultData.mistakeCount}`;
        navigator.clipboard.writeText(resultText)
            .then(() => {
                copyButton.innerText = 'Copied!';
                setTimeout(() => {
                    copyButton.innerText = 'Copy';
                }, 500);
            })
            .catch((err) => console.error('Failed to copy: ', err));

        // Save results to local storage
        let storedResults = JSON.parse(localStorage.getItem('stroopResults')) || [];
        storedResults.push(resultData);
        localStorage.setItem('stroopResults', JSON.stringify(storedResults));
    });
}


// Start a 60-second timer after the warmup phase
function startTimer() {
    let timeLeft = TOTAL_TASK_TIME;

    timer = setInterval(() => {
        timeLeft--;
        // timerDisplay.innerText = `Time Left: ${timeLeft} seconds`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            showResults(); // Show results when timer ends
        }
    }, 1000);
}

// Show a red X for incorrect answers
function showMistakeFeedback() {
    document.getElementById('display-area').style.visibility = "hidden"
    const feedback = document.createElement("div");
    feedback.innerText = "X";
    feedback.style.color = "red";
    feedback.style.fontSize = "5rem";
    feedback.style.position = "absolute";
    feedback.style.top = "60%";
    feedback.style.left = "50%";
    feedback.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.remove();
        document.getElementById('display-area').style.visibility = "visible"
    }, 300); // Remove after 0.5 seconds
}
var listened = false
// Handle user input
function listenForInput() {
    document.addEventListener("keydown", function handler(event) {


        const validKeys = ["d", "f", "j", "k"];
        if (!validKeys.includes(event.key)) return; // Ignore invalid keys

        // Check correctness
        console.log(event.key)
        console.log(currentColor.key)
        if (event.key === currentColor.key) {

            if (isWarmup == false) {
                console.log('Correct')
                correctCount++;

            }

        } else {
            console.log('Incorrect')
            if (isWarmup == false) {
                mistakeCount++;

            }
            showMistakeFeedback(); // Show feedback for mistakes
        }

        // Move to the next trial immediately
        document.removeEventListener("keydown", handler);
        nextTrial();
    });
}

function nextTrial() {
    currentRound++;
    console.log(currentRound);

    // Check if warmup phase is over
    if (currentRound > 5 && isWarmup) {
        isWarmup = false;
        startTimer(); // Start the timer after warmup
    }

    // Randomize between text or rectangle
    const randomType = Math.random() > 0.5 ? "text" : "rectangle";
    currentColor = colors[Math.floor(Math.random() * colors.length)]; // The actual text name

    displayArea.innerHTML = ""; // Clear the previous display

    setTimeout(() => {
        if (randomType === "text") {
            // Pick a totally random font color
            const randomFontColor = colors[Math.floor(Math.random() * colors.length)];

            const colorText = document.createElement("span");
            colorText.textContent = currentColor.name; // Keep the name random
            colorText.style.color = randomFontColor.code; // Set font color to random

            displayArea.appendChild(colorText);

            // Update the currentColor to match the font color (for correctness check)
            currentColor = randomFontColor;

        } else {
            // Display a rectangle of the color
            const rectangle = document.createElement("div");
            rectangle.className = "rectangle";
            rectangle.style.backgroundColor = currentColor.code;
            displayArea.appendChild(rectangle);
        }

        listenForInput(); // Start listening for input
    }, 200);
}

function checkReadyToStart() {
    const ready = participant.id !== 0 && participant.groupId !== '';

    if (ready) startButton.disabled = false;
    else startButton.disabled = true;
}

