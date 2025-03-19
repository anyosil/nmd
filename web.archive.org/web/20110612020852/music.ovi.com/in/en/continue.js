document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");
    let allSongs = [];

    // 🔥 Function to wait until `script.js` database is ready
    function waitForDatabase(callback) {
        if (typeof database !== "undefined") {
            callback(); // Database is ready, execute callback
        } else {
            console.warn("⏳ Waiting for database to load...");
            setTimeout(() => waitForDatabase(callback), 100); // Retry after 100ms
        }
    }

    // 🔥 Flatten the database after it's loaded
    function getAllSongs() {
        return Object.values(database).flat(); // Flatten nested categories
    }

    // ✅ Function to update Media Session API
    function updateMediaSession(songData) {
        if (!("mediaSession" in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: songData.title || "Unknown Title",
            artist: songData.artist || "Unknown Artist",
            album: "Symphonia",
            artwork: [{ src: songData.cover || "./default-cover.png", sizes: "512x512", type: "image/png" }]
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
        navigator.mediaSession.setActionHandler("nexttrack", () => {
            playNextSong();
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
            playPreviousSong();
        });
    }

    // ✅ Function to play a new song
    window.playSong = (songTitle) => {
        const songData = allSongs.find(song => song.title.toLowerCase() === songTitle.toLowerCase());

        if (!songData) {
            console.error("❌ Song not found in database:", songTitle);
            return;
        }

        audioPlayer.src = songData.url;
        audioPlayer.play();

        // 📝 Save playback data
        localStorage.setItem("currentSong", JSON.stringify({
            url: songData.url,
            title: songData.title,
            artist: songData.artist,
            cover: songData.cover,
            time: 0,
            isPlaying: true
        }));

        updateMediaSession(songData);
    };

    // ✅ Function to play the next song
    function playNextSong() {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");
        const currentIndex = allSongs.findIndex(song => song.title === savedSong.title);

        if (currentIndex === -1 || currentIndex >= allSongs.length - 1) {
            console.warn("⚠️ No next song found!");
            return;
        }

        const nextSong = allSongs[currentIndex + 1];
        playSong(nextSong.title);
    }

    // ✅ Function to play the previous song
    function playPreviousSong() {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");
        const currentIndex = allSongs.findIndex(song => song.title === savedSong.title);

        if (currentIndex <= 0) {
            console.warn("⚠️ No previous song found!");
            return;
        }

        const prevSong = allSongs[currentIndex - 1];
        playSong(prevSong.title);
    }

    // ✅ Restore playback & metadata when switching pages
    function restorePlayback() {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");

        if (savedSong.url) {
            audioPlayer.src = savedSong.url;
            audioPlayer.currentTime = savedSong.time || 0;
            if (savedSong.isPlaying) {
                audioPlayer.play();
            }

            updateMediaSession(savedSong);
        }
    }

    // ✅ Load the database and initialize everything
    waitForDatabase(() => {
        allSongs = getAllSongs();
        restorePlayback();
    });

    // 🎵 Save playback state when playing/pausing
    audioPlayer.addEventListener("play", () => {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");
        savedSong.isPlaying = true;
        localStorage.setItem("currentSong", JSON.stringify(savedSong));
    });

    audioPlayer.addEventListener("pause", () => {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");
        savedSong.isPlaying = false;
        localStorage.setItem("currentSong", JSON.stringify(savedSong));
    });

    audioPlayer.addEventListener("timeupdate", () => {
        const savedSong = JSON.parse(localStorage.getItem("currentSong") || "{}");
        savedSong.time = audioPlayer.currentTime;
        localStorage.setItem("currentSong", JSON.stringify(savedSong));
    });
});