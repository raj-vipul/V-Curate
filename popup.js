document.addEventListener("DOMContentLoaded", () => {
  const bookmarkButton = document.getElementById("bookmarkButton");
  const downloadNotesButton = document.getElementById("downloadNotes");
  const bookmarksContainer = document.getElementById("bookmarks");
  const noteInput = document.getElementById("noteInput");

  chrome.storage.local.get(["vidFilBookmarks"], (data) => {
    (data.vidFilBookmarks || []).forEach(createBookmarkElement);
  });

  bookmarkButton.addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => Math.floor(document.querySelector("video").currentTime)
    }, ([result]) => {
      if (result && result.result) {
        const note = noteInput.value;
        saveBookmark(result.result, tab.url, note);
        noteInput.value = "";  // Clear note input after saving
      }
    });
  });

  function saveBookmark(timestamp, url, note) {
    const bookmark = { timestamp, url, note };
    chrome.storage.local.get(["vidFilBookmarks"], (data) => {
      const bookmarks = data.vidFilBookmarks || [];
      bookmarks.push(bookmark);
      chrome.storage.local.set({ vidFilBookmarks: bookmarks }, () => {
        createBookmarkElement(bookmark);
      });
    });
  }

  function createBookmarkElement({ timestamp, url, note }) {
    const div = document.createElement("div");
    div.className = "bookmark";

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = `Go to ${formatTime(timestamp)}`;
    link.addEventListener("click", () => {
      chrome.tabs.create({ url: `${url.split("&t=")[0]}&t=${timestamp}s` }, (tab) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const video = document.querySelector("video");
            if (video) video.play();
          }
        });
      });
    });

    const noteText = document.createElement("p");
    noteText.textContent = `Note: ${note || "No notes"}`;
    noteText.className = "note-text";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => deleteBookmark(timestamp));

    div.appendChild(link);
    div.appendChild(noteText);
    div.appendChild(deleteButton);
    bookmarksContainer.appendChild(div);
  }

  function deleteBookmark(timestamp) {
    chrome.storage.local.get(["vidFilBookmarks"], (data) => {
      const bookmarks = (data.vidFilBookmarks || []).filter(b => b.timestamp !== timestamp);
      chrome.storage.local.set({ vidFilBookmarks: bookmarks }, () => {
        bookmarksContainer.innerHTML = "";
        bookmarks.forEach(createBookmarkElement);
      });
    });
  }

  //notes

  downloadNotesButton.addEventListener("click", () => {
    chrome.storage.local.get(["vidFilBookmarks"], (data) => {
      const notes = (data.vidFilBookmarks || []).map(b => 
        `Timestamp: ${formatTime(b.timestamp)} - Note: ${b.note || "No notes"}`
      ).join("\n");
      
      const blob = new Blob([notes], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "VidFil_Notes.txt";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
});

// dwnld

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const url = document.getElementById('url').value;
  const messageDiv = document.getElementById('message');
  
  if (!url) {
      messageDiv.textContent = 'Please enter a URL';
      return;
  }

  messageDiv.textContent = 'Downloading...';

  try {
      const response = await fetch('http://localhost:5000/download', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
      });

      const result = await response.json();
      if (response.ok) {
          messageDiv.textContent = result.status;
      } else {
          messageDiv.textContent = `Error: ${result.error}`;
      }
  } catch (error) {
      messageDiv.textContent = `Fetch error: ${error}`;
  }
});

// Hide and Filter

document.addEventListener('DOMContentLoaded', () => {
  const defaultSettings = {
      hideComments: true,
      hideSidebar: true,
      hideLiveChat: true,
      hideHomeFeed: true,
      hideNotifications: true, 
  };

  // Load current settings into the popup
  chrome.storage.sync.get(defaultSettings, (settings) => {
      document.getElementById('hideComments').checked = settings.hideComments;
      document.getElementById('hideSidebar').checked = settings.hideSidebar;
      document.getElementById('hideLiveChat').checked = settings.hideLiveChat;
      document.getElementById('hideHomeFeed').checked = settings.hideHomeFeed;
      document.getElementById('hideNotifications').checked = settings.hideNotifications; 
  });

  // Save changes when the button is clicked
  document.getElementById('saveButton').addEventListener('click', () => {
      const settings = {
          hideComments: document.getElementById('hideComments').checked,
          hideSidebar: document.getElementById('hideSidebar').checked,
          hideLiveChat: document.getElementById('hideLiveChat').checked,
          hideHomeFeed: document.getElementById('hideHomeFeed').checked,
          hideNotifications: document.getElementById('hideNotifications').checked,
      };
      chrome.storage.sync.set(settings, () => {
          alert('Settings saved! Please Reload the Page');
      });
  });
});


fetch('http://localhost:5000/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: videoUrl })
})
.then(response => response.json())
.then(data => {
    if (data.error) {
        alert(data.error);  // Display alert if there's an error
    } else {
        alert(data.status);  // Display success message if download is complete
    }
})
.catch(error => {
    console.error('Error:', error);
    alert('An error occurred while downloading the video.');
});
