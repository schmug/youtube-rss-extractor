// Background service worker for update notifications

// Handle extension installation and updates
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    // First time installation
    console.log('YouTube RSS Extractor installed!');

    // Set default settings
    chrome.storage.sync.set({
      videosToShow: 10,
      cacheExpiry: 5
    });

    // Open welcome/options page
    chrome.runtime.openOptionsPage();

  } else if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;

    console.log(`Updated from ${previousVersion} to ${currentVersion}`);

    // Store update info to show notification in popup
    chrome.storage.local.set({
      updateInfo: {
        previousVersion,
        currentVersion,
        timestamp: Date.now(),
        seen: false
      }
    });
  }
});

// Handle keyboard command
chrome.commands.onCommand.addListener(command => {
  if (command === '_execute_action') {
    // This is handled automatically by Chrome, but we can log it
    console.log('Keyboard shortcut triggered');
  }
});
