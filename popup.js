document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  // HTML escape utility to prevent XSS attacks
  function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.textContent;
  }

  // HTML attribute escape (for use in attributes)
  function escapeAttr(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Application State
  let state = {
    view: 'LOADING', // LOADING, NOT_YOUTUBE, ERROR, SUCCESS
    channel: null,
    items: [],
    error: '',
    rssUrl: ''
  };

  // Render Function
  function render() {
    root.innerHTML = '';
    
    // Main Layout Container
    const container = document.createElement('div');
    container.className = 'app-container';
    
    // Header
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <div class="logo-icon">
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
         </svg>
      </div>
      <div class="header-text">
        <h1>RSS Extractor</h1>
        <p>For YouTube</p>
      </div>
    `;
    container.appendChild(header);

    // Main Content Area
    const main = document.createElement('main');
    main.className = 'main-content';
    
    if (state.view === 'LOADING') {
      main.innerHTML = `
        <div class="state-container">
          <div class="spinner"></div>
          <p class="state-desc">Scanning page...</p>
        </div>
      `;
    } else if (state.view === 'NOT_YOUTUBE') {
       main.innerHTML = `
        <div class="state-container">
          <div class="state-icon">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
          </div>
          <h2 class="state-title">Not YouTube</h2>
          <p class="state-desc">Navigate to a YouTube channel or video page to extract the RSS feed.</p>
        </div>
       `;
    } else if (state.view === 'ERROR') {
       main.innerHTML = `
        <div class="state-container">
           <div class="state-icon" style="color: #ef4444; background-color: rgba(239, 68, 68, 0.1)">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <h2 class="state-title">Extraction Failed</h2>
          <p class="state-desc">${escapeHtml(state.error)}</p>
        </div>
       `;
    } else if (state.view === 'SUCCESS') {
      // RSS Link Card
      const rssCard = document.createElement('div');
      rssCard.className = 'rss-card';
      rssCard.innerHTML = `
        <div class="rss-card-header">
          <span class="channel-name" title="${escapeAttr(state.channel.name)}">${escapeHtml(state.channel.name)}</span>
          <span class="badge">XML</span>
        </div>
        <div class="input-wrapper">
          <input type="text" readonly value="${escapeAttr(state.rssUrl)}" class="rss-input" />
          <button class="copy-btn" title="Copy to clipboard">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      `;
      
      // Copy Event Listener
      const copyBtn = rssCard.querySelector('.copy-btn');
      const input = rssCard.querySelector('.rss-input');
      const clipboardSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>';
      const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style="color: #22c55e"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
      const errorSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style="color: #ef4444"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>';

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(input.value);
          copyBtn.innerHTML = checkSvg;
          setTimeout(() => { copyBtn.innerHTML = clipboardSvg; }, 2000);
        } catch (err) {
          console.error('Failed to copy to clipboard:', err);
          copyBtn.innerHTML = errorSvg;
          setTimeout(() => { copyBtn.innerHTML = clipboardSvg; }, 2000);
        }
      });

      main.appendChild(rssCard);
      
      // Feed List
      const feedList = document.createElement('div');
      feedList.className = 'feed-list';
      
      if (state.items.length === 0) {
        feedList.innerHTML = `<div class="empty-msg">No videos found in feed.</div>`;
      } else {
        const listHeader = document.createElement('h3');
        listHeader.className = 'feed-header';
        listHeader.textContent = 'Latest Videos';
        feedList.appendChild(listHeader);
        
        state.items.forEach(item => {
           const link = document.createElement('a');
           link.className = 'feed-item';
           // Validate URL to prevent javascript: protocol attacks
           if (item.link && item.link.startsWith('http')) {
             link.href = item.link;
           }
           link.target = '_blank';
           link.rel = 'noopener noreferrer';

           const date = new Date(item.published);
           const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

           // Build DOM safely without innerHTML
           const thumbContainer = document.createElement('div');
           thumbContainer.className = 'thumbnail-container';
           const img = document.createElement('img');
           img.src = item.thumbnail || '';
           img.alt = 'Thumb';
           img.className = 'thumbnail-img';
           thumbContainer.appendChild(img);

           const contentDiv = document.createElement('div');
           contentDiv.className = 'item-content';
           const title = document.createElement('h4');
           title.className = 'item-title';
           title.textContent = item.title || '';
           const dateSpan = document.createElement('span');
           dateSpan.className = 'item-date';
           dateSpan.textContent = dateStr;
           contentDiv.appendChild(title);
           contentDiv.appendChild(dateSpan);

           link.appendChild(thumbContainer);
           link.appendChild(contentDiv);
           feedList.appendChild(link);
        });
      }
      main.appendChild(feedList);
    }
    
    container.appendChild(main);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.textContent = 'Made with Vanilla JS';
    container.appendChild(footer);
    
    root.appendChild(container);
  }

  // Initialization Logic
  async function init() {
    // Check for Chrome API
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
       state.view = 'ERROR';
       state.error = 'Extension API not found. Are you running as an extension?';
       render();
       return;
    }

    // Get Active Tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];

    if (!tab || !tab.id) {
        state.view = 'ERROR';
        state.error = 'No active tab found.';
        render();
        return;
    }

    if (!tab.url || !tab.url.includes('youtube.com')) {
        state.view = 'NOT_YOUTUBE';
        render();
        return;
    }

    // Inject content script and get channel details
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        const response = results?.[0]?.result;

        if (response && response.rssUrl) {
            state.channel = {
                id: response.channelId || 'unknown',
                name: response.channelName || 'YouTube Channel'
            };
            state.rssUrl = response.rssUrl;

            // Fetch and Parse RSS
            try {
                const rssRes = await fetch(response.rssUrl);

                if (!rssRes.ok) throw new Error(`Fetch failed: ${rssRes.status}`);

                const text = await rssRes.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");

                const entries = Array.from(xmlDoc.querySelectorAll("entry"));

                state.items = entries.map(entry => {
                     const mediaGroup = entry.getElementsByTagName("media:group")[0];
                     const thumbnail = mediaGroup?.getElementsByTagName("media:thumbnail")[0]?.getAttribute("url") || "";
                     const linkNode = entry.getElementsByTagName("link")[0];
                     const href = linkNode?.getAttribute("href") || "";

                     return {
                         id: entry.getElementsByTagName("id")[0]?.textContent,
                         title: entry.getElementsByTagName("title")[0]?.textContent,
                         link: href,
                         published: entry.getElementsByTagName("published")[0]?.textContent,
                         thumbnail: thumbnail
                     };
                });

                state.view = 'SUCCESS';
                render();

            } catch (e) {
                console.error("RSS Error:", e);
                state.view = 'ERROR';
                state.error = 'Found Channel, but failed to load RSS feed.';
                render();
            }

        } else {
            state.view = 'ERROR';
            state.error = 'Could not detect a Channel ID on this page.';
            render();
        }
    } catch (e) {
        console.error("Init Error:", e);
        state.view = 'ERROR';
        state.error = 'Could not access page. Try refreshing YouTube.';
        render();
    }
  }

  // Start
  init();
});