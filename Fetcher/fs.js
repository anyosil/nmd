const fs = require('fs');
const fetch = require('node-fetch');
const { Octokit } = require('@octokit/rest');
const readline = require('readline-sync');

const SPOTIFY_CLIENT_ID = 'a3d7fbc83a94498ba578b978c8bd584c';
const SPOTIFY_CLIENT_SECRET = '6b5e34d0e1754fbea0bfc3a3d043a2f2';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getSpotifyToken() {
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    return data.access_token;
}

function extractSongName(filename) {
    return filename.replace(/^(\d+\s*[-_])?/, '').replace(/\.mp3$/i, '').replace(/[_-]/g, ' ').trim();
}

async function fetchFromSpotify(name, token) {
    const query = encodeURIComponent(name);
    const res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.tracks?.items?.length) {
        const track = data.tracks.items[0];
        return {
            title: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            cover: track.album.images[0]?.url || null,
            source: 'Spotify'
        };
    }
    throw new Error("Spotify not found");
}

async function fetchFromiTunes(name) {
    const query = encodeURIComponent(name);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1`);
    const data = await res.json();
    if (data.results?.length) {
        const result = data.results[0];
        return {
            title: result.trackName,
            artist: result.artistName,
            album: result.collectionName,
            cover: result.artworkUrl100,
            source: 'iTunes'
        };
    }
    throw new Error("iTunes not found");
}

async function fetchFromJioSaavn(name) {
    const query = encodeURIComponent(name);
    const res = await fetch(`https://saavn.dev/api/search/songs?query=${query}`);
    const data = await res.json();
    if (data?.data?.results?.length) {
        const song = data.data.results[0];
        return {
            title: song.name,
            artist: song.primaryArtists,
            album: song.album.name,
            cover: song.image[2]?.link || song.image[0]?.link || null,
            source: 'JioSaavn'
        };
    }
    throw new Error("JioSaavn not found");
}

function isMatch(sourceTitle, filename) {
    const lowerTitle = sourceTitle.toLowerCase().replace(/[^\w\s]/gi, '');
    const lowerFile = filename.toLowerCase().replace(/[^\w\s]/gi, '');
    return lowerFile.includes(lowerTitle) || lowerTitle.includes(lowerFile);
}

function resolveMetadata(metaList, fileName) {
    for (const meta of metaList) {
        if (isMatch(meta.title, fileName)) {
            return meta; // auto-select if title matches filename
        }
    }

    if (metaList.length === 0) return null;

    console.log(`Conflict in metadata for ${fileName}:`);
    metaList.forEach((meta, i) => {
        console.log(` [${i + 1}] ${meta.source}: ${meta.title} - ${meta.artist} (${meta.album})`);
    });

    const choice = readline.questionInt('Choose correct metadata [1/2/3/...]: ') - 1;
    return metaList[choice];
}

async function fetchSongs() {
    const octokit = new Octokit();
    const spotifyToken = await getSpotifyToken();
    const db = [];

    const repos = [
        { owner: 'anyosil', repo: 'nmdmdb', path: 'music' },
        { owner: 'anyosil', repo: 'symmusic.github.io', path: 'music/M1' }
    ];

    for (const repo of repos) {
        const res = await octokit.repos.getContent({
            owner: repo.owner,
            repo: repo.repo,
            path: repo.path
        });

        const files = res.data.filter(f => f.name.endsWith('.mp3'));

        for (const file of files) {
            const songName = extractSongName(file.name);
            const url = `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/main/${repo.path}/${file.name}`;
            console.log(`\nFetching metadata for: ${songName}`);

            const metaList = [];

            try { metaList.push(await fetchFromJioSaavn(songName)); } catch {}
            try { metaList.push(await fetchFromSpotify(songName, spotifyToken)); } catch {}
            try { metaList.push(await fetchFromiTunes(songName)); } catch {}

            // Check if at least one metadata matches filename
            if (!metaList.some(meta => isMatch(meta.title, songName))) {
                console.log(`Skipping ${file.name} - No title matches found`);
                continue;
            }

            const chosen = resolveMetadata(metaList, songName);
            if (chosen) {
                db.push({
                    title: chosen.title,
                    artist: chosen.artist,
                    album: chosen.album,
                    cover: chosen.cover,
                    url: url
                });
            } else {
                console.log(`Could not determine metadata for ${file.name}`);
            }

            await sleep(1000);
        }
    }

    fs.writeFileSync('songs.json', JSON.stringify(db, null, 2));
    console.log('\nDone. songs.json created with', db.length, 'songs.');
}

fetchSongs().catch(console.error);