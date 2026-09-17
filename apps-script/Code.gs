const CONFIG = Object.freeze({
  FOLDER_ID: '1hfwpx4Ifxxi-XH-MpMEgH3xm1S-yss52',
  MAX_FILE_BYTES: 8 * 1024 * 1024,
  MAX_GALLERY_ITEMS: 100,
  MAX_RSVP_GUESTS: 10,
  MAX_DAILY_UPLOADS: 1000,
  MAX_DAILY_UPLOAD_BYTES: 2 * 1024 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
});

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return jsonOut({ ok: false, error: 'Missing request payload.' });
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (error) {
    return jsonOut({ ok: false, error: 'Invalid JSON payload.' });
  }

  try {
    if (data.type === 'rsvp') return handleRsvp(data);
    if (data.file && data.filename) return handleUpload(data);
    return jsonOut({ ok: false, error: 'Unknown request type.' });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonOut({ ok: false, error: 'The request could not be completed.' });
  }
}

function handleRsvp(data) {
  const sheetId = PropertiesService.getScriptProperties().getProperty('RSVP_SHEET_ID');
  if (!sheetId) return jsonOut({ ok: false, error: 'RSVP storage is not configured.' });

  const guests = Array.isArray(data.guests) ? data.guests : null;
  if (guests && (guests.length < 1 || guests.length > CONFIG.MAX_RSVP_GUESTS)) {
    return jsonOut({ ok: false, error: 'Invalid party size.' });
  }

  const now = new Date();
  const partyId = Utilities.formatDate(now, 'UTC', 'yyyyMMddHHmmss') +
    '-' + Math.floor(Math.random() * 1000);
  const rows = guests
    ? guests.map(function (guest, index) {
        return [
          now,
          cleanText(guest.firstName, 80),
          cleanText(guest.lastName, 80),
          cleanText(guest.attending, 20),
          cleanText(guest.meal, 30),
          cleanText(guest.dietary, 500),
          index === 0 ? cleanText(data.message, 1000) : '',
          index === 0 ? cleanText(data.lang, 10) : '',
          partyId,
          guests.length,
          index + 1,
        ];
      })
    : [[
        now,
        cleanText(data.firstName, 80),
        cleanText(data.lastName, 80),
        cleanText(data.attending || data.attendance, 20),
        cleanText(data.meal, 30),
        cleanText(data.dietary, 500),
        cleanText(data.message, 1000),
        cleanText(data.lang, 10),
        partyId,
        1,
        1,
      ]];

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    return jsonOut({ ok: false, error: 'The RSVP service is busy. Please retry.' });
  }

  try {
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName('RSVPs') || spreadsheet.insertSheet('RSVPs');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'First', 'Last', 'Attending', 'Meal', 'Dietary',
        'Message', 'Lang', 'PartyId', 'PartySize', 'GuestNumber',
      ]);
    }
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  } finally {
    lock.releaseLock();
  }

  return jsonOut({ ok: true, rows: rows.length });
}

function handleUpload(data) {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('UPLOADS_ENABLED') === 'false') {
    return jsonOut({ ok: false, error: 'Photo uploads are temporarily paused.' });
  }

  const match = String(data.file).match(/^data:([^;]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) return jsonOut({ ok: false, error: 'Invalid image data.' });

  const mime = String(match[1]).toLowerCase();
  if (CONFIG.ALLOWED_IMAGE_TYPES.indexOf(mime) === -1) {
    return jsonOut({ ok: false, error: 'Unsupported image type.' });
  }

  let bytes;
  try {
    bytes = Utilities.base64Decode(match[2]);
  } catch (error) {
    return jsonOut({ ok: false, error: 'Invalid image encoding.' });
  }
  if (!bytes.length || bytes.length > CONFIG.MAX_FILE_BYTES) {
    return jsonOut({ ok: false, error: 'Image exceeds the upload size limit.' });
  }

  const filename = uniqueFilename(sanitizeFilename(data.filename), mime);
  const blob = Utilities.newBlob(bytes, mime, filename);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    return jsonOut({ ok: false, error: 'The album is busy. Please retry.' });
  }

  let file;
  try {
    const quotaKey = 'UPLOAD_QUOTA_' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
    const quota = JSON.parse(properties.getProperty(quotaKey) || '{"files":0,"bytes":0}');
    if (quota.files >= CONFIG.MAX_DAILY_UPLOADS ||
        quota.bytes + bytes.length > CONFIG.MAX_DAILY_UPLOAD_BYTES) {
      return jsonOut({ ok: false, error: 'The album has reached its daily upload limit.' });
    }
    // The folder is already shared publicly, so a slow per-file sharing call is unnecessary.
    file = DriveApp.getFolderById(CONFIG.FOLDER_ID).createFile(blob);
    CacheService.getScriptCache().remove('gallery-feed-v1');
    properties.setProperty(quotaKey, JSON.stringify({
      files: quota.files + 1,
      bytes: quota.bytes + bytes.length,
    }));
  } finally {
    lock.releaseLock();
  }

  return jsonOut({
    ok: true,
    id: file.getId(),
    filename: file.getName(),
    bytes: bytes.length,
  });
}

function doGet() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('gallery-feed-v1');
    if (cached) return jsonOut(JSON.parse(cached));

    const files = DriveApp.getFolderById(CONFIG.FOLDER_ID).getFiles();
    const photos = [];
    while (files.hasNext()) {
      const file = files.next();
      const mime = String(file.getMimeType() || '').toLowerCase();
      if (CONFIG.ALLOWED_IMAGE_TYPES.indexOf(mime) === -1) continue;
      if (/(codex_|redirect-check|wedding-browser-upload-test)/i.test(file.getName())) continue;
      photos.push({
        id: file.getId(),
        name: file.getName(),
        mime: mime,
        modified: file.getLastUpdated().getTime(),
      });
    }
    photos.sort(function (a, b) { return b.modified - a.modified; });
    const response = { ok: true, photos: photos.slice(0, CONFIG.MAX_GALLERY_ITEMS) };
    cache.put('gallery-feed-v1', JSON.stringify(response), 60);
    return jsonOut(response);
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonOut({ ok: false, error: 'The gallery is temporarily unavailable.' });
  }
}

function sanitizeFilename(value) {
  const safe = String(value || 'guest-photo')
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '_')
    .replace(/^[_\.]+|[_\.]+$/g, '')
    .slice(0, 100);
  return safe || 'guest-photo';
}

function uniqueFilename(filename, mime) {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/heic': '.heic',
    'image/heif': '.heif',
  };
  const extension = extensions[mime] || '';
  const base = filename.replace(/\.[A-Za-z0-9]{2,5}$/, '') || 'guest-photo';
  const stamp = Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd-HHmmss');
  return stamp + '-' + Utilities.getUuid().slice(0, 8) + '-' + base + extension;
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function jsonOut(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
