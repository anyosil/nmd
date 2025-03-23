document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");

    // 🔥 Restore playback & metadata when switching pages
    function restorePlayback() {
        const savedSong = localStorage.getItem("currentSong");
        if (!savedSong) return;

        const { url, title, artist, cover, time, isPlaying } = JSON.parse(savedSong);

        if (url) {
            audioPlayer.src = url;
            audioPlayer.currentTime = time || 0;
            if (isPlaying) {
                audioPlayer.play();
            }
        }

        updateMediaSession(title, artist, cover);
    }

    // ✅ Function to update Media Session API
    function updateMediaSession(title, artist, cover) {
        if (!("mediaSession" in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: title || "Unknown Title",
            artist: artist || "Unknown Artist",
            album: "Symphonia",
            artwork: [{ src: cover || "https://example.com/default-cover.jpg", sizes: "512x512", type: "image/png" }]
        });

        navigator.mediaSession.setActionHandler("play", () => {
            audioPlayer.play();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            audioPlayer.pause();
        });
        navigator.mediaSession.setActionHandler("seekbackward", () => {
            audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
        });
        navigator.mediaSession.setActionHandler("seekforward", () => {
            audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
        });
        navigator.mediaSession.setActionHandler("nexttrack", playNextSong);
        navigator.mediaSession.setActionHandler("previoustrack", playPreviousSong);
    }

    // 📝 Save playback data in `localStorage`
    function savePlaybackState() {
        localStorage.setItem("currentSong", JSON.stringify({
            url: audioPlayer.src,
            title: navigator.mediaSession.metadata?.title || "Unknown Title",
            artist: navigator.mediaSession.metadata?.artist || "Unknown Artist",
            cover: navigator.mediaSession.metadata?.artwork?.[0]?.src || "https://example.com/default-cover.jpg",
            time: audioPlayer.currentTime,
            isPlaying: !audioPlayer.paused
        }));
    }

    // 🎵 Update state when playing/pausing
    audioPlayer.addEventListener("play", savePlaybackState);
    audioPlayer.addEventListener("pause", savePlaybackState);
    audioPlayer.addEventListener("timeupdate", savePlaybackState);

    // 🔥 Restore playback & metadata when switching pages
    restorePlayback();

    // ✅ Function to play a new song
    window.playSong = (songTitle) => {
        if (!window.database) {
            console.error("❌ Songs database not loaded yet!");
            return;
        }

        // 🔍 Find song details from the database
        const flattenedSongs = Object.values(database).flat();
        const songIndex = flattenedSongs.findIndex(song => song.title.toLowerCase() === songTitle.toLowerCase());

        if (songIndex === -1) {
            console.error("❌ Song not found in database:", songTitle);
            return;
        }

        const songData = flattenedSongs[songIndex];

        audioPlayer.src = songData.url;
        audioPlayer.play();

        // 📝 Save playback data
        savePlaybackState();

        // 🎵 Update Media Session API
        updateMediaSession(songData.title, songData.artist, songData.cover);

        // 🔄 Store the current index for next/previous track
        localStorage.setItem("currentSongIndex", songIndex);
    };

    // 🔥 Function to play the next song automatically
    function playNextSong() {
        const flattenedSongs = Object.values(database).flat();
        let currentSongIndex = parseInt(localStorage.getItem("currentSongIndex") || 0, 10);

        if (currentSongIndex < flattenedSongs.length - 1) {
            playSong(flattenedSongs[currentSongIndex + 1].title);
        }
    }

    // 🔥 Function to play the previous song
    function playPreviousSong() {
        const flattenedSongs = Object.values(database).flat();
        let currentSongIndex = parseInt(localStorage.getItem("currentSongIndex") || 0, 10);

        if (currentSongIndex > 0) {
            playSong(flattenedSongs[currentSongIndex - 1].title);
        }
    }

    // 🎵 Autoplay next song when current song ends
    audioPlayer.addEventListener("ended", playNextSong);
});