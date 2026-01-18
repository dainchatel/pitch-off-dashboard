// Timer state
let timerSeconds = 30 * 60; // 30 minutes in seconds
let timerInterval = null;
let timerRunning = false;
let timerMode = 'manual'; // 'manual' or 'automatic'
let selectedSegments = { 20: null, 10: null }; // Segments for 20 and 10 minute marks
let triggeredSegments = { 20: false, 10: false }; // Track which segments have been triggered

// Constants
const SEGMENT_NOTIFICATION_DURATION = 5000; // milliseconds

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
            
            // In automatic mode, trigger segments at specific times
            if (timerMode === 'automatic') {
                checkAndTriggerSegments();
            }
            
            // Play sound or alert when timer reaches 0
            if (timerSeconds === 0) {
                pauseTimer();
                alert('⏱️ Timer complete! 30 minutes have elapsed.');
            }
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
    // Reset triggered segments
    triggeredSegments = { 20: false, 10: false };
}

// Toggle between manual and automatic mode
function toggleTimerMode() {
    const modeToggle = document.getElementById('modeToggle');
    timerMode = modeToggle.checked ? 'automatic' : 'manual';
    
    if (timerMode === 'automatic') {
        // Select random segments for 20 and 10 minute marks
        selectRandomSegments();
        showSelectedSegments();
    } else {
        hideSelectedSegments();
    }
}

// Select random segments for automatic mode
function selectRandomSegments() {
    if (typeof segments === 'undefined' || segments.length === 0) {
        console.warn('No segments available for selection');
        return;
    }
    
    // Randomly select 2 different segments using Fisher-Yates shuffle
    const shuffled = [...segments];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    selectedSegments[20] = shuffled[0];
    selectedSegments[10] = shuffled[1] || shuffled[0]; // Fallback to first if only one segment
}

// Check and trigger segments at specific countdown times
function checkAndTriggerSegments() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    
    // Trigger at exactly 20:00
    if (minutes === 20 && seconds === 0 && !triggeredSegments[20]) {
        triggeredSegments[20] = true;
        executeSegmentActions(selectedSegments[20], 20);
    }
    
    // Trigger at exactly 10:00
    if (minutes === 10 && seconds === 0 && !triggeredSegments[10]) {
        triggeredSegments[10] = true;
        executeSegmentActions(selectedSegments[10], 10);
    }
}

// Execute the actions for a segment
function executeSegmentActions(segment, minuteMark) {
    if (!segment) return;
    
    console.log(`Triggering segment "${segment.name}" at ${minuteMark} minute mark`);
    
    // Display segment notification
    showSegmentNotification(segment.name, minuteMark);
    
    // Execute each action in the segment
    if (segment.action && Array.isArray(segment.action)) {
        segment.action.forEach(action => {
            if (typeof action === 'function') {
                action();
            }
        });
    }
}

// Show notification when a segment is triggered
function showSegmentNotification(segmentName, minuteMark) {
    const notification = document.createElement('div');
    notification.className = 'segment-notification';
    notification.textContent = `🎬 ${segmentName} - ${minuteMark} minute mark`;
    document.body.appendChild(notification);
    
    // Remove notification after defined duration
    setTimeout(() => {
        notification.remove();
    }, SEGMENT_NOTIFICATION_DURATION);
}

// Show selected segments in UI
function showSelectedSegments() {
    const container = document.getElementById('selectedSegmentsDisplay');
    if (!container) return;
    
    const segment20Name = selectedSegments[20] ? selectedSegments[20].name : 'None';
    const segment10Name = selectedSegments[10] ? selectedSegments[10].name : 'None';
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <strong>🎲 Automatic Mode Segments:</strong><br>
            <div style="margin-top: 10px;">
                <span style="color: #667eea;">📍 20:00</span> - <span id="segment-20-name" class="segment-name-container" data-name="${segment20Name}" data-revealed="false" onclick="toggleSegmentReveal(20, event)"><button style="background: #667eea; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Click to reveal</button></span>
            </div>
            <div style="margin-top: 5px;">
                <span style="color: #667eea;">📍 10:00</span> - <span id="segment-10-name" class="segment-name-container" data-name="${segment10Name}" data-revealed="false" onclick="toggleSegmentReveal(10, event)"><button style="background: #667eea; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Click to reveal</button></span>
            </div>
        </div>
    `;
}

// Toggle segment name reveal
function toggleSegmentReveal(minuteMark, event) {
    event.stopPropagation();
    const element = document.getElementById(`segment-${minuteMark}-name`);
    if (!element) return;
    
    const isRevealed = element.getAttribute('data-revealed') === 'true';
    const segmentName = element.getAttribute('data-name');
    
    if (isRevealed) {
        element.innerHTML = '<button style="background: #667eea; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em;">Click to reveal</button>';
        element.setAttribute('data-revealed', 'false');
    } else {
        element.innerHTML = `<span style="color: #333;">${segmentName}</span>`;
        element.setAttribute('data-revealed', 'true');
    }
}

// Hide selected segments display
function hideSelectedSegments() {
    const container = document.getElementById('selectedSegmentsDisplay');
    if (container) {
        container.style.display = 'none';
    }
}
