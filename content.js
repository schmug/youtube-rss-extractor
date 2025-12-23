// This script is injected programmatically and returns channel details
(async function() {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;

  // Detect page type
  const isYouTubeMusic = hostname.includes('music.youtube.com');
  const isPlaylist = currentUrl.includes('/playlist');
  const isVideoPage = currentUrl.includes('/watch');
  const isShorts = currentUrl.includes('/shorts/');
  const isChannelPage = currentUrl.includes('/channel/') || currentUrl.includes('/c/') || currentUrl.includes('/@') || currentUrl.includes('/user/');

  // Return special states for unsupported pages
  if (isYouTubeMusic) {
    return {
      error: 'YOUTUBE_MUSIC',
      message: 'YouTube Music is not supported. Please use regular YouTube (youtube.com) instead.'
    };
  }

  if (isPlaylist) {
    return {
      error: 'PLAYLIST',
      message: 'Playlists do not have RSS feeds. Navigate to a channel or video page instead.'
    };
  }

  let channelId = null;
  let channelName = null;
  let rssUrl = null;

  // Helper function to wait for element with timeout
  function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  // --- ID EXTRACTION WITH RETRY ---

  async function extractChannelId() {
    // Strategy 1: Dynamic DOM elements (Most reliable for SPA transitions)
    if (isVideoPage) {
      // Try immediate extraction first
      let ownerLink = document.querySelector('ytd-video-owner-renderer a[href^="/channel/UC"], #owner a[href^="/channel/UC"]');

      // If not found, wait for it to load
      if (!ownerLink) {
        ownerLink = await waitForElement('ytd-video-owner-renderer a[href^="/channel/UC"], #owner a[href^="/channel/UC"]');
      }

      if (ownerLink) {
        const href = ownerLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/channel\/(UC[\w-]+)/);
          if (match) return match[1];
        }
      }

      // Fallback to meta tag
      const metaId = document.querySelector('meta[itemprop="channelId"]');
      if (metaId) {
        const content = metaId.getAttribute('content');
        if (content) return content;
      }
    }
    else if (isShorts) {
      let ownerLink = document.querySelector('ytd-reel-player-overlay-renderer a[href^="/channel/UC"]');

      if (!ownerLink) {
        ownerLink = await waitForElement('ytd-reel-player-overlay-renderer a[href^="/channel/UC"]');
      }

      if (ownerLink) {
        const href = ownerLink.getAttribute('href');
        if (href) {
          const match = href.match(/\/channel\/(UC[\w-]+)/);
          if (match) return match[1];
        }
      }
    }
    else if (isChannelPage) {
      const rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
      if (rssLink && rssLink.href) {
        const href = rssLink.href;
        const match = href.match(/channel_id=([^&]+)/);
        if (match) {
          rssUrl = href;
          return match[1];
        }
      }
    }

    // Strategy 2: Universal Fallback (Targeted Script Search)
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent;
      if (text && text.includes('channelId')) {
        const match = text.match(/"channelId":"(UC[\w-]+)"/);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }

  // --- NAME EXTRACTION ---

  async function extractChannelName() {
    if (isVideoPage) {
      let videoOwner = document.querySelector('ytd-video-owner-renderer ytd-channel-name #text');
      if (!videoOwner) {
        videoOwner = await waitForElement('ytd-video-owner-renderer ytd-channel-name #text');
      }
      if (videoOwner) return videoOwner.textContent?.trim();
    }
    else if (isShorts) {
      let shortsOwner = document.querySelector('ytd-reel-player-header-renderer #channel-name #text');
      if (!shortsOwner) {
        shortsOwner = await waitForElement('ytd-reel-player-header-renderer #channel-name #text');
      }
      if (shortsOwner) return shortsOwner.textContent?.trim();
    }
    else {
      const channelHeader = document.querySelector('#channel-header .ytd-channel-name #text');
      if (channelHeader) return channelHeader.textContent?.trim();
    }

    // Fallback to meta
    const authorNameMeta = document.querySelector('[itemprop="author"] [itemprop="name"]');
    if (authorNameMeta) {
      const content = authorNameMeta.getAttribute('content');
      if (content) return content;
    }

    return null;
  }

  // Execute extraction
  channelId = await extractChannelId();
  channelName = await extractChannelName();

  // --- FINAL URL CONSTRUCTION ---
  if (channelId && !rssUrl) {
    rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  }

  return {
    channelId,
    channelName: channelName || "Unknown Channel",
    rssUrl
  };
})();
