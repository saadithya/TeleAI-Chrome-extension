# AI Teleprompter Chrome Extension

A powerful Chrome extension that combines AI-generated content with a smooth teleprompter interface. Perfect for content creators, speakers, and presenters who need professional teleprompter functionality with AI assistance.

## Features

### AI Content Generation
- **Built-in AI**: Uses Chrome's built-in AI (Gemini Nano) - no API keys required!
- **Custom Prompts**: Generate content based on any prompt you provide
- **Word Count Control**: Specify exactly how many words you need (up to 5000)
- **Local Processing**: All AI processing happens locally on your device

### Professional Teleprompter
- **Smooth Scrolling**: Buttery-smooth text scrolling with precise speed control
- **Real-time Adjustments**: Change speed and text size on the fly
- **Pause/Resume**: Space bar to pause/resume, perfect for natural breaks
- **Fullscreen Mode**: Distraction-free presenting experience
- **Customizable Appearance**: Adjust colors, fonts, and layout to your preference

### Advanced Controls
- **Speed Control**: Fine-tune scrolling speed from 0.5x to 10x
- **Text Size**: Adjust from 16px to 72px for perfect readability
- **Keyboard Shortcuts**: Professional hotkeys for seamless operation
- **Auto-hide Controls**: Controls fade away in fullscreen for clean presenting
- **Content Editing**: Double-click to edit content on the fly

### Smart Storage
- **Persistent Settings**: All preferences saved automatically
- **Content Backup**: Generated content is stored for later use
- **Cross-device Sync**: Settings sync across all your Chrome instances

## Installation

1. **Download the Extension**
   - Download all files from this project
   - All files should be in a single folder (no subfolders)

2. **Load into Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the folder containing all extension files
   - The extension should now appear in your extensions list

3. **Enable Built-in AI (Required)**
   - Chrome's built-in AI requires Chrome version 138 or later
   - Open Chrome and go to `chrome://flags/`
   - Search for "AI" or "Prompt API"
   - Enable the following flags:
     - "Chrome built-in AI Early Preview Program"
     - "Prompt API"
     - "Built-in AI"
   - Restart Chrome after enabling the flags


## Setup

### Requirements
- **Chrome Version**: Chrome 138 or later with built-in AI support
- **Internet Connection**: For initial model download (subsequent usage works offline)

### Usage

1. **Generate Content**:
   - Enter your prompt (e.g., "Write a presentation about renewable energy")
   - Set desired word count (50-5000 words)
   - Click "Generate Content"

2. **Use Teleprompter**:
   - Click "Open Teleprompter" to open the display
   - Adjust speed and text size using the controls
   - Press Space to pause/resume
   - Press F11 or click fullscreen for presenting

3. **Keyboard Shortcuts**:
   - `Space`: Pause/Resume scrolling
   - `↑/↓ Arrow`: Adjust speed
   - `Ctrl/Cmd + Plus/Minus`: Adjust text size
   - `Ctrl/Cmd + R`: Reset position
   - `Ctrl/Cmd + F`: Toggle fullscreen
   - `Escape`: Exit fullscreen

## File Structure

```
ai-teleprompter/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.js              # Popup logic and AI integration
├── options.html          # Settings page
├── options.js            # Settings management
├── teleprompter.html     # Teleprompter display
├── teleprompter.js       # Teleprompter functionality
├── styles.css            # All styling
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Technical Details

- **Manifest V3**: Uses the latest Chrome extension standard
- **Vanilla JavaScript**: No external dependencies for fast loading
- **Chrome APIs**: Leverages chrome.storage.sync for secure, persistent data
- **Modern CSS**: Responsive design with smooth animations
- **Built-in AI Integration**: Uses Chrome's Prompt API for local AI processing
- **Security**: All processing happens locally, no data leaves your device

## Privacy & Security

- **Local Processing**: All AI processing happens on your device
- **No Data Collection**: Your prompts and content never leave your browser
- **No API Keys**: No need to manage or store external API keys
- **Secure Communication**: All processing is local to your device

## Troubleshooting

### Common Issues:

**"Built-in AI is not available"**
- Make sure you're using Chrome 138 or later
- Check that built-in AI is enabled in Chrome flags (`chrome://flags/`)
- Look for and enable flags related to "AI", "Prompt API", or "Built-in AI"
- Restart Chrome after enabling the flags

**Content not generating**
- Check your internet connection for initial model download
- Try a shorter prompt or reduce word count

**Teleprompter not scrolling**
- Press Space to resume if paused
- Check if speed is set to 0
- Try refreshing the teleprompter page

**Settings not saving**
- Make sure Chrome sync is enabled
- Check if you have sufficient storage quota
- Try clearing extension data and reconfiguring

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Ensure you're using Chrome 138 or later
3. Verify built-in AI is enabled in Chrome settings (`chrome://flags/`)
4. Try refreshing the extension pages

## License

This project is open source and available under the MIT License.

---

**Made for content creators, by content creators.** 🎬✨