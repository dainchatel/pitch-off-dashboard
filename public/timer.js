// Timer state — driven by pitch length mode (30 / 25 / 15 min)
let pitchLengthMode = 'standard'; // 'standard' (30), 'mid' (25), 'mini' (15)
let timerInterval = null;
let timerRunning = false;
let timerMode = 'automatic'; // 'manual' or 'automatic' — auto selected on load

function getPitchLengthConfig() {
    if (pitchLengthMode === 'standard') {
        return { totalSeconds: 30 * 60, segmentMarks: [20 * 60, 10 * 60] }; // 20:00, 10:00
    }
    if (pitchLengthMode === 'mid') {
        // 25 min split evenly: segments at 1/3 and 2/3 → 16:40 and 8:20 remaining
        const total = 25 * 60;
        const third = Math.round(total / 3);
        return { totalSeconds: total, segmentMarks: [2 * third, third] };
    }
    return { totalSeconds: 15 * 60, segmentMarks: [5 * 60, 10 * 60] }; // 5:00, 10:00
}

function formatTriggerTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function initSegmentStateFromConfig() {
    const config = getPitchLengthConfig();
    const [m1, m2] = config.segmentMarks;
    selectedSegments = { [m1]: null, [m2]: null };
    triggeredSegments = { [m1]: false, [m2]: false };
    segmentRevealState = { [m1]: false, [m2]: false };
    segmentSwapState = { [m1]: false, [m2]: false };
    swapTargetMinute = null;
}

const config = getPitchLengthConfig();
let timerSeconds = config.totalSeconds;
let selectedSegments = { [config.segmentMarks[0]]: null, [config.segmentMarks[1]]: null };
let triggeredSegments = { [config.segmentMarks[0]]: false, [config.segmentMarks[1]]: false };
let segmentRevealState = { [config.segmentMarks[0]]: false, [config.segmentMarks[1]]: false };
let segmentSwapState = { [config.segmentMarks[0]]: false, [config.segmentMarks[1]]: false };
let swapTargetMinute = null;

// Seek slider: don't overwrite value while user is dragging
let seekSliderDragging = false;

// Constants
const SEGMENT_NOTIFICATION_DURATION = 5000; // milliseconds

// Timer cue sounds
const TIMER_SOUND_START = './audio/stings/pitch-start.wav';
const TIMER_SOUND_ONE_MINUTE = './audio/stings/one-minute-left.wav';
const TIMER_SOUND_ZERO = './audio/stings/pitch-end.wav';

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
    if (!seekSliderDragging) updateTimerSeekSlider();
}

function updateTimerSeekSlider() {
    const slider = document.getElementById('timerSeekSlider');
    if (!slider) return;
    const total = getPitchLengthConfig().totalSeconds;
    slider.max = total;
    slider.value = Math.max(0, Math.min(total, timerSeconds));
}

function updatePitchLengthButtonsDisabled() {
    const container = document.querySelector('.pitch-length-btns');
    if (container) {
        container.querySelectorAll('.pitch-length-btn').forEach(btn => {
            btn.disabled = timerRunning;
        });
    }
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    document.getElementById('startButton').disabled = true;
    document.getElementById('pauseButton').disabled = false;
    updatePitchLengthButtonsDisabled();
    
    // 1) Play sound on timer start (manual or auto)
    if (typeof playOneSting === 'function') {
        playOneSting(TIMER_SOUND_START)();
    }
    
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
            
            // In automatic mode, trigger segments at specific times
            if (timerMode === 'automatic') {
                checkAndTriggerSegments();
            }
            
            // 2) Play sound when one minute left
            if (timerSeconds === 60 && typeof playOneSting === 'function') {
                playOneSting(TIMER_SOUND_ONE_MINUTE)();
            }
            
            // 3) Play sound and stop when timer reaches 0 (no alert — sound plays immediately)
            if (timerSeconds === 0) {
                if (typeof playOneSting === 'function') {
                    playOneSting(TIMER_SOUND_ZERO)();
                }
                pauseTimer();
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
    updatePitchLengthButtonsDisabled();
}

function resetTimer() {
    pauseTimer();
    const config = getPitchLengthConfig();
    timerSeconds = config.totalSeconds;
    initSegmentStateFromConfig();
    if (timerMode === 'automatic') {
        selectRandomSegments();
        showSelectedSegments();
    }
    updateTimerDisplay();
    updateTimerSeekSlider();
    updatePitchLengthButtonsDisabled();
}

// Toggle between manual and automatic mode (unchecked = Auto, checked = Manual)
function toggleTimerMode() {
    const modeToggle = document.getElementById('modeToggle');
    timerMode = modeToggle.checked ? 'manual' : 'automatic';
    
    if (timerMode === 'automatic') {
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
    const [m1, m2] = getPitchLengthConfig().segmentMarks;
    // Randomly select 2 different segments using Fisher-Yates shuffle
    const shuffled = [...segments];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    selectedSegments[m1] = shuffled[0];
    selectedSegments[m2] = shuffled[1] || shuffled[0];
    segmentRevealState = { [m1]: false, [m2]: false };
    segmentSwapState = { [m1]: false, [m2]: false };
    swapTargetMinute = null;
}

// Check and trigger segments at specific countdown times (segmentMarks are seconds remaining)
function checkAndTriggerSegments() {
    const [m1, m2] = getPitchLengthConfig().segmentMarks;
    if (timerSeconds === m1 && !triggeredSegments[m1]) {
        triggeredSegments[m1] = true;
        executeSegmentActions(selectedSegments[m1], m1);
    }
    if (timerSeconds === m2 && !triggeredSegments[m2]) {
        triggeredSegments[m2] = true;
        executeSegmentActions(selectedSegments[m2], m2);
    }
}

// Execute the actions for a segment (triggerMark is seconds remaining when triggered)
function executeSegmentActions(segment, triggerMark) {
    if (!segment) return;
    
    console.log(`Triggering segment "${segment.name}" at ${formatTriggerTime(triggerMark)}`);
    
    showSegmentNotification(segment.name, triggerMark);
    
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
function showSegmentNotification(segmentName, triggerMark) {
    const notification = document.createElement('div');
    notification.className = 'segment-notification';
    notification.textContent = `🎬 ${segmentName} - ${formatTriggerTime(triggerMark)}`;
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
    const [m1, m2] = getPitchLengthConfig().segmentMarks;
    const label1 = `📍 ${formatTriggerTime(m1)}`;
    const label2 = `📍 ${formatTriggerTime(m2)}`;
    container.style.display = 'block';
    container.innerHTML = `
        <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">🎲 Automatic Mode Segments:</div>
            <div style="display: flex; flex-direction: column; gap: 6px; align-items: center;">
                ${renderSegmentRow(m1, label1)}
                ${renderSegmentRow(m2, label2)}
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
    const [m1, m2] = getPitchLengthConfig().segmentMarks;
    segmentSwapState = { [m1]: false, [m2]: false };
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
    const [m1, m2] = getPitchLengthConfig().segmentMarks;
    segmentSwapState = { [m1]: false, [m2]: false };
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

// Set pitch length mode: 'standard' (30 min), 'mid' (25 min), or 'mini' (15 min)
function setPitchLengthMode(mode) {
    if (timerRunning) return;
    pitchLengthMode = mode;
    const container = document.querySelector('.pitch-length-btns');
    if (container) {
        container.querySelectorAll('.pitch-length-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
    }
    const config = getPitchLengthConfig();
    timerSeconds = config.totalSeconds;
    initSegmentStateFromConfig();
    updateTimerDisplay();
    updateTimerSeekSlider();
    if (timerMode === 'automatic') {
        selectRandomSegments();
        showSelectedSegments();
    }
}

function applyTimerSeek() {
    const slider = document.getElementById('timerSeekSlider');
    if (!slider) return;
    seekSliderDragging = false;
    const sec = parseInt(slider.value, 10);
    if (isNaN(sec)) return;
    const total = getPitchLengthConfig().totalSeconds;
    timerSeconds = Math.max(0, Math.min(total, sec));
    updateTimerDisplay();
    updateTimerSeekSlider();
    if (timerSeconds === 0 && timerRunning) {
        if (typeof playOneSting === 'function') playOneSting(TIMER_SOUND_ZERO)();
        pauseTimer();
    }
}

// On load: show automatic segment slots when in automatic mode (default)
function initTimerDisplay() {
    updatePitchLengthButtonsDisabled();
    updateTimerSeekSlider();
    if (timerMode === 'automatic') {
        selectRandomSegments();
        showSelectedSegments();
    }
    const slider = document.getElementById('timerSeekSlider');
    if (slider) {
        slider.addEventListener('mousedown', () => { seekSliderDragging = true; });
        slider.addEventListener('mouseup', applyTimerSeek);
        slider.addEventListener('change', applyTimerSeek);
        slider.addEventListener('input', () => {
            const sec = parseInt(slider.value, 10);
            if (!isNaN(sec)) {
                timerSeconds = Math.max(0, Math.min(getPitchLengthConfig().totalSeconds, sec));
                updateTimerDisplay();
            }
        });
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTimerDisplay);
} else {
    initTimerDisplay();
}
