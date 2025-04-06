// fetchSongs.js

const fs = require('fs');
const { Octokit } = require('@octokit/rest');
const fetch = require('node-fetch'); // Make sure to install node-fetch v2: npm install node-fetch@2

// Spotify credentials
const SPOTIFY_CLIENT_ID = 'a3d7fbc83a94498ba578b978c8bd584c';
const SPOTIFY_CLIENT_SECRET = '6b5e34d0e1754fbea0bfc3a3d043a2f2';

// GitHub Repositories
const GITHUB_REPOS = [
  { owner: 'anyosil', repo: 'nmdmdb', path: 'music' },
  { owner: 'anyosil', repo: 'symmusic.github.io', path: 'music/M1' }
];

const octokit = new Octokit();

async function getSpotifyAccessToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}

async function getGitHubFiles(owner, repo, dirPath, fileList = []) {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: dirPath
  });

  for (const item of response.data) {
    if (item.type === 'file') {
      fileList.push({ name: item.name, path: item.path, repo, owner });
    } else if (item.type === 'dir') {
      await getGitHubFiles(owner, repo, item.path, fileList);
    }
  }

  return fileList;
}

async function searchSpotify(query, token) {
  const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!data.tracks || data.tracks.items.length === 0) return null;
  const track = data.tracks.items[0];
  return {
    title: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    cover: track.album.images[0]?.url || '',
    url: '' // to be filled later
  };
}

async function searchiTunes(query) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid iTunes response (not JSON). Skipping:", query);
      return null;
    }
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    const track = data.results[0];
    return {
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      cover: track.artworkUrl100?.replace("100x100", "300x300") || '',
      url: ''
    };
  } catch (e) {
    console.error("Error fetching from iTunes for", query, e.message);
    return null;
  }
}

function isMP3(filename) {
  return filename.toLowerCase().endsWith('.mp3');
}

async function main() {
  const spotifyToken = await getSpotifyAccessToken();
  let allFiles = [];

  for (const repo of GITHUB_REPOS) {
    const files = await getGitHubFiles(repo.owner, repo.repo, repo.path);
    allFiles.push(...files);
  }

  allFiles = allFiles.filter(f => isMP3(f.name));

  const results = [];

  for (const file of allFiles) {
    const songName = file.name.replace(/^\\d+\\s*-\\s*/, '').replace(/\\.mp3$/i, '');
    const url = `https://raw.githubusercontent.com/${file.owner}/${file.repo}/main/${file.path}`;

    const spotifyData = await searchSpotify(songName, spotifyToken);
    const iTunesData = await searchiTunes(songName);

    let finalData = spotifyData || iTunesData;

    if (finalData) {
      finalData.url = url;
      results.push(finalData);
    } else {
      console.log(`Could not fetch metadata for: ${songName}`);
    }

    // Rate limit buffer
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  fs.writeFileSync('songs.json', JSON.stringify(results, null, 2));
  console.log('songs.json created with metadata for', results.length, 'songs');
}

main();