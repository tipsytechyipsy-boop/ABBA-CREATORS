/**
 * ABBA Creators — save website messages and Gmail emails to Google Sheets.
 *
 * Paste this whole file into Extensions → Apps Script of your Google Sheet.
 * Setup steps: see SETUP-GOOGLE-SHEETS.md in the website repo.
 *
 *  1. doPost()          — the website's contact form sends every message here
 *                          → saved in the "Website messages" tab
 *  2. logNewEmails()    — copies new emails from your Gmail inbox
 *                          → saved in the "Emails" tab
 *     setupEmailTrigger() — run ONCE to make logNewEmails() run every 5 minutes
 */

const WEBSITE_TAB = 'Website messages';
const EMAIL_TAB = 'Emails';
const LOGGED_LABEL = 'Saved to Sheet';   // Gmail label added to emails already copied
const EMAIL_SEARCH = 'in:inbox newer_than:7d -category:promotions -category:social';

/* ---------------- website form → sheet ---------------- */

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: real visitors never see or fill the hidden "website" field.
  if (p.website) return json_({ ok: true });

  const name = clean_(p.name, 120);
  const message = clean_(p.message, 5000);
  if (!name || !message) return json_({ ok: false, error: 'missing name or message' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = tab_(WEBSITE_TAB, ['Received', 'Name', 'Email', 'Needs', 'Message', 'Sent via', 'Page', 'Status']);
    sheet.appendRow([
      new Date(),
      name,
      clean_(p.email, 200),
      clean_(p.need, 60),
      message,
      clean_(p.channel, 20),
      clean_(p.page, 300),
      'New',
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Lets you open the web app URL in a browser to check it is live.
function doGet() {
  return json_({ ok: true, service: 'ABBA Creators contact form' });
}

/* ---------------- Gmail inbox → sheet ---------------- */

function logNewEmails() {
  const label = GmailApp.getUserLabelByName(LOGGED_LABEL) || GmailApp.createLabel(LOGGED_LABEL);
  const threads = GmailApp.search(EMAIL_SEARCH + ' -label:"' + LOGGED_LABEL + '"', 0, 50);
  if (!threads.length) return;

  const me = Session.getActiveUser().getEmail().toLowerCase();
  const sheet = tab_(EMAIL_TAB, ['Received', 'From', 'Subject', 'Preview', 'Open in Gmail', 'Status']);
  const rows = [];

  threads.forEach((thread) => {
    thread.getMessages().forEach((m) => {
      if (m.getFrom().toLowerCase().indexOf(me) !== -1) return; // skip emails you sent
      rows.push([
        m.getDate(),
        m.getFrom(),
        m.getSubject(),
        clean_(m.getPlainBody(), 500),
        'https://mail.google.com/mail/u/0/#inbox/' + m.getId(),
        'New',
      ]);
    });
    thread.addLabel(label);
  });

  if (rows.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  }
}

// Run this ONCE from the Apps Script editor. It makes logNewEmails() run every 5 minutes.
function setupEmailTrigger() {
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'logNewEmails')
    .forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('logNewEmails').timeBased().everyMinutes(5).create();
  logNewEmails();
}

/* ---------------- helpers ---------------- */

function tab_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#22b43a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clean_(value, max) {
  let s = String(value || '').replace(/\s+\n/g, '\n').trim().slice(0, max);
  // Stop spreadsheet formula injection (e.g. a message starting with "=").
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
