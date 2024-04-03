#!/bin/sh

URL=$1
STORE_PATH=test/resources/$(sed 's/https:\/\///' <<< $URL | sed 's|/$||').html
STORE_FOLDER=$(dirname $STORE_PATH)

echo "Fetching $STORE_URL"
echo "Storing in $STORE_FOLDER as $STORE_PATH"

mkdir -p "$STORE_FOLDER"
curl -o "$STORE_PATH" "$URL"