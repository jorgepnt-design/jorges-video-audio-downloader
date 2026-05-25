#!/bin/sh
set -e

/opt/yt-dlp/bin/pip install --no-cache-dir --upgrade yt-dlp >/tmp/yt-dlp-update.log 2>&1 || cat /tmp/yt-dlp-update.log
npm start
