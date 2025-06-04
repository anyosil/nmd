const audio = document.getElementById("audioPlayer");
const STORAGE_KEY = "symphonia-current-track";

// Load saved playback state
function loadPlaybackState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

// Save playback state: song index + current time (seconds)
function savePlaybackState(trackIndex, currentTime) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ trackIndex, currentTime })
  );
}

// Update Media Session metadata for lock screen / notification controls
function updateMediaSessionMetadata(track) {
  if ("mediaSession" in navigator && track) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [
        { src: track.cover || "default_cover.png", sizes: "512x512", type: "image/png" },
      ],
    });
  }
}

// Play song by index from the database starting at specified time
function playSongAtIndex(index, startTime = 0) {
  if (!database || !database[index]) {
    console.warn("Invalid track index:", index);
    return;
  }
  const track = database[index];
  audio.src = track.url || track.file || ""; // adapt key name to your database
  audio.currentTime = startTime;
  audio.play().catch(e => {
    console.warn("Audio play failed:", e);
  });
  updateMediaSessionMetadata(track);

  // Save playback periodically (every 5 seconds)
  audio.ontimeupdate = () => {
    savePlaybackState(index, audio.currentTime);
  };
}

// On page load, restore playback state if available, else start first track at 0
function initPlayback() {
  const state = loadPlaybackState();
  if (state && state.trackIndex != null) {
    playSongAtIndex(state.trackIndex, state.currentTime || 0);
  } else {
    // Default: play first track at start if you want auto play
    // playSongAtIndex(0, 0);
  }
}

// Optional: To allow changing track manually and saving state
function setCurrentTrack(index) {
  playSongAtIndex(index, 0);
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initPlayback();
});

// Expose setter if you want to change tracks programmatically from UI
window.setCurrentTrack = setCurrentTrack;