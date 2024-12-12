//autopp

document.addEventListener("visibilitychange", () => {
    const video = document.querySelector("video");
    if (video) {
      if (document.visibilityState === "hidden") {
        video.pause();
      } else if (document.visibilityState === "visible") {
        video.play();
      }
    }
  });
  
//skipad

  function skipAd() {
    const player = document.querySelector('#movie_player');
    const video = player ? player.querySelector('video.html5-main-video') : null;

    if (player && player.classList.contains('ad-showing')) {
        const skipButton = document.querySelector(".ytp-ad-skip-button, .ytp-ad-overlay-close-button");

        if (skipButton) {
            // Click the "Skip Ad" button if it's available
            try {
                skipButton.click();
                console.log("Ad skipped!");
            } catch (e) {
                console.error("Error clicking skip button:", e);
            }
        } else if (video && !video.paused && video.duration > 5) {
            // Fast-forward the ad if it's unskippable
            video.currentTime = video.duration - 1;
            console.log("Fast-forwarded ad.");
        }
    }
}

// Continuously run skipAd function every 500 milliseconds
setInterval(skipAd, 500);

// Default settings
const defaultSettings = {
  hideComments: true,
  hideSidebar: true,
  hideAds: true,
  hideLiveChat: true,
  hideHomeFeed: true,
  hideNotifications: true,
};

// Function to hide YouTube elements based on user settings
function hideYouTubeElements(settings) {
  const selectors = {
      hideComments: '#comments',
      hideSidebar: '#secondary',
      hideLiveChat: '#chat, #chatframe, ytd-live-chat-frame',
      hideHomeFeed: 'ytd-browse[page-subtype="home"]',
      hideNotifications: 'button[aria-label="Notifications"]',  
  };

  for (const [key, value] of Object.entries(settings)) {
      if (value && selectors[key]) {
          const elements = document.querySelectorAll(selectors[key]);
          elements.forEach(el => el.style.display = 'none');
      }
  }
}

// Load user settings and hide elements
chrome.storage.sync.get(defaultSettings, (settings) => {
  hideYouTubeElements(settings);
});

// MutationObserver to detect dynamic content changes
const observer = new MutationObserver(() => {
  chrome.storage.sync.get(defaultSettings, (settings) => {
      hideYouTubeElements(settings);
  });
});
observer.observe(document.body, { childList: true, subtree: true });