# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube RSS Extractor is a Chrome extension (Manifest V3) that extracts RSS feed URLs from YouTube channel and video pages.

## Architecture

### Files
- **manifest.json**: Manifest V3 extension config with CSP
- **content.js**: Programmatically injected into YouTube pages to extract channel ID
- **popup.js**: Extension popup UI (vanilla JS), injects content script and displays RSS
- **index.html** / **styles.css**: Popup markup and styling
- **icons/**: Extension icons (16, 48, 128px PNG)

### Execution Flow
1. User clicks extension icon on a YouTube page
2. `popup.js` uses `chrome.scripting.executeScript()` to inject `content.js`
3. `content.js` scans DOM for channel ID and returns data directly (IIFE pattern)
4. `popup.js` receives the result and fetches/parses RSS XML to display videos

Note: Uses programmatic injection with `activeTab` permission instead of declarative content scripts to avoid Chrome Web Store host permission review delays.

## Key Implementation Details

Channel ID extraction in `content.js` uses a priority-ordered strategy:
1. DOM elements (video owner links, shorts overlay)
2. RSS `<link>` meta tags (on channel pages)
3. Script data search for `"channelId":"UC..."` (fallback)

Security measures in `popup.js`:
- `escapeHtml()` and `escapeAttr()` functions prevent XSS
- DOM APIs used instead of innerHTML where possible
- URL validation prevents javascript: protocol attacks

## Loading as Chrome Extension

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

No build step required - the extension runs directly from source.
