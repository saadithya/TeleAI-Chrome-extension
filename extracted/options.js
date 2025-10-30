// Options script for TeleAI Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const defaultSpeed = document.getElementById('defaultSpeed');
    const speedValue = document.getElementById('speedValue');
    const defaultTextSize = document.getElementById('defaultTextSize');
    const textSizeValue = document.getElementById('textSizeValue');
    const backgroundColor = document.getElementById('backgroundColor');
    const textColor = document.getElementById('textColor');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const status = document.getElementById('status');

    // Load saved settings
    loadSettings();

    // Event listeners
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);
    
    // Update slider values in real-time
    defaultSpeed.addEventListener('input', () => {
        speedValue.textContent = parseFloat(defaultSpeed.value).toFixed(1);
    });
    
    defaultTextSize.addEventListener('input', () => {
        textSizeValue.textContent = `${defaultTextSize.value}px`;
    });

    /**
     * Load settings from storage
     */
    function loadSettings() {
        chrome.storage.sync.get([
            'defaultSpeed',
            'defaultTextSize',
            'backgroundColor',
            'textColor'
        ], (result) => {
            // Set default values if not present
            if (result.defaultSpeed !== undefined) {
                defaultSpeed.value = result.defaultSpeed;
                speedValue.textContent = parseFloat(result.defaultSpeed).toFixed(1);
            } else {
                // Set defaults
                defaultSpeed.value = 3;
                speedValue.textContent = '3.0';
            }
            
            if (result.defaultTextSize !== undefined) {
                defaultTextSize.value = result.defaultTextSize;
                textSizeValue.textContent = `${result.defaultTextSize}px`;
            } else {
                // Set defaults
                defaultTextSize.value = 24;
                textSizeValue.textContent = '24px';
            }
            
            if (result.backgroundColor) {
                backgroundColor.value = result.backgroundColor;
            } else {
                backgroundColor.value = '#000000';
            }
            
            if (result.textColor) {
                textColor.value = result.textColor;
            } else {
                textColor.value = '#ffffff';
            }
        });
    }

    /**
     * Save settings to storage
     */
    function saveSettings() {
        const settings = {
            defaultSpeed: parseFloat(defaultSpeed.value),
            defaultTextSize: parseInt(defaultTextSize.value),
            backgroundColor: backgroundColor.value,
            textColor: textColor.value
        };

        chrome.storage.sync.set(settings, () => {
            showStatus('Settings saved successfully!', 'success');
        });
    }

    /**
     * Reset settings to defaults
     */
    function resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            chrome.storage.sync.clear(() => {
                // Reset form to defaults
                defaultSpeed.value = 3;
                speedValue.textContent = '3.0';
                defaultTextSize.value = 24;
                textSizeValue.textContent = '24px';
                backgroundColor.value = '#000000';
                textColor.value = '#ffffff';
                
                showStatus('Settings reset to defaults', 'success');
            });
        }
    }

    /**
     * Show status message
     */
    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');

        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
});