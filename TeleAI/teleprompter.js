// Teleprompter script for TeleAI Chrome Extension

class Teleprompter {
    constructor() {
        this.isScrolling = false;
        this.scrollSpeed = 3;
        this.textSize = 24;
        this.scrollPosition = 0;
        this.animationId = null;
        this.backgroundColor = '#000000';
        this.textColor = '#ffffff';
        this.isManuallyScrolling = false;
        this.originalContent = ''; // Store original content for translation
        
        this.initializeElements();
        this.loadSettings();
        this.loadContent();
        this.setupEventListeners();
        this.startScrolling();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.controls = document.getElementById('controls');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedDisplay = document.getElementById('speedDisplay');
        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeDisplay = document.getElementById('sizeDisplay');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.toggleControls = document.getElementById('toggleControls');
        this.container = document.getElementById('teleprompterContainer');
        this.textElement = document.getElementById('teleprompterText');
        this.editOverlay = document.getElementById('editOverlay');
        this.contentEditor = document.getElementById('contentEditor');
        this.saveContentBtn = document.getElementById('saveContentBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        
        // Translation elements
        this.languageSelect = document.getElementById('languageSelect');
        this.translateBtn = document.getElementById('translateBtn');
    }

    /**
     * Load settings from storage
     */
    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get([
                'defaultSpeed',
                'defaultTextSize',
                'backgroundColor',
                'textColor'
            ]);

            if (result.defaultSpeed) {
                this.scrollSpeed = result.defaultSpeed;
                this.speedSlider.value = result.defaultSpeed;
                this.speedDisplay.textContent = result.defaultSpeed.toFixed(1);
            }

            if (result.defaultTextSize) {
                this.textSize = result.defaultTextSize;
                this.sizeSlider.value = result.defaultTextSize;
                this.sizeDisplay.textContent = `${result.defaultTextSize}px`;
                this.textElement.style.fontSize = `${result.defaultTextSize}px`;
            }

            if (result.backgroundColor) {
                this.backgroundColor = result.backgroundColor;
                document.body.style.backgroundColor = result.backgroundColor;
                this.container.style.backgroundColor = result.backgroundColor;
            }

            if (result.textColor) {
                this.textColor = result.textColor;
                this.textElement.style.color = result.textColor;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    /**
     * Load content from storage or show default
     */
    async loadContent() {
        try {
            const result = await chrome.storage.local.get(['generatedContent']);
            if (result.generatedContent) {
                this.setContent(result.generatedContent);
                this.originalContent = result.generatedContent; // Store original content
            } else {
                // Show a message if no content is available
                this.setContent("Welcome to TeleAI! Generate content from the extension popup to get started, or paste your own text here by double-clicking to edit.");
                this.originalContent = "Welcome to TeleAI! Generate content from the extension popup to get started, or paste your own text here by double-clicking to edit.";
            }
        } catch (error) {
            console.error('Error loading content:', error);
            this.setContent("Welcome to TeleAI! Generate content from the extension popup to get started, or paste your own text here by double-clicking to edit.");
            this.originalContent = "Welcome to TeleAI! Generate content from the extension popup to get started, or paste your own text here by double-clicking to edit.";
        }
    }

    /**
     * Set content in teleprompter
     */
    setContent(content) {
        // Format content for better readability
        const formattedContent = content
            .split('\n')
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0)
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');

        this.textElement.innerHTML = formattedContent || content;
        this.resetPosition();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Speed control
        this.speedSlider.addEventListener('input', () => {
            this.scrollSpeed = parseFloat(this.speedSlider.value);
            this.speedDisplay.textContent = this.scrollSpeed.toFixed(1);
        });

        // Text size control
        this.sizeSlider.addEventListener('input', () => {
            this.textSize = parseInt(this.sizeSlider.value);
            this.sizeDisplay.textContent = `${this.textSize}px`;
            this.textElement.style.fontSize = `${this.textSize}px`;
        });

        // Translation controls
        if (this.translateBtn) {
            this.translateBtn.addEventListener('click', () => this.translateContent());
        }

        // Control buttons
        this.pauseBtn.addEventListener('click', () => this.toggleScrolling());
        this.resetBtn.addEventListener('click', () => this.resetPosition());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.toggleControls.addEventListener('click', () => this.toggleControlsVisibility());

        // Edit content
        this.textElement.addEventListener('dblclick', () => this.openEditor());
        this.saveContentBtn.addEventListener('click', () => this.saveContent());
        this.cancelEditBtn.addEventListener('click', () => this.closeEditor());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.toggleScrolling();
                    break;
                case 'KeyR':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.resetPosition();
                    }
                    break;
                case 'KeyF':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleFullscreen();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.adjustSpeed(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.adjustSpeed(-0.1);
                    break;
                case 'Equal':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.adjustTextSize(2);
                    }
                    break;
                case 'Minus':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.adjustTextSize(-2);
                    }
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            this.updateFullscreenButton();
        });

        // Auto-hide controls
        let hideTimeout;
        document.addEventListener('mousemove', () => {
            this.controls.style.opacity = '1';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                if (document.fullscreenElement && !this.controls.classList.contains('visible')) {
                    this.controls.style.opacity = '0.1';
                }
            }, 3000);
        });

        // Handle manual scrolling
        let isScrolling = false;
        this.container.addEventListener('scroll', () => {
            if (!this.isScrolling && !isScrolling) {
                isScrolling = true;
                this.stopScrolling();
                
                // Reset to top or bottom based on scroll position
                const scrollTop = this.container.scrollTop;
                const scrollHeight = this.container.scrollHeight;
                const clientHeight = this.container.clientHeight;
                
                // If near bottom, reset to top
                if (scrollTop + clientHeight >= scrollHeight - 10) {
                    this.resetPosition();
                }
                
                // Reset flag after a short delay
                setTimeout(() => {
                    isScrolling = false;
                }, 100);
            }
        });
    }

    /**
     * Start scrolling animation
     */
    startScrolling() {
        this.isScrolling = true;
        this.pauseBtn.innerHTML = '⏸️ Pause';
        // Reset position when starting playback to ensure we start from the top
        this.resetPosition();
        this.animate();
    }

    /**
     * Stop scrolling animation
     */
    stopScrolling() {
        this.isScrolling = false;
        this.pauseBtn.innerHTML = '▶️ Play';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    /**
     * Toggle scrolling state
     */
    toggleScrolling() {
        if (this.isScrolling) {
            this.stopScrolling();
        } else {
            this.startScrolling();
        }
    }

    /**
     * Animation loop for smooth scrolling
     */
    animate() {
        if (!this.isScrolling) return;

        this.scrollPosition += this.scrollSpeed * 0.5;
        this.container.scrollTop = this.scrollPosition;

        // Check if we've scrolled past the content
        const textHeight = this.textElement.scrollHeight;
        const containerHeight = this.container.clientHeight;
        
        if (this.scrollPosition > textHeight) {
            this.resetPosition();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Reset scroll position to top
     */
    resetPosition() {
        this.scrollPosition = 0;
        this.container.scrollTop = 0;
    }

    /**
     * Adjust scroll speed
     */
    adjustSpeed(delta) {
        const newSpeed = Math.max(0.1, Math.min(10, this.scrollSpeed + delta));
        this.scrollSpeed = newSpeed;
        this.speedSlider.value = newSpeed;
        this.speedDisplay.textContent = newSpeed.toFixed(1);
    }

    /**
     * Adjust text size
     */
    adjustTextSize(delta) {
        const newSize = Math.max(16, Math.min(72, this.textSize + delta));
        this.textSize = newSize;
        this.sizeSlider.value = newSize;
        this.sizeDisplay.textContent = `${newSize}px`;
        this.textElement.style.fontSize = `${newSize}px`;
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Update fullscreen button text
     */
    updateFullscreenButton() {
        if (document.fullscreenElement) {
            this.fullscreenBtn.innerHTML = '🔍 Exit Fullscreen';
        } else {
            this.fullscreenBtn.innerHTML = '🔍 Fullscreen';
        }
    }

    /**
     * Toggle controls visibility
     */
    toggleControlsVisibility() {
        this.controls.classList.toggle('visible');
        if (this.controls.classList.contains('visible')) {
            this.controls.style.opacity = '1';
        }
    }

    /**
     * Open content editor
     */
    openEditor() {
        this.contentEditor.value = this.textElement.textContent;
        this.editOverlay.classList.remove('hidden');
        this.stopScrolling();
    }

    /**
     * Save edited content
     */
    saveContent() {
        const content = this.contentEditor.value;
        this.setContent(content);
        this.originalContent = content; // Update original content
        chrome.storage.local.set({ generatedContent: content });
        this.closeEditor();
    }

    /**
     * Close content editor
     */
    closeEditor() {
        this.editOverlay.classList.add('hidden');
    }

    /**
     * Translate content using Chrome's Translator API
     */
    async translateContent() {
        const targetLanguage = this.languageSelect.value;
        
        // If no language selected or original language, show original content
        if (!targetLanguage) {
            this.setContent(this.originalContent);
            return;
        }

        // Show loading message
        this.textElement.innerHTML = '<div class="loading-message"><p>Translating content...</p></div>';

        try {
            // Check if Translator API is available using the correct access pattern
            if (!('Translator' in self)) {
                throw new Error('Translator API is not available in this browser. Please make sure you are using Chrome 138 or later and have enabled the Translator API flag in chrome://flags/.');
            }

            // Detect source language
            let sourceLanguage = 'en'; // Default to English
            if ('LanguageDetector' in self) {
                try {
                    const detector = await LanguageDetector.create();
                    const detectionResult = await detector.detect(this.originalContent.trim());
                    if (detectionResult && detectionResult.length > 0) {
                        sourceLanguage = detectionResult[0].detectedLanguage;
                    }
                } catch (detectionError) {
                    console.warn('Language detection failed, using default English:', detectionError);
                }
            }

            // Check availability for the specific language pair
            const availability = await Translator.availability({ sourceLanguage, targetLanguage });
            if (availability === 'unavailable') {
                const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
                const sourceLanguageName = displayNames.of(sourceLanguage) || sourceLanguage;
                const targetLanguageName = displayNames.of(targetLanguage) || targetLanguage;
                throw new Error(`${sourceLanguageName} to ${targetLanguageName} translation is not supported.`);
            }

            if (availability !== 'readily' && availability !== 'downloadable') {
                throw new Error('Translator API is not ready. Please check that the required flags are enabled in chrome://flags/.');
            }

            // Create translation session
            const session = await Translator.create({ 
                sourceLanguage, 
                targetLanguage 
            });

            // Translate content
            const translatedContent = await session.translate(this.originalContent);
            
            // Set translated content
            this.setContent(translatedContent);
        } catch (error) {
            console.error('Translation error:', error);
            this.textElement.innerHTML = `<div class="loading-message"><p>Error translating content: ${error.message}</p><p>Showing original content instead.</p></div>`;
            this.setContent(this.originalContent);
        }
    }
}

// Initialize teleprompter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Teleprompter();
});