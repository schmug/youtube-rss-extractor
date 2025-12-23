# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube RSS Extractor is a Chrome extension (Manifest V3) that extracts RSS feed URLs from YouTube channel and video pages, with features including feed caching, quick actions for RSS readers, and a settings page.

## Architecture

### Files
- **manifest.json**: Manifest V3 extension config with CSP, permissions, and keyboard shortcuts
- **background.js**: Service worker for update notifications and installation handling
- **content.js**: Programmatically injected into YouTube pages to extract channel ID (with retry/MutationObserver)
- **popup.js**: Extension popup UI (vanilla JS), injects content script, manages cache, and displays RSS
- **index.html** / **styles.css**: Popup markup and styling with accessibility features
- **options.html** / **options.js**: Settings page for customization (videos shown, cache duration)
- **icons/**: Extension icons (16, 48, 128px PNG)
- **__tests__/**: Jest test suite for utility functions and validation logic

### Execution Flow
1. User clicks extension icon on a YouTube page (or uses Ctrl+Shift+R keyboard shortcut)
2. `popup.js` uses `chrome.scripting.executeScript()` to inject `content.js`
3. `content.js` scans DOM for channel ID with retry logic and MutationObserver (waits for dynamic content)
4. Returns channel data, or special error codes (PLAYLIST, YOUTUBE_MUSIC) for unsupported pages
5. `popup.js` checks cache (chrome.storage.local) for previously fetched RSS feed
6. If cache valid, displays cached feed; otherwise fetches/parses RSS XML from YouTube
7. Displays channel info, RSS URL with copy button, quick action buttons, and latest videos

### Permissions
- **activeTab**: Temporary access to current YouTube tab when extension is clicked
- **scripting**: Programmatic injection of content.js
- **storage**: RSS feed caching and user settings persistence

Note: Uses programmatic injection with `activeTab` permission instead of declarative content scripts to avoid Chrome Web Store host permission review delays.

## Key Implementation Details

### Channel ID Extraction (content.js)
Uses a priority-ordered strategy with retry mechanism:
1. **Dynamic DOM elements** (with MutationObserver fallback for SPA transitions):
   - Video owner links, shorts overlay
   - Waits up to 3 seconds for elements to load
2. **RSS `<link>` meta tags** (on channel pages)
3. **Script data search** for `"channelId":"UC..."` (universal fallback)

### Special Page Detection
- **Playlists**: Returns `error: 'PLAYLIST'` - playlists don't have RSS feeds
- **YouTube Music**: Returns `error: 'YOUTUBE_MUSIC'` - not supported, directs to youtube.com

### Security Measures
- **XSS Prevention**: `escapeHtml()` and `escapeAttr()` functions sanitize all user-facing content
- **URL Validation**: Uses `URL()` constructor to validate URLs, only allows http/https protocols
- **CSP Compliance**: No inline styles (uses CSS classes), no eval/unsafe operations
- **DOM API Usage**: Builds elements programmatically instead of innerHTML where possible

### RSS Feed Caching
- Stores feeds in `chrome.storage.local` with timestamp
- Default cache expiry: 5 minutes (configurable in settings)
- Cache key: RSS URL
- Improves performance and reduces YouTube API load

### Quick Actions
One-click buttons to add RSS feed to popular readers:
- **Feedly**: `feedly.com/i/subscription/feed/{rss_url}`
- **Inoreader**: `inoreader.com/?add_feed={rss_url}`
- **NewsBlur**: `newsblur.com/?url={rss_url}`

### Settings Page
- **Videos to Show**: 5-50 (default: 10)
- **Cache Duration**: 1-60 minutes (default: 5)
- Settings stored in `chrome.storage.sync` (syncs across devices)

### Update Notifications
- Background service worker detects install/update events
- Sets default settings on first install
- Opens options page on installation
- Stores update info for future notification display

### Accessibility
- ARIA labels on interactive elements
- Proper alt text for images
- Keyboard navigation support
- Screen reader friendly

## Development

### Loading as Chrome Extension

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

No build step required - the extension runs directly from source files.

### Testing

Run the test suite:
```bash
npm install
npm test
```

### Linting & Formatting

```bash
npm run lint          # Check for code issues
npm run format        # Auto-format code
npm run format:check  # Check formatting
```

### Code Standards
- **EditorConfig**: Consistent indentation and line endings
- **Prettier**: Automated code formatting
- **ESLint**: JavaScript linting with recommended rules

## Project Structure

```
youtube-rss-extractor/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker (updates, commands)
├── content.js          # Channel extraction with retry logic
├── popup.js            # Popup UI with caching
├── index.html          # Popup markup
├── options.js          # Settings page logic
├── options.html        # Settings page markup
├── styles.css          # Popup styling
├── package.json        # Dev dependencies
├── jest.config.js      # Test configuration
├── .eslintrc.json      # Linting rules
├── .prettierrc         # Formatting rules
├── .editorconfig       # Editor configuration
├── __tests__/          # Test files
│   └── utils.test.js
└── icons/              # Extension icons
```

## Common Tasks

### Adding a New Feature
1. Update relevant JS file(s)
2. Add tests in `__tests__/`
3. Update this CLAUDE.md if architecture changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`

### Updating Styles
1. Edit `styles.css` (never use inline styles - CSP violation)
2. Use existing CSS variables for consistency
3. Test in popup and options page

### Modifying Settings
1. Update options.html/options.js for UI
2. Update popup.js to read new settings
3. Add default values in background.js `onInstalled`
4. Update settings validation in options.js
