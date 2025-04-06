#!/data/data/com.termux/files/usr/bin/bash

# === CONFIGURATION ===
REPO="anyosil/nmdmdb"
BRANCH="main"
ENCODED_TOKEN="Z2hwX1NrMHN4dndhWmNUME5OWE9HZHhuS3lrV0RqY3FYYjJ2N1FxZg=="
TOKEN=$(echo "$ENCODED_TOKEN" | base64 -d)
GIT_USER="Anyosil"
GIT_EMAIL="svishnusai2010@gmail.com"
SOURCE_DIR="/storage/emulated/0/Songs for Symphonia"
DEST_FOLDER="music"

# === Ensure storage permission is granted ===
termux-setup-storage

# === Install jq and openssl if not present ===
command -v jq >/dev/null 2>&1 || pkg install jq -y
command -v openssl >/dev/null 2>&1 || pkg install openssl-tool -y

# === Upload loop ===
for FILE_PATH in "$SOURCE_DIR"/*.mp3; do
  [ -f "$FILE_PATH" ] || continue

  FILE_NAME=$(basename "$FILE_PATH")
  DEST_PATH="$DEST_FOLDER/$FILE_NAME"
  echo "Uploading: $FILE_NAME"

  # Encode to base64
  CONTENT_BASE64=$(openssl base64 -in "$FILE_PATH" | tr -d '\n')

  # Get file SHA if it exists
  SHA=$(curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$REPO/contents/$DEST_PATH" \
        | jq -r .sha)

  # Create payload
  JSON_PAYLOAD=$(jq -n \
    --arg message "Upload $FILE_NAME" \
    --arg content "$CONTENT_BASE64" \
    --arg branch "$BRANCH" \
    --arg name "$GIT_USER" \
    --arg email "$GIT_EMAIL" \
    --arg sha "$SHA" \
    '{
      message: $message,
      branch: $branch,
      content: $content,
      committer: { name: $name, email: $email }
    } + ( $sha | select(. != "null") | { sha: . })'
  )

  # Upload
  RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X PUT \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD" \
    "https://api.github.com/repos/$REPO/contents/$DEST_PATH")

  if [[ "$RESPONSE" == "201" || "$RESPONSE" == "200" ]]; then
    echo "✅ Uploaded: $FILE_NAME"
  else
    echo "❌ Failed to upload: $FILE_NAME (HTTP $RESPONSE)"
  fi
done