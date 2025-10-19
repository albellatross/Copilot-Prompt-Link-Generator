# Copilot Prompt Link Generator

🤖 A lightweight web tool for batch-generating clickable Copilot chat links from prompts.

## 🌐 Live Demo

**[Try it now!](https://albellatross.github.io/Copilot-Prompt-Link-Generator/)**

> 📝 Note: If you see a 404 error, GitHub Pages might still be setting up. Please wait a few minutes and try again, or check the repository settings to enable GitHub Pages.

## Features

- **Batch Processing**: Generate up to 10 Copilot links at once
- **One-Click Access**: Each link opens a new Copilot chat with pre-filled prompts
- **Batch Opening**: Open all generated links in new tabs with one click
- **Copy to Clipboard**: Copy all generated links with one click
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Live line counting and input validation
- **Keyboard Shortcuts**: Ctrl/Cmd + Enter to generate, Ctrl/Cmd + Shift + L to clear

## How to Use

1. **Open the Tool**: Open `index.html` in any modern web browser
2. **Enter Prompts**: Paste or type your prompts (one per line, up to 10)
3. **Generate Links**: Click "✨ Generate Links" or use Ctrl/Cmd + Enter
4. **Use Links**: 
   - Click individual links to open specific Copilot chats
   - Click "🚀 Open All Links" to open all prompts in separate tabs
5. **Copy All**: Use "📋 Copy All Links" to copy the formatted list to clipboard

## Example

**Input:**
```
Generate a product landing page for a fitness app
Write a 3-minute bedtime story for children
Design a modern AI chatbot interface
Create a weekly meal plan for vegetarians
Explain quantum computing in simple terms
```

**Output:**
```
1. Generate a product landing page for a fitness app
   → https://copilot.microsoft.com/chats/new?q=Generate%20a%20product%20landing%20page%20for%20a%20fitness%20app

2. Write a 3-minute bedtime story for children
   → https://copilot.microsoft.com/chats/new?q=Write%20a%203-minute%20bedtime%20story%20for%20children

... (and so on)
```

## Technical Details

- **Frontend Only**: Pure HTML, CSS, and JavaScript - no backend required
- **Browser Compatibility**: Works with Chrome, Safari, Firefox, and Edge
- **Security**: No data storage or external API calls
- **URL Encoding**: Automatic encoding for special characters in prompts

## File Structure

```
copilot-prompt-link-generator/
├── index.html          # Main HTML page
├── style.css           # Styling and responsive design
├── script.js           # Core JavaScript functionality
└── README.md           # This documentation
```

## Installation

### Option 1: Use Online (Recommended)
🌐 **[Open Live Demo](https://albellatross.github.io/Copilot-Prompt-Link-Generator/)**

### Option 2: Download and Use Locally
1. Download the latest release or clone this repository
2. Open `index.html` in your web browser
3. Start using immediately!

### Option 3: Local Development Server
```bash
git clone https://github.com/albellatross/Copilot-Prompt-Link-Generator.git
cd Copilot-Prompt-Link-Generator
python -m http.server 8000
# Then visit: http://localhost:8000
```

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Generate links
- **Ctrl/Cmd + Shift + L**: Clear all content
- **Tab**: Navigate between elements
- **Enter** (on buttons): Activate button

## Browser Requirements

- Modern browser with JavaScript enabled
- Support for:
  - ES6+ JavaScript features
  - CSS Grid and Flexbox
  - Clipboard API (for copy functionality)

## Privacy & Security

- ✅ No data collection or tracking
- ✅ No external API calls
- ✅ No local storage of prompts
- ✅ All processing happens in your browser
- ✅ Safe for sensitive prompts

## Contributing

This is a static web tool. To contribute:

1. Fork the repository
2. Make your changes
3. Test thoroughly across browsers
4. Submit a pull request

## License

MIT License - feel free to use, modify, and distribute.

## Changelog

### v1.1.0 (Latest)
- ✨ **New Feature**: "Open All Links" button for batch opening
- 🛡️ Popup blocker detection and user confirmation
- ⚡ Smart tab opening with delay to prevent browser blocking
- 🎨 Enhanced UI with improved button layout
- 📱 Better mobile responsiveness for new features

### v1.0.0 (Initial Release)
- Core link generation functionality
- Responsive design for all devices
- Copy to clipboard feature
- Input validation and error handling
- Keyboard shortcuts
- Accessibility improvements

## FAQ

**Q: Why is there a 10-prompt limit?**
A: To maintain optimal user experience and prevent overwhelming output.

**Q: Can I use this offline?**
A: Yes! Download the files and open `index.html` locally.

**Q: Do the generated links work indefinitely?**
A: Yes, as long as Microsoft Copilot maintains the same URL structure.

**Q: What should I do if I see "Failed to open link" errors?**
A: The tool now automatically detects this issue and offers three solutions:
1. Instructions to enable popups in your browser
2. Sequential opening (click buttons one by one)
3. Copy all links to open manually

**Q: Can I modify the tool for other chat services?**
A: Absolutely! Edit the `copilotBaseUrl` in `script.js` to point to any compatible service.

**Q: Why doesn't "Open All Links" work?**
A: This is usually caused by browser popup blockers. The tool now provides multiple solutions:
- Automatic popup blocker detection and solutions
- Step-by-step instructions to enable popups
- Alternative "sequential open" method
- Fallback to copy links for manual opening

**Q: How do I enable popups for this site?**
A: Look for a popup blocked icon in your browser's address bar and click it to allow popups for this site.

**Q: Can I open all links at once safely?**
A: Yes! The tool now tries multiple methods and provides user-friendly alternatives if the browser blocks popups.

---

Built with ❤️ for prompt engineers and designers