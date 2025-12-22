// Listen for tab updates (navigation, refresh, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // We only care if the URL changed or the page finished loading, and it's a YouTube link
  if ((changeInfo.status === 'complete' || changeInfo.url) && tab.url && tab.url.includes('youtube.com')) {
    checkFeedAvailability(tabId);
  }
});

// Function to ping content script and check for feed
function checkFeedAvailability(tabId) {
  // Send a message to content script to scan the DOM
  chrome.tabs.sendMessage(tabId, { type: 'CHECK_AVAILABILITY' }, (response) => {
    // Ignore errors (e.g., content script not ready yet)
    if (chrome.runtime.lastError) return;

    if (response && response.hasFeed) {
      // Light up the icon with a badge
      chrome.action.setBadgeText({ tabId: tabId, text: "RSS" });
      chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: "#22c55e" }); // Green
    } else {
      // Clear badge
      chrome.action.setBadgeText({ tabId: tabId, text: "" });
    }
  });
}