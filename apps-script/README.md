# Wedding Apps Script

This project powers RSVP submissions, photo uploads, and the public gallery feed.

## Deploy

1. Open the `M&M2509` Apps Script project in Google Drive.
2. Replace `Code.gs` with the tracked version in this directory.
3. Save, then create a new web-app deployment version.
4. Execute as the deploying user and allow access to anyone.
5. If Google issues a new `/exec` URL, update `APPS_SCRIPT_URL` in `lib/weddingConfig.ts`.

Before deploying, add an `RSVP_SHEET_ID` script property containing the private
RSVP spreadsheet ID. Keep that value out of the public repository.

The Drive folder itself supplies public read access. Do not add a per-file
`setSharing` call; it makes uploads substantially slower.

Set the `UPLOADS_ENABLED` script property to `false` for an immediate upload
kill switch. Removing the property or setting it to `true` enables uploads.
The script also enforces a 1,000-file / 2 GB daily safety ceiling.
