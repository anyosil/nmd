// persistent-player.js
// Minimal persistent audio manager: saves current track state to localStorage
// and restores it on page load so playback appears continuous across page
// navigation. It prefers existing audio elements with id="player" or
// id="audioPlayer", otherwise it creates a hidden persistent audio element.
(function () {
  const STORAGE_KEY = 'nuvi_persistent_audio_v1';
  const LEGACY_KEY = 'currentSong';
  let audio = null;
  let saveTimer = null;

  function findOrCreateAudio() {
    audio = document.getElementById('player') || document.getElementById('audioPlayer') || document.querySelector('audio');
    if (!audio) {
      audio = document.createElement('audio');
      // Use the same id used across pages so other scripts (script.js) can find/adopt it
      audio.id = 'audioPlayer';
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }
    return audio;
  }

  function loadState() {
    try {
      // Prefer the site's existing 'currentSong' key if present (keeps behavior consistent)
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        try { return JSON.parse(legacy); } catch (e) {}
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveState() {
    if (!audio) return;
    const state = {
      src: audio.currentSrc || audio.src || '',
      currentTime: isFinite(audio.currentTime) ? audio.currentTime : 0,
      paused: audio.paused,
      // small helpful metadata if present on the element
      title: audio.dataset && audio.dataset.title ? audio.dataset.title : '',
      artist: audio.dataset && audio.dataset.artist ? audio.dataset.artist : (audio.getAttribute && audio.getAttribute('data-artist')) || '',
      cover: audio.dataset && audio.dataset.cover ? audio.dataset.cover : (audio.getAttribute && audio.getAttribute('data-cover')) || ''
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Also update the site's expected key so other scripts (script.js) restore the same data
      try {
        localStorage.setItem(LEGACY_KEY, JSON.stringify({ url: state.src, title: state.title || '', artist: state.artist || '', cover: state.cover || '', time: state.currentTime, isPlaying: !state.paused }));
      } catch (e) {}
    } catch (e) {
      // ignore quota errors
    }
  }

  function scheduleSave() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      saveState();
    }, 250);
  }

  function restore() {
    findOrCreateAudio();
    const state = loadState();
    if (!state) return;
    const src = state.src || state.url || '';
    if (!src) return;
    try {
      // if current element already has the same src, just seek
      if ((audio.currentSrc || audio.src) !== src) {
        audio.src = src;
      }
      // restore simple metadata if present
      if (state.title) audio.dataset.title = state.title;
      if (state.artist) {
        try { audio.dataset.artist = state.artist; audio.setAttribute('data-artist', state.artist); } catch (e) {}
      }
      if (state.cover) {
        try { audio.dataset.cover = state.cover; audio.setAttribute('data-cover', state.cover); } catch (e) {}
      }
      // Some browsers require a small delay before setting currentTime
      const time = typeof state.currentTime === 'number' ? state.currentTime : (typeof state.time === 'number' ? state.time : 0);
      audio.addEventListener('loadedmetadata', function onMeta() {
        audio.removeEventListener('loadedmetadata', onMeta);
        try { audio.currentTime = Math.min(time || 0, audio.duration || time || 0); } catch (e) {}
      });

      // Determine paused from either paused flag or legacy isPlaying
      const paused = (typeof state.paused === 'boolean') ? state.paused : (typeof state.isPlaying === 'boolean' ? !state.isPlaying : true);

      // Try to resume automatically if it was playing
      if (!paused) {
        const p = audio.play();
        if (p && p.catch) p.catch(() => {
          // autoplay rejected; we'll wait for user gesture. Nothing else to do.
        });
      }
      // Update Media Session API where available so pages without the main script still show correct metadata
      try {
        if ('mediaSession' in navigator) {
          const metaTitle = state.title || '';
          const metaArtist = state.artist || '';
          const metaCover = state.cover || '';
          if (metaTitle || metaArtist || metaCover) {
            try {
              navigator.mediaSession.metadata = new MediaMetadata({
                title: metaTitle || 'Unknown Title',
                artist: metaArtist || '',
                album: '',
                artwork: metaCover ? [{ src: metaCover, sizes: '512x512', type: 'image/jpeg' }] : []
              });
            } catch (e) {}
          }
          navigator.mediaSession.playbackState = paused ? 'paused' : 'playing';
          if ('setPositionState' in navigator.mediaSession) {
            try {
              navigator.mediaSession.setPositionState({
                duration: audio.duration || 0,
                playbackRate: audio.playbackRate || 1,
                position: audio.currentTime || 0
              });
            } catch (e) {}
          }
        }
      } catch (e) {}
    } catch (e) {
      // ignore
    }
  }

  function wirePersist() {
    if (!audio) return;
    ['play', 'pause', 'ended', 'seeking', 'seeked'].forEach(evt => {
      audio.addEventListener(evt, saveState);
    });
    audio.addEventListener('timeupdate', scheduleSave);
    // Expose simple API
    window.persistentPlayer = {
      audio: audio,
      save: saveState,
      restore: restore
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    findOrCreateAudio();
    wirePersist();
    // attempt restore after a short delay to let other page scripts initialize
    setTimeout(restore, 100);
  });
})();
