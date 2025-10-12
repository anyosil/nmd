#!/usr/bin/env node
/**
 * Symphonia Metadata Collector - Fast Version
 * -------------------------------------------
 * Crawls two GitHub repos recursively,
 * fetches metadata from MusicBrainz, iTunes, Deezer in parallel,
 * keeps cover only if found, logs progress as (current/total),
 * processes multiple songs in parallel to speed up large datasets.
 */

import fs from "fs";
import path from "path";
import axios from "axios";
import chalk from "chalk";

const GITHUB_DIRS = [
  "https://api.github.com/repos/anyosil/nmdmdb/contents/music",
  "https://api.github.com/repos/anyosil/symmusic.github.io/contents/music"
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const MAX_CONCURRENT_SONGS = 10; // Number of songs processed in parallel

async function fetchGitHubFiles(url) {
  const response = await axios.get(url, { headers: { "User-Agent": "Symphonia-Bot" } });
  let files = [];
  for (const item of response.data) {
    if (item.type === "dir") {
      files = files.concat(await fetchGitHubFiles(item.url));
    } else if (item.type === "file" && !item.name.endsWith("base.txt")) {
      files.push({
        name: item.name,
        url: item.download_url.replace("https://raw.githubusercontent.com/", "https://raw.github.com/")
      });
    }
  }
  return files;
}

async function fetchMusicBrainz(query) {
  try {
    const res = await axios.get(`https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`, {
      headers: { "User-Agent": "Symphonia-Metadata/1.0" },
      timeout: 3000
    });
    const rec = res.data.recordings?.[0];
    if (!rec) return null;
    const artist = rec["artist-credit"]?.[0]?.name || "Unknown Artist";
    const title = rec.title || query;
    const album = rec.releases?.[0]?.title || "Unknown Album";
    let cover;
    const mbid = rec.releases?.[0]?.id;
    if (mbid) {
      try {
        const c = await axios.get(`https://coverartarchive.org/release/${mbid}`, { timeout: 3000 });
        cover = c.data.images?.[0]?.image;
      } catch {}
    }
    return { title, artist, album, cover };
  } catch {
    return null;
  }
}

async function fetchiTunes(query) {
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1`, { timeout: 3000 });
    const item = res.data.results?.[0];
    if (!item) return null;
    return {
      title: item.trackName || query,
      artist: item.artistName || "Unknown Artist",
      album: item.collectionName || "Unknown Album",
      cover: item.artworkUrl100 ? item.artworkUrl100.replace("100x100", "1000x1000") : undefined
    };
  } catch {
    return null;
  }
}

async function fetchDeezer(query) {
  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, { timeout: 3000 });
    const song = res.data.data?.[0];
    if (!song) return null;
    return {
      title: song.title,
      artist: song.artist.name,
      album: song.album.title,
      cover: song.album.cover_xl || song.album.cover_big
    };
  } catch {
    return null;
  }
}

async function fetchMetadata(query) {
  const [mb, itunes, deezer] = await Promise.all([
    fetchMusicBrainz(query),
    fetchiTunes(query),
    fetchDeezer(query)
  ]);

  const meta = mb || itunes || deezer || { title: query, artist: "Unknown Artist", album: "Unknown Album" };
  return meta;
}

async function processSong(file, index, total) {
  const baseName = path.basename(file.name, path.extname(file.name)).replace(/^[0-9]+[\s-]*/, "");
  const meta = await fetchMetadata(baseName);
  const songData = { title: meta.title, artist: meta.artist, album: meta.album, url: file.url };
  if (meta.cover) songData.cover = meta.cover;
  console.log(chalk.yellow(`(${index + 1}/${total}) Found details for: ${meta.title}`));
  return songData;
}

async function main() {
  console.log(chalk.cyan.bold("\n🎵 Symphonia Metadata Collector - Fast Mode\n"));

  // Fetch all files from both repos
  let allFiles = [];
  for (const dir of GITHUB_DIRS) {
    const files = await fetchGitHubFiles(dir);
    allFiles = allFiles.concat(files);
  }

  console.log(chalk.green(`Found ${allFiles.length} total songs.\n`));

  const results = [];
  let currentIndex = 0;

  // Process songs in batches to allow concurrency
  while (currentIndex < allFiles.length) {
    const batch = allFiles.slice(currentIndex, currentIndex + MAX_CONCURRENT_SONGS);
    const promises = batch.map((file, idx) => processSong(file, currentIndex + idx, allFiles.length));
    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
    currentIndex += MAX_CONCURRENT_SONGS;
    await delay(2000); // polite pause before next batch
  }

  fs.writeFileSync("songs.json", JSON.stringify(results, null, 4));
  console.log(chalk.green.bold(`\n✅ Finished! songs.json created with ${results.length} songs.\n`));
}

main().catch(err => console.error(chalk.red("Error:"), err.message));
