const fs = require("fs");
const path = require("path");
const axios = require("axios");

const GITHUB_REPO_API = "https://api.github.com/repos/anyosil/symmusic.github.io/git/trees/main?recursive=1";
const OUTPUT_FILE = path.join(__dirname, "songs.json");
const TARGET_DIRECTORY = "music/M1/"; // Only fetch from this folder
const RATE_LIMIT_DELAY = 2000; // Initial delay (increases with retries)

// Function to fetch MP3 files **only from the "music/M1/" directory**
async function fetchGitHubFiles(retryCount = 0) {
    try {
        console.log("🔍 Fetching file list from GitHub...");
        const response = await axios.get(GITHUB_REPO_API, { headers: { "User-Agent": "request" } });

        let mp3Files = response.data.tree
            .filter(file => file.path.startsWith(TARGET_DIRECTORY) && file.path.endsWith(".mp3")) // Filter only from M1 directory
            .map(file => file.path);

        return mp3Files;
    } catch (error) {
        console.warn(`⚠️ GitHub API rate limit hit. Retrying in ${RATE_LIMIT_DELAY * (retryCount + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * (retryCount + 1)));
        if (retryCount < 5) return fetchGitHubFiles(retryCount + 1);
        console.error("❌ Failed to fetch songs after multiple attempts.");
        return [];
    }
}

// Function to clean song names
function cleanSongName(filename) {
    let name = path.basename(filename, ".mp3");
    return name.replace(/^\d{2}/, "").trim();
}

// Function to fetch song metadata with rate limit protection
async function fetchMetadata(songName, retryCount = 0) {
    try {
        let searchQuery = encodeURIComponent(songName);
        let url = `https://musicbrainz.org/ws/2/recording/?query=${searchQuery}&fmt=json`;
        let response = await axios.get(url);
        let result = response.data.recordings?.[0];

        if (result) {
            return {
                title: result.title || songName,
                artist: result["artist-credit"]?.[0]?.name || "Unknown Artist",
                album: result.releases?.[0]?.title || "Unknown Album",
                language: result.languages?.[0] || "Unknown",
                cover: `https://coverartarchive.org/release/${result.releases?.[0]?.id}/front`
            };
        }
    } catch (error) {
        console.warn(`⚠️ Rate limit hit for "${songName}". Retrying in ${RATE_LIMIT_DELAY * (retryCount + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY * (retryCount + 1)));
        if (retryCount < 5) return fetchMetadata(songName, retryCount + 1);
    }
    return { title: songName, artist: "Unknown Artist", album: "Unknown Album", language: "Unknown", cover: "" };
}

// Function to update progress in the console
function updateProgress(current, total) {
    const percentage = ((current / total) * 100).toFixed(2);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`⏳ Progress: ${current}/${total} songs (${percentage}%)`);
}

// Main function to fetch all songs
async function fetchAllSongs() {
    let files = await fetchGitHubFiles();
    let totalSongs = files.length;

    if (totalSongs === 0) {
        console.log("❌ No songs found in the 'music/M1' directory.");
        return;
    }

    console.log(`🎵 Found ${totalSongs} songs in 'music/M1'. Fetching metadata...\n`);
    let songs = [];

    for (let i = 0; i < totalSongs; i++) {
        let file = files[i];
        let songName = cleanSongName(file);
        let metadata = await fetchMetadata(songName);
        songs.push({ ...metadata, url: `https://github.com/anyosil/symmusic.github.io/blob/main/${file}` });

        // Update progress
        updateProgress(i + 1, totalSongs);
    }

    // Save to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 4));
    console.log("\n✅ Songs saved to:", OUTPUT_FILE);
}

// Run the script
fetchAllSongs();
