# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube RSS Extractor is a Chrome extension (Manifest V3) that extracts RSS feed URLs from YouTube channel and video pages.

## Architecture

### Files
- **manifest.json**: Manifest V3 extension config with CSP
- **background.js**: Service worker that monitors tab navigation and shows RSS badge
- **content.js**: Injected into YouTube pages, extracts channel ID using multiple strategies
- **popup.js**: Extension popup UI (vanilla JS), displays RSS link and fetches feed
- **index.html** / **styles.css**: Popup markup and styling
- **icons/**: Extension icons (16, 48, 128px PNG)

### Message Flow
1. `background.js` listens for YouTube tab updates
2. Sends `CHECK_AVAILABILITY` message to `content.js`
3. `content.js` scans DOM for channel ID and returns availability
4. When popup opens, sends `GET_CHANNEL_DETAILS` to get full RSS URL
5. `popup.js` fetches and parses the RSS XML to display videos

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
