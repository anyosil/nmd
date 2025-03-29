document.addEventListener("DOMContentLoaded", function() {
    console.log("Search page loaded...");

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");

    console.log("Query received:", query);

    if (query) {
        handleSearch(query);
    } else {
        console.error("No search query found!");
    }
});

function handleSearch(query) {
    console.log("Handling search for:", query);

    if (typeof database === "undefined" || typeof database !== "object") {
        console.error("Error: database is not defined or not an object in script.js!");
        return;
    }

    const searchResults = document.getElementById("searchResults").querySelector("div");
    if (!searchResults) {
        console.error("Error: searchResults element not found!");
        return;
    }

    searchResults.innerHTML = ""; // Clear previous results

    const allSongs = Object.values(database).flat(); // Flatten the database object into an array
    console.log("Available songs:", allSongs.map(s => s.title)); // Debugging available songs

    const filteredSongs = allSongs.filter(song =>
        (song.title && song.title.toLowerCase().includes(query.toLowerCase())) ||
        (song.artist && song.artist.toLowerCase().includes(query.toLowerCase()))
    );
    

    if (filteredSongs.length === 0) {
        searchResults.innerHTML = "<li>Uh Oh! We've searched Near and Far, We haven't Found this Song 😔..Maybe it is still not in our database 🤔?</li>;
        return;
    }

    filteredSongs.forEach((song) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div class="song">
                <img src="${song.cover}" alt="Cover Image">
                <strong>${song.title}</strong>
                <p>${song.artist}</p>
                <button class="play-btn" data-title="${song.title}">▶ Play</button>
            </div>
        `;
        searchResults.appendChild(li);
    });

    console.log("Results added:", searchResults.innerHTML);

    document.querySelectorAll(".play-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const songTitle = this.getAttribute("data-title");
            playSong(songTitle);
        });
    });
}

function playSong(songTitle) {
    console.log("playSong() function triggered for:", songTitle);

    let audioPlayer = document.getElementById("audioPlayer");
    if (!audioPlayer) {
        console.error("Audio player element not found!");
        return;
    }

    if (typeof database === "undefined" || typeof database !== "object") {
        console.error("Error: database is not defined or not an object in script.js!");
        return;
    }

    const allSongs = Object.values(database).flat(); // Flatten the database object into an array
    console.log("Available songs:", allSongs.map(song => song.title)); // Debugging available songs

    const song = allSongs.find(s => s.title.toLowerCase() === songTitle.toLowerCase());

    if (!song) {
        console.error("Song not found:", songTitle);
        alert("Error: Song not found!");
        return;
    }

    if (!song.url) {
        console.error("Missing 'src' in database for:", songTitle);
        alert("Error: Song file not found!");
        return;
    }

    let fullSrc = new URL(song.url, window.location.href).href;
    console.log("Full song URL:", fullSrc);

    // Force reload and assign new source
    audioPlayer.src = "";
    audioPlayer.load();
    audioPlayer.src = fullSrc;
    
    audioPlayer.play().then(() => {
        console.log("Now playing:", song.title);
    }).catch(error => {
        console.error("Playback failed:", error);
    });

    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title,
            artist: song.artist,
            artwork: [{ src: song.cover, sizes: "512x512", type: "image/png" }]
        });

        navigator.mediaSession.setActionHandler("play", () => audioPlayer.play());
        navigator.mediaSession.setActionHandler("pause", () => audioPlayer.pause());
        navigator.mediaSession.setActionHandler("stop", () => {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        });

        console.log("Now playing via Media Session:", song.title);
    }
}
filteredSongs.forEach((song) => {
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="song">
            <img src="${song.cover}" alt="Cover Image">
            <strong>${song.title}</strong>
            <p>${song.artist}</p>
            <button class="play-btn" data-title="${song.title}">
                <i class="fas fa-play"></i> Play
            </button>
        </div>
    `;
    searchResults.appendChild(li);
});

// ✅ Auto-play next song when the current one ends
audioPlayer.onended = function () {
    console.log("Song finished:", song.title);

    const nextIndex = (currentIndex + 1) % allSongs.length; // Loops to the first song after the last
    const nextSong = allSongs[nextIndex];

    console.log("Next song:", nextSong.title);
    playSong(nextSong.title); // Play the next song automatically
};

document.addEventListener("DOMContentLoaded", () => {
    const audioPlayer = document.getElementById("audioPlayer");

    // Check if a song is already playing
    const savedSong = localStorage.getItem("currentSong");
    if (savedSong) {
        const { url, title, time, isPlaying } = JSON.parse(savedSong);
        audioPlayer.src = url;
        audioPlayer.currentTime = time || 0;

        if (isPlaying) {
            audioPlayer.play();
        }
    }

    // Update localStorage when song changes
    audioPlayer.addEventListener("play", () => {
        updatePlaybackState(true);
    });

    audioPlayer.addEventListener("pause", () => {
        updatePlaybackState(false);
    });

    audioPlayer.addEventListener("timeupdate", () => {
        updatePlaybackState(audioPlayer.paused ? false : true);
    });

    function updatePlaybackState(isPlaying) {
        localStorage.setItem("currentSong", JSON.stringify({
            url: audioPlayer.src,
            title: audioPlayer.getAttribute("data-title") || "Unknown Song",
            time: audioPlayer.currentTime,
            isPlaying: isPlaying
        }));
    }
});
