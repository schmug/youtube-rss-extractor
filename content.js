// This script is injected programmatically and returns channel details
(function() {
  const currentUrl = window.location.href;
  const isVideoPage = currentUrl.includes('/watch');
  const isShorts = currentUrl.includes('/shorts/');
  const isChannelPage = currentUrl.includes('/channel/') || currentUrl.includes('/c/') || currentUrl.includes('/@') || currentUrl.includes('/user/');

  let channelId = null;
  let channelName = null;
  let rssUrl = null;

  // --- ID EXTRACTION ---

  // Strategy 1: Dynamic DOM elements (Most reliable for SPA transitions)
  if (isVideoPage) {
    const ownerLink = document.querySelector('ytd-video-owner-renderer a[href^="/channel/UC"], #owner a[href^="/channel/UC"]');
    if (ownerLink) {
      const href = ownerLink.getAttribute('href');
      if (href) {
        const match = href.match(/\/channel\/(UC[\w-]+)/);
        if (match) channelId = match[1];
      }
    }

    if (!channelId) {
      const metaId = document.querySelector('meta[itemprop="channelId"]');
      if (metaId) channelId = metaId.getAttribute('content');
    }
  }
  else if (isShorts) {
    const ownerLink = document.querySelector('ytd-reel-player-overlay-renderer a[href^="/channel/UC"]');
    if (ownerLink) {
      const href = ownerLink.getAttribute('href');
      if (href) {
        const match = href.match(/\/channel\/(UC[\w-]+)/);
        if (match) channelId = match[1];
      }
    }
  }
  else if (isChannelPage) {
    const rssLink = document.querySelector('link[rel="alternate"][type="application/rss+xml"]');
    if (rssLink && rssLink.href) {
      const href = rssLink.href;
      const match = href.match(/channel_id=([^&]+)/);
      if (match) channelId = match[1];
      rssUrl = href;
    }
  }

  // Strategy 2: Universal Fallback (Targeted Script Search)
  if (!channelId) {
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      const text = script.textContent;
      if (text && text.includes('channelId')) {
        const match = text.match(/"channelId":"(UC[\w-]+)"/);
        if (match) {
          channelId = match[1];
          break;
        }
      }
    }
  }

  // --- NAME EXTRACTION ---

  if (isVideoPage) {
    const videoOwner = document.querySelector('ytd-video-owner-renderer ytd-channel-name #text');
    if (videoOwner) channelName = videoOwner.textContent?.trim();
  }
  else if (isShorts) {
    const shortsOwner = document.querySelector('ytd-reel-player-header-renderer #channel-name #text');
    if (shortsOwner) channelName = shortsOwner.textContent?.trim();
  }
  else {
    const channelHeader = document.querySelector('#channel-header .ytd-channel-name #text');
    if (channelHeader) channelName = channelHeader.textContent?.trim();
  }

  if (!channelName) {
    const authorNameMeta = document.querySelector('[itemprop="author"] [itemprop="name"]');
    if (authorNameMeta) channelName = authorNameMeta.getAttribute('content');
  }

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
