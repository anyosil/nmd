import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import readline from "readline";

const MUSIC_EXTS = [".mp3", ".flac", ".wav", ".aac", ".ogg", ".m4a"];

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

function getMusicFiles(dir = ".") {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) results = results.concat(getMusicFiles(filepath));
    else if (MUSIC_EXTS.includes(path.extname(file).toLowerCase())) results.push(filepath);
  }
  return results;
}

async function uploadFile(filePath, { owner, repo, branch, basePath, token, baseDir }) {
  const content = fs.readFileSync(filePath).toString("base64");
  const relativePath = path.relative(baseDir, filePath).replace(/\\/g, "/");
  const uploadPath = `${basePath}/${relativePath}`;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${uploadPath}`;

  // Check if file exists
  const checkRes = await fetch(apiUrl, { headers: { Authorization: `token ${token}` } });
  const existing = checkRes.ok ? await checkRes.json() : null;

  const payload = {
    message: `${existing ? "Update" : "Add"} ${relativePath}`,
    content,
    branch,
    sha: existing?.sha,
  };

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.ok) console.log(`✅ Uploaded: ${relativePath}`);
  else console.error(`❌ Failed: ${relativePath} (${res.status})`);
}

async function main() {
  console.log("🎵 Auto GitHub Music Uploader\n");

  const token = process.env.GITHUB_TOKEN || await prompt("🔑 Enter GitHub token: ");
  const repoUrl = await prompt("📦 Enter repo URL (e.g. https://github.com/anyosil/nmdmdb): ");
  const branch = (await prompt("🌿 Branch name (default: main): ")) || "main";
  const uploadDir = (await prompt("📁 Upload path inside repo (default: music): ")) || "music";

  const [_, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
  if (!owner || !repo) {
    console.error("❌ Invalid repo URL format!");
    process.exit(1);
  }

  const baseDir = process.cwd();
  const files = getMusicFiles(baseDir);

  if (!files.length) {
    console.log("No music files found!");
    return;
  }

  console.log(`🎧 Found ${files.length} music file(s). Uploading...\n`);

  for (const file of files) {
    await uploadFile(file, { owner, repo, branch, basePath: uploadDir, token, baseDir });
  }

  console.log("\n✨ Upload complete!");
}

main().catch(console.error);
