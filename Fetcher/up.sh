#!/data/data/com.termux/files/usr/bin/bash

# === CONFIGURATION ===
REPO="anyosil/nmdmdb"
BRANCH="main"
TOKEN="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"
GIT_USER="Anyosil"
GIT_EMAIL="svishnusai2010@gmail.com"
SOURCE_DIR="/storage/emulated/0/Songs for Symphonia"
DEST_FOLDER="music"

# === Ensure Termux has storage permissions ===
termux-setup-storage

# === Loop through all mp3 files ===
for FILE_PATH in "$SOURCE_DIR"/*.mp3; do
  [ -f "$FILE_PATH" ] || continue  # skip if no mp3s found

  FILE_NAME=$(basename "$FILE_PATH")
  DEST_PATH="$DEST_FOLDER/$FILE_NAME"
  echo "Uploading $FILE_NAME..."

  # Convert to base64
  CONTENT_BASE64=$(base64 -w 0 "$FILE_PATH")

  # Check if file already exists to get its SHA (needed for overwrites)
  SHA=$(curl -s \
    -H "Authorization: token $TOKEN" \
    https://api.github.com/repos/$REPO/contents/$DEST_PATH \
    | grep '"sha":' | head -1 | cut -d '"' -f 4)

  # Prepare JSON payload
  JSON_PAYLOAD=$(jq -n \
    --arg message "Upload $FILE_NAME to $DEST_FOLDER" \
    --arg branch "$BRANCH" \
    --arg content "$CONTENT_BASE64" \
    --arg name "$GIT_USER" \
    --arg email "$GIT_EMAIL" \
    --arg destpath "$DEST_PATH" \
    --arg sha "$SHA" \
    '{
      message: $message,
      branch: $branch,
      content: $content,
      committer: {
        name: $name,
        email: $email
      }
    } + (if $sha != "" then { sha: $sha } else {} end)'
  )

  # Upload to GitHub
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    https://api.github.com/repos/$REPO/contents/$DEST_PATH)

  if [ "$RESPONSE" = "201" ] || [ "$RESPONSE" = "200" ]; then
    echo "✅ $FILE_NAME uploaded successfully!"
  else
    echo "❌ Failed to upload $FILE_NAME (HTTP $RESPONSE)"
  fi

done