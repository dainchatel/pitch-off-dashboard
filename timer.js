// Timer state
let timerSeconds = 30 * 60; // 30 minutes in seconds
let timerInterval = null;
let timerRunning = false;

// Timer functions
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    display.textContent = formatTime(timerSeconds);
    
    // Add warning class if under 5 minutes
    if (timerSeconds <= 300 && timerSeconds > 0) {
        display.classList.add('warning');
    } else {
        display.classList.remove('warning');
    }
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    document.getElementById('startButton').disabled = true;
    document.getElementById('pauseButton').disabled = false;
    
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
            
            // Play sound or alert when timer reaches 0
            if (timerSeconds === 0) {
                pauseTimer();
                alert('⏱️ Timer complete! 30 minutes have elapsed.');
            }
        } else {
            pauseTimer();
        }
    }, 1000);
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    document.getElementById('startButton').disabled = false;
    document.getElementById('pauseButton').disabled = true;
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 30 * 60;
    updateTimerDisplay();
}
