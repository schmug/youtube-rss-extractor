# Chrome Web Store Submission Justification

This document provides the necessary justifications for the permissions requested by the **YouTube RSS Extractor** extension. You can use these descriptions in the Chrome Developer Dashboard during the submission process.

## Single Purpose Description
The extension has a single, focused purpose: to extract and display the RSS feed URL for the YouTube channel or video currently being viewed by the user.

## Permission Justification

### 1. `activeTab`
**Justification:** The extension uses `activeTab` to access the current tab's URL and title. This allows the extension to determine if the user is on a YouTube page and specifically which channel or video they are viewing. `activeTab` is used instead of broad host permissions (e.g., `<all_urls>` or `*://*.youtube.com/*`) to adhere to the principle of least privilege, only granting access when the user explicitly interacts with the extension.

### 2. `scripting`
**Justification:** The extension requires the `scripting` permission to programmatically inject a content script (`content.js`) into the active YouTube tab. This script is necessary to extract the `channelId` and `channelName` from the page's DOM (Document Object Model) or underlying metadata (such as `ytInitialData`). This information is required to construct the correct RSS feed URL, as YouTube's RSS feeds are based on unique channel IDs.

---

## Remote Code Audit Statement
**Status:** No Remote Code In Use.

As per the Chrome Web Store policy against remote code execution:
- All logic for extraction and display is contained within local extension files (`popup.js`, `content.js`).
- The extension does not use `eval()`, `new Function()`, or any other method to execute dynamically generated or remotely fetched strings.
- Data fetched from external sources (YouTube RSS feeds) is parsed as XML using the browser's native `DOMParser` and sanitized before being rendered in the popup's UI to prevent XSS (Cross-Site Scripting) attacks.
- No external JavaScript libraries are loaded; the extension uses 100% Vanilla JavaScript.
