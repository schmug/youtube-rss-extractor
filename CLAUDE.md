# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YouTube RSS Extractor is a Chrome extension (Manifest V3) that extracts RSS feed URLs from YouTube channel and video pages. It also has a Vite/React development environment configured for a web version.

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start Vite dev server on port 3000
npm run build   # Build for production
npm run preview # Preview production build
```

## Architecture

The project has two parallel architectures:

### Chrome Extension (production)
- **manifest.json**: Manifest V3 extension config
- **background.js**: Service worker that monitors tab navigation and shows RSS badge when a feed is available
- **content.js**: Injected into YouTube pages, extracts channel ID and RSS URL using multiple DOM/meta strategies
- **popup.js**: Extension popup UI (vanilla JS), displays RSS link and fetches/parses the feed to show recent videos
- **index.html** / **styles.css**: Popup markup and styling

The extension messaging flow:
1. `background.js` listens for YouTube tab updates
2. Sends `CHECK_AVAILABILITY` message to `content.js`
3. `content.js` scans DOM for channel ID and returns availability
4. When popup opens, sends `GET_CHANNEL_DETAILS` to get full RSS URL
5. `popup.js` fetches and parses the RSS XML to display videos

### Vite/React (development scaffold)
- **vite.config.ts**: Dev server config, loads `GEMINI_API_KEY` from `.env.local`
- **App.tsx**, **index.tsx**, **types.ts**: React entry points (currently minimal)
- **components/**: FeedPreview.tsx, RSSLinkDisplay.tsx (placeholder components)
- **services/rssService.ts**: RSS service (placeholder)

## Key Implementation Details

Channel ID extraction in `content.js` uses a priority-ordered strategy:
1. DOM elements (video owner links, shorts overlay)
2. RSS `<link>` meta tags (on channel pages)
3. Regex match for `"channelId":"UC..."` in page HTML (fallback)

## Loading as Chrome Extension

1. Run `npm run build` (or use source files directly for development)
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory
