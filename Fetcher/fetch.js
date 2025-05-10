const fs = require("fs");
const path = require("path");
const axios = require("axios");

const GITHUB_REPO_API = "https://api.github.com/repos/anyosil/nmdmdb/git/trees/main?recursive=1";
const OUTPUT_FILE = path.join(__dirname, "songs.json");
const TARGET_DIRECTORY = "music"; // Fetch only from this folder
let RATE_LIMIT_DELAY = 2; // Initial delay (dynamically increases)

async function fetchGitHubFiles(retryCount = 0) {
    try {
        console.log("🔍 Fetching file list from GitHub...");
        const response = await axios.get(GITHUB_REPO_API, { headers: { "User-Agent": "request" } });
        
        let mp3Files = response.data.tree
            .filter(file => file.path.startsWith(TARGET_DIRECTORY) && file.path.endsWith(".mp3"))
            .map(file => file.path);
        
        return mp3Files;
    } catch (error) {
        console.warn(`⚠️ GitHub API rate limit hit. Retrying in ${RATE_LIMIT_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        RATE_LIMIT_DELAY *= 2; // Increase delay exponentially
        if (retryCount < 5) return fetchGitHubFiles(retryCount + 1);
        console.error("❌ Failed to fetch songs after multiple attempts.");
        return [];
    }
}

function cleanSongName(filename) {
    let name = path.basename(filename, ".mp3");
    return name.replace(/^\d{2}/, "").trim();
}

async function fetchMetadata(songName) {
    const metadataSources = [
        { url: `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(songName)}&fmt=json`, key: "musicbrainz" },
        { url: `https://itunes.apple.com/search?term=${encodeURIComponent(songName)}&entity=song&limit=1`, key: "itunes" },
        { url: `https://api.deezer.com/search?q=${encodeURIComponent(songName)}`, key: "deezer" }
    ];

    let metadata = {};
    const shuffledSources = metadataSources.sort(() => 0.5 - Math.random()); // Randomize request order

    for (const source of shuffledSources) {
        try {
            const response = await axios.get(source.url, { timeout: 5000 });
            
            if (response.data) {
                if (!metadata.title && response.data.recordings) {
                    metadata.title = response.data.recordings[0]?.title;
                    metadata.artist = response.data.recordings[0]?.['artist-credit']?.[0]?.name;
                }
                if (!metadata.album && response.data.results) {
                    metadata.album = response.data.results[0]?.collectionName;
                    metadata.cover = response.data.results[0]?.artworkUrl100;
                }
                if (!metadata.artist && response.data.data) {
                    metadata.artist = response.data.data[0]?.artist?.name;
                    metadata.album = response.data.data[0]?.album?.title;
                    metadata.cover = response.data.data[0]?.album?.cover_medium;
                }
            }
        } catch (error) {
            console.warn(`⚠️ Rate limit hit for ${source.key}. Retrying in ${RATE_LIMIT_DELAY}ms...`);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
            RATE_LIMIT_DELAY *= 1.5; // Increase delay gradually
        }
    }

    return metadata;
}

function updateProgress(current, total) {
    const percentage = ((current / total) * 100).toFixed(2);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`⏳ Progress: ${current}/${total} songs (${percentage}%)`);
}

async function fetchAllSongs() {
    let files = await fetchGitHubFiles();
    let totalSongs = files.length;

    if (totalSongs === 0) {
        console.log("❌ No songs found in the 'music' directory.");
        return;
    }

    console.log(`🎵 Found ${totalSongs} songs in 'music'. Fetching metadata...\n`);
    let songs = [];

    for (let i = 0; i < totalSongs; i++) {
        let file = files[i];
        let songName = cleanSongName(file);
        let metadata = await fetchMetadata(songName);
        songs.push({ ...metadata, url: `https://github.com/anyosil/nmdmdb/blob/main/${file}` });
        updateProgress(i + 1, totalSongs);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 4));
    console.log("\n✅ Songs saved to:", OUTPUT_FILE);
}

fetchAllSongs();