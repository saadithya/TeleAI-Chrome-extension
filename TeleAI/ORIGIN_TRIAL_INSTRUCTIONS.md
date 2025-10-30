# Origin Trial Registration Instructions

The Chrome Prompt API is currently in origin trial, which means you need to register to use it in your extension.

## Steps to Register for the Origin Trial

1. **Find the Prompt API Origin Trial**
   - Visit the [Chrome Origin Trials](https://developer.chrome.com/origintrials/) page
   - Look for the "Prompt API" trial

2. **Determine Your Extension ID**
   - Load your extension in Chrome Developer Mode first
   - Chrome will generate an extension ID for you
   - You can find the ID on the `chrome://extensions/` page

3. **Register for the Trial**
   - Click "Register" on the Prompt API origin trial page
   - Enter your extension origin in the format: `chrome-extension://YOUR_EXTENSION_ID`
   - Complete the registration form

4. **Add the Trial Token to Your Manifest**
   - After registration, you'll receive a trial token
   - Add it to your manifest.json file like this:

```json
{
  "manifest_version": 3,
  "name": "AI Teleprompter",
  "version": "1.0.0",
  "description": "AI-powered teleprompter with adjustable speed and text size",
  "minimum_chrome_version": "138",
  "permissions": [
    "storage"
  ],
  "host_permissions": [
    "https://api.gumroad.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "AI Teleprompter"
  },
  "options_page": "options.html",
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  },
  "trial_tokens": [
    "YOUR_ACTUAL_TRIAL_TOKEN_GOES_HERE"
  ]
}
```

5. **Reload Your Extension**
   - Go to `chrome://extensions/`
   - Click the refresh icon for your extension
   - Test the AI functionality

## Alternative: Use Chrome 138+ with Flags

If you're using Chrome 138 or later, you can also enable the Prompt API through Chrome flags instead of using an origin trial token:

1. Go to `chrome://flags/`
2. Enable these flags:
   - "Chrome built-in AI Early Preview Program"
   - "Prompt API"
   - "Built-in AI"
3. Restart Chrome
4. The AI functionality should work without an origin trial token

## Troubleshooting

If you're still having issues:

1. Make sure you're using Chrome 138 or later
2. Verify that all required flags are enabled
3. Check that you have sufficient system resources (16GB RAM + 4 cores or GPU with 4GB+ VRAM)
4. Ensure you have at least 22GB of free disk space
5. Check the console for any error messages