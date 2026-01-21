// Timer state
let timerSeconds = 30 * 60; // 30 minutes in seconds
let timerInterval = null;
let timerRunning = false;
let timerMode = 'manual'; // 'manual' or 'automatic'
let selectedSegments = { 20: null, 10: null }; // Segments for 20 and 10 minute marks
let triggeredSegments = { 20: false, 10: false }; // Track which segments have been triggered
let segmentRevealState = { 20: false, 10: false }; // Track reveal state for display
let segmentSwapState = { 20: false, 10: false }; // Track swap mode per slot
let swapTargetMinute = null; // Which slot is currently swapping (20 or 10)

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
    // Reset reveal/swap states
    segmentRevealState = { 20: false, 10: false };
    segmentSwapState = { 20: false, 10: false };
    swapTargetMinute = null;
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
    
    // Reset reveal state when new selections are made
    segmentRevealState = { 20: false, 10: false };
    segmentSwapState = { 20: false, 10: false };
    swapTargetMinute = null;
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
    
    container.style.display = 'block';
    container.innerHTML = `
        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">🎲 Automatic Mode Segments:</div>
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
                ${renderSegmentRow(20, '📍 20:00')}
                ${renderSegmentRow(10, '📍 10:00')}
            </div>
        </div>
    `;
}

// Render a single segment row (names only)
function renderSegmentRow(minuteMark, label) {
    const isRevealed = segmentRevealState[minuteMark];
    const isSwapping = segmentSwapState[minuteMark];
    const segment = selectedSegments[minuteMark];
    const name = segment ? segment.name : 'None';
    const maskedName = 'Single Segment';
    const swapColor = isSwapping ? '#17a2b8' : '#667eea';
    const swapTextColor = 'white';
    
    return `
        <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 12px; min-width: 420px;">
            <span style="color: #667eea;">${label}</span>
            <span
                style="color: #333; font-weight: 500; ${isRevealed ? '' : 'filter: blur(5px);'} transition: filter 0.2s;"
            >
                ${isRevealed ? name : maskedName}
            </span>
            <span style="display: inline-flex; align-items: center; gap: 8px; margin-left: 12px;">
                <button
                    style="background: #667eea; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em; width: 70px; text-align: center;"
                    onclick="${isRevealed ? `hideSegment(${minuteMark})` : `revealSegment(${minuteMark})`}"
                >
                    ${isRevealed ? 'Hide' : 'Reveal'}
                </button>
                <button
                    style="background: ${swapColor}; color: ${swapTextColor}; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em; width: 70px; text-align: center;"
                    onclick="toggleSwapMode(${minuteMark})"
                >
                    Swap
                </button>
            </span>
        </div>
    `;
}

function revealSegment(minuteMark) {
    segmentRevealState[minuteMark] = true;
    showSelectedSegments();
}

function hideSegment(minuteMark) {
    segmentRevealState[minuteMark] = false;
    showSelectedSegments();
}

// Swap handler (no-op for now)
function toggleSwapMode(minuteMark) {
    const currentlyOn = segmentSwapState[minuteMark];
    segmentSwapState = { 20: false, 10: false };
    if (currentlyOn) {
        swapTargetMinute = null;
    } else {
        segmentSwapState[minuteMark] = true;
        swapTargetMinute = minuteMark;
    }
    showSelectedSegments();
}

// Handle selecting a segment from tiles when in swap mode
function handleSwapSelect(segmentName) {
    if (swapTargetMinute === null || !segments || !Array.isArray(segments)) return false;
    const found = segments.find(seg => seg.name === segmentName);
    if (!found) return false;
    selectedSegments[swapTargetMinute] = found;
    // Keep reveal state as-is (stays blurred until user reveals again)
    segmentSwapState = { 20: false, 10: false };
    swapTargetMinute = null;
    showSelectedSegments();
    return true;
}

// Hide selected segments display
function hideSelectedSegments() {
    const container = document.getElementById('selectedSegmentsDisplay');
    if (container) {
        container.style.display = 'none';
    }
}
