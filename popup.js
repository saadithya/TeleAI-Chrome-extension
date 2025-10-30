// Popup script for TeleAI Chrome Extension

// DOM elements
let promptInput, wordCount, generateBtn, teleprompterBtn, settingsBtn, status, preview, previewText;
let cancelBtn = null;
let generationTimeout = null;
let abortController = null;

// Initialize when DOM is loaded
function initialize() {
    // Get DOM elements
    promptInput = document.getElementById('promptInput');
    wordCount = document.getElementById('wordCount');
    generateBtn = document.getElementById('generateBtn');
    teleprompterBtn = document.getElementById('teleprompterBtn');
    settingsBtn = document.getElementById('settingsBtn');
    status = document.getElementById('status');
    preview = document.getElementById('preview');
    previewText = document.getElementById('previewText');

    // Load saved preferences
    loadPreferences();
    // Check for ongoing generation
    checkOngoingGeneration();

    // Event listeners with defensive checks
    if (generateBtn) generateBtn.addEventListener('click', generateContent);
    if (teleprompterBtn) teleprompterBtn.addEventListener('click', openTeleprompter);
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
}

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    // DOM is already loaded
    initialize();
}

/**
 * Load user preferences from storage
 */
function loadPreferences() {
    chrome.storage.sync.get(['lastPrompt', 'wordCount'], (result) => {
        if (result.lastPrompt && promptInput) {
            promptInput.value = result.lastPrompt;
        }
        if (result.wordCount && wordCount) {
            wordCount.value = result.wordCount;
        }
    });
}

/**
 * Save user preferences to storage
 */
function savePreferences() {
    if (promptInput && wordCount) {
        chrome.storage.sync.set({
            lastPrompt: promptInput.value,
            wordCount: wordCount.value
        });
    }
}

/**
 * Check for ongoing generation process
 */
function checkOngoingGeneration() {
    chrome.storage.local.get(['isGenerating', 'generationStatus'], (result) => {
        if (result.isGenerating && status) {
            // Show the ongoing generation status
            showStatus(result.generationStatus || 'Generating content with built-in AI...', 'loading');
            // Disable the generate button and add cancel button
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.textContent = 'Generating...';
                addCancelButton();
            }
        }
    });
}

/**
 * Add cancel button during generation
 */
function addCancelButton() {
    // Remove existing cancel button if any
    if (cancelBtn) {
        cancelBtn.remove();
    }
    
    // Create cancel button
    cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelBtn';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.marginLeft = '10px';
    cancelBtn.addEventListener('click', cancelGeneration);
    
    // Add cancel button next to generate button
    if (generateBtn && generateBtn.parentNode) {
        generateBtn.parentNode.appendChild(cancelBtn);
    }
}

/**
 * Remove cancel button
 */
function removeCancelButton() {
    if (cancelBtn) {
        cancelBtn.remove();
        cancelBtn = null;
    }
}

/**
 * Set generation state in storage
 */
function setGenerationState(isGenerating, statusMessage = '') {
    chrome.storage.local.set({
        isGenerating: isGenerating,
        generationStatus: statusMessage
    });
}

/**
 * Cancel ongoing generation
 */
function cancelGeneration() {
    // Abort any ongoing AI requests
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    
    // Clear any existing timeout
    if (generationTimeout) {
        clearTimeout(generationTimeout);
        generationTimeout = null;
    }
    
    // Update UI
    if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Content';
    }
    
    // Remove cancel button
    removeCancelButton();
    
    // Clear generation state
    setGenerationState(false);
    
    // Show cancellation message
    showStatus('Generation cancelled by user.', 'error');
    
    // Clear timeout after 3 seconds
    setTimeout(() => {
        if (status) {
            status.classList.add('hidden');
        }
    }, 3000);
}

/**
 * Generate content using Chrome's built-in AI
 */
async function generateContent() {
    if (!promptInput || !wordCount || !generateBtn) return;
    
    const prompt = promptInput.value.trim();
    const words = parseInt(wordCount.value);

    if (!prompt) {
        showStatus('Please enter a prompt', 'error');
        return;
    }

    // Save current preferences
    savePreferences();

    // Create abort controller for cancellation
    abortController = new AbortController();

    // Set generation state
    setGenerationState(true, 'Generating content with built-in AI...');

    // Show loading state and add cancel button
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    addCancelButton();
    showStatus('Generating content with built-in AI...', 'loading');

    try {
        // Debug information
        console.log('Checking for AI availability...');
        console.log('window object:', window);
        console.log('window.ai:', window.ai);
        console.log('LanguageModel:', typeof LanguageModel);
        console.log('Is LanguageModel undefined?', typeof LanguageModel === 'undefined');
        
        // Check if built-in AI is available using the official approach
        if (('ai' in window) && window.ai.languageModel) {
            console.log('Using window.ai approach');
            const ai = window.ai;
            
            // Check model availability with expectedOutputs parameter
            let availability;
            try {
                console.log('Checking availability with window.ai...');
                availability = await ai.languageModel.availability({
                    expectedOutputs: [
                        { type: "text", languages: ["en"] }
                    ]
                });
                console.log('Model availability:', availability);
                
                // If model needs to be downloaded, inform user
                if (availability === 'downloadable') {
                    setGenerationState(true, 'Downloading AI model... This may take a few minutes.');
                    showStatus('Downloading AI model... This may take a few minutes.', 'loading');
                } else if (availability === 'downloading') {
                    setGenerationState(true, 'AI model is currently downloading... Please wait.');
                    showStatus('AI model is currently downloading... Please wait.', 'loading');
                } else if (availability === 'unavailable') {
                    throw new Error('AI model is not available on this device. Please check hardware requirements.');
                }
            } catch (availabilityError) {
                console.log('Availability check failed:', availabilityError);
                throw new Error('Failed to check AI model availability: ' + availabilityError.message);
            }

            // Create AI session using the window.ai approach
            let session;
            try {
                console.log('Creating AI session...');
                setGenerationState(true, 'Creating AI session...');
                showStatus('Creating AI session...', 'loading');
                session = await ai.languageModel.create({
                    systemPrompt: `You are a helpful assistant that generates content for teleprompter use. Please write approximately ${words} words. Format the content for teleprompter use with clear paragraphs. Make the content engaging and suitable for speech delivery.`
                });
                console.log('AI session created successfully');
            } catch (creationError) {
                console.error('Failed to create AI session:', creationError);
                throw new Error('Failed to initialize AI session. Please check that the AI model is properly downloaded and try again. Error: ' + creationError.message);
            }

            // Generate content with timeout and abort signal
            try {
                console.log('Generating content with prompt:', prompt);
                setGenerationState(true, 'Generating content... This may take a moment. Please don\'t close this popup till generation is complete.');
                showStatus('Generating content... This may take a moment. Please don\'t close this popup till generation is complete.', 'loading');
                
                // Set a timeout for the generation
                const content = await Promise.race([
                    session.prompt(prompt),
                    new Promise((_, reject) => {
                        generationTimeout = setTimeout(() => {
                            reject(new Error('AI generation timed out after 2 minutes. This is normal for complex prompts or when the model is still initializing.'));
                        }, 120000); // 2 minute timeout
                    })
                ]);
                
                console.log('Content generated successfully:', content);
                
                // Clear the timeout
                if (generationTimeout) {
                    clearTimeout(generationTimeout);
                    generationTimeout = null;
                }

                // Save generated content for teleprompter
                await chrome.storage.local.set({ generatedContent: content });

                // Show preview
                if (previewText && preview) {
                    previewText.textContent = content;
                    preview.classList.remove('hidden');
                }
                setGenerationState(false);
                removeCancelButton();
                showStatus('Content generated successfully!', 'success');
            } catch (promptError) {
                console.error('Failed to generate content:', promptError);
                
                // Clear the timeout
                if (generationTimeout) {
                    clearTimeout(generationTimeout);
                    generationTimeout = null;
                }
                
                setGenerationState(false);
                removeCancelButton();
                throw new Error('Failed to generate content: ' + promptError.message);
            }
        } else if (typeof LanguageModel !== 'undefined') {
            console.log('Using LanguageModel approach');
            // Use the LanguageModel approach
            // Check model availability with expectedOutputs parameter
            let availability;
            try {
                console.log('Checking availability with LanguageModel...');
                availability = await LanguageModel.availability({
                    expectedOutputs: [
                        { type: "text", languages: ["en"] }
                    ]
                });
                console.log('Model availability:', availability);
                
                // If model needs to be downloaded, inform user
                if (availability === 'downloadable') {
                    setGenerationState(true, 'Downloading AI model... This may take a few minutes.');
                    showStatus('Downloading AI model... This may take a few minutes.', 'loading');
                } else if (availability === 'downloading') {
                    setGenerationState(true, 'AI model is currently downloading... Please wait.');
                    showStatus('AI model is currently downloading... Please wait.', 'loading');
                } else if (availability === 'unavailable') {
                    throw new Error('AI model is not available on this device. Please check hardware requirements.');
                }
            } catch (availabilityError) {
                console.log('Availability check failed:', availabilityError);
                throw new Error('Failed to check AI model availability: ' + availabilityError.message);
            }

            // Create AI session using the official approach with outputLanguage parameter and temperature/topK
            let session;
            try {
                console.log('Creating LanguageModel session...');
                setGenerationState(true, 'Creating AI session...');
                showStatus('Creating AI session...', 'loading');
                
                // Get model parameters
                const params = await LanguageModel.params();
                console.log('Model parameters:', params);
                
                session = await LanguageModel.create({
                    systemPrompt: `You are a helpful assistant that generates content for teleprompter use. Please write approximately ${words} words. Format the content for teleprompter use with clear paragraphs. Make the content engaging and suitable for speech delivery.`,
                    outputLanguage: "en",       // 👈 explicitly tell the API what language to use
                    expectedInputs: [
                        { type: "text", languages: ["en"] }
                    ],
                    expectedOutputs: [
                        { type: "text", languages: ["en"] }
                    ],
                    // Add temperature and topK parameters
                    temperature: params.defaultTemperature || 1,
                    topK: params.defaultTopK || 3,
                    monitor: (monitor) => {
                        monitor.addEventListener('downloadprogress', (e) => {
                            const progress = Math.round(e.loaded * 100);
                            setGenerationState(true, `Downloading AI model: ${progress}%`);
                            showStatus(`Downloading AI model: ${progress}%`, 'loading');
                        });
                    }
                });
                console.log('LanguageModel session created successfully');
            } catch (creationError) {
                console.error('Failed to create LanguageModel session:', creationError);
                
                // Clear the timeout
                if (generationTimeout) {
                    clearTimeout(generationTimeout);
                    generationTimeout = null;
                }
                
                setGenerationState(false);
                removeCancelButton();
                throw new Error('Failed to initialize AI session. Please check that the AI model is properly downloaded and try again. Error: ' + creationError.message);
            }

            // Generate content with language specification and timeout
            try {
                console.log('Generating content with prompt:', prompt);
                setGenerationState(true, 'Generating content... This may take up to 2 minutes. Please don\'t close this popup till generation is complete.');
                showStatus('Generating content... This may take up to 2 minutes. Please don\'t close this popup till generation is complete.', 'loading');
                console.log('About to call session.prompt with prompt and options');
                
                // Set a timeout for the generation
                const content = await Promise.race([
                    session.prompt(prompt, { outputLanguage: "en" }),
                    new Promise((_, reject) => {
                        generationTimeout = setTimeout(() => {
                            reject(new Error('AI generation timed out after 2 minutes. This is normal for complex prompts or when the model is still initializing.'));
                        }, 120000); // 2 minute timeout
                    })
                ]);
                
                console.log('Content generated successfully:', content);
                console.log('Content type:', typeof content);
                console.log('Content length:', content ? content.length : 'null/undefined');
                
                // Clear the timeout
                if (generationTimeout) {
                    clearTimeout(generationTimeout);
                    generationTimeout = null;
                }

                // Save generated content for teleprompter
                await chrome.storage.local.set({ generatedContent: content });

                // Show preview
                if (previewText && preview) {
                    previewText.textContent = content;
                    preview.classList.remove('hidden');
                }
                setGenerationState(false);
                removeCancelButton();
                showStatus('Content generated successfully!', 'success');
            } catch (promptError) {
                console.error('Failed to generate content:', promptError);
                console.error('Prompt error stack:', promptError.stack);
                
                // Clear the timeout
                if (generationTimeout) {
                    clearTimeout(generationTimeout);
                    generationTimeout = null;
                }
                
                setGenerationState(false);
                removeCancelButton();
                throw new Error('Failed to generate content: ' + promptError.message);
            }
        } else {
            console.log('AI not available - neither window.ai nor LanguageModel found');
            
            // Clear the timeout
            if (generationTimeout) {
                clearTimeout(generationTimeout);
                generationTimeout = null;
            }
            
            setGenerationState(false);
            removeCancelButton();
            throw new Error('Built-in AI is not available in this browser. Please make sure you are using Chrome 138 or later and have enabled the built-in AI flags in chrome://flags/. Also check that you have added the origin trial token to your manifest.json file.');
        }

    } catch (error) {
        console.error('Generation error:', error);
        console.error('Generation error stack:', error.stack);
        
        // Clear the timeout
        if (generationTimeout) {
            clearTimeout(generationTimeout);
            generationTimeout = null;
        }
        
        // Clear abort controller
        if (abortController) {
            abortController = null;
        }
        
        setGenerationState(false);
        removeCancelButton();
        showStatus(`Error: ${error.message}`, 'error');
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Content';
        }
        
        // Clear abort controller
        if (abortController) {
            abortController = null;
        }
    }
}

/**
 * Open teleprompter in new tab
 */
function openTeleprompter() {
    if (chrome.runtime && chrome.runtime.getURL) {
        chrome.tabs.create({
            url: chrome.runtime.getURL('teleprompter.html')
        });
    }
}

/**
 * Open settings page
 */
function openSettings() {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    if (!status) return;
    
    status.textContent = message;
    status.className = `status ${type}`;
    status.classList.remove('hidden');

    // Auto-hide after 3 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
}

// Clean up when popup is closed
window.addEventListener('beforeunload', () => {
    console.log('Popup is closing');
    // Clear any existing timeout
    if (generationTimeout) {
        clearTimeout(generationTimeout);
        generationTimeout = null;
    }
    
    // Abort any ongoing requests
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
});