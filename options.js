// Options page logic
document.addEventListener('DOMContentLoaded', async () => {
  const videosToShowInput = document.getElementById('videosToShow');
  const cacheExpiryInput = document.getElementById('cacheExpiry');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const successMessage = document.getElementById('successMessage');

  const defaults = {
    videosToShow: 10,
    cacheExpiry: 5
  };

  // Load saved settings
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['videosToShow', 'cacheExpiry']);
      videosToShowInput.value = result.videosToShow || defaults.videosToShow;
      cacheExpiryInput.value = result.cacheExpiry || defaults.cacheExpiry;
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }

  // Save settings
  async function saveSettings() {
    const videosToShow = parseInt(videosToShowInput.value, 10);
    const cacheExpiry = parseInt(cacheExpiryInput.value, 10);

    // Validate inputs
    if (isNaN(videosToShow) || videosToShow < 5 || videosToShow > 50) {
      alert('Videos to show must be between 5 and 50');
      return;
    }

    if (isNaN(cacheExpiry) || cacheExpiry < 1 || cacheExpiry > 60) {
      alert('Cache duration must be between 1 and 60 minutes');
      return;
    }

    try {
      await chrome.storage.sync.set({
        videosToShow,
        cacheExpiry
      });

      // Show success message
      successMessage.classList.add('show');
      setTimeout(() => {
        successMessage.classList.remove('show');
      }, 3000);

    } catch (e) {
      console.error('Failed to save settings:', e);
      alert('Failed to save settings. Please try again.');
    }
  }

  // Reset to defaults
  function resetSettings() {
    videosToShowInput.value = defaults.videosToShow;
    cacheExpiryInput.value = defaults.cacheExpiry;
  }

  // Event listeners
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);

  // Load settings on page load
  await loadSettings();
});
