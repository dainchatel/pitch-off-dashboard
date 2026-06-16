// Global playback volume control.
// Owns a single volume value (0..1) shared by all audio in the app:
// stings, scene music, and custom uploads. Wired to the #volumeSlider input.

(function () {
    const DEFAULT_VOLUME = 0.5; // 50% on every load (not persisted)

    let currentVolume = DEFAULT_VOLUME;

    // Audio/media elements whose volume should track the slider live.
    const registry = new Set();

    function getAudioVolume() {
        return currentVolume;
    }

    function setAudioVolume(value) {
        if (typeof value !== 'number' || Number.isNaN(value)) return;
        currentVolume = Math.min(1, Math.max(0, value));
        registry.forEach(el => {
            try { el.volume = currentVolume; } catch (e) { /* detached element */ }
        });
        updateSliderUI();
    }

    // Register an element so its volume tracks the slider now and on every change.
    // Returns the element for convenient inline use.
    function registerAudio(el) {
        if (!el) return el;
        registry.add(el);
        try { el.volume = currentVolume; } catch (e) { /* media not ready yet */ }
        return el;
    }

    // Drop an element from the registry once it's no longer in use, so it can be
    // garbage collected (scene music recreates its media element on every play).
    function unregisterAudio(el) {
        if (el) registry.delete(el);
    }

    function updateSliderUI() {
        const percent = Math.round(currentVolume * 100);
        const slider = document.getElementById('volumeSlider');
        const label = document.getElementById('volumeValue');
        if (slider && slider.value !== String(percent)) slider.value = String(percent);
        if (label) label.textContent = percent + '%';
    }

    function initVolumeControl() {
        const slider = document.getElementById('volumeSlider');
        if (slider) {
            slider.value = String(Math.round(currentVolume * 100));
            slider.addEventListener('input', (e) => {
                setAudioVolume(parseInt(e.target.value, 10) / 100);
            });
        }
        updateSliderUI();
    }

    // Expose as globals for the other (classic) scripts.
    window.getAudioVolume = getAudioVolume;
    window.setAudioVolume = setAudioVolume;
    window.registerAudio = registerAudio;
    window.unregisterAudio = unregisterAudio;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVolumeControl);
    } else {
        initVolumeControl();
    }
})();
