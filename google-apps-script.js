// ─────────────────────────────────────────────────────────────────────────────
// KWS Contact Capture - Google Apps Script Backend
// Paste this entire file into script.google.com as a new project
// Then deploy as a Web App (see README for instructions)
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'Contacts';
const REMINDER_SUBJECT = 'KWS Contacts - Follow-up reminder';

// Column headers in order
const HEADERS = [
  'Date Captured',
  'Name',
  'Company',
  'Role',
  'Email',
  'Phone',
  'Website',
  'Event / Where Met',
  'Your Notes',
  'Follow-up Date',
  'Reminder Email',
  'Status'
];

// ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────
function doGet(e) {
  const params = e.parameter;
  const action = params.action || 'addContact';

  try {
    if (action === 'ping') {
      return jsonResponse({ status: 'ok', message: 'KWS Contact Capture connected' });
    }

    if (action === 'addContact') {
      return addContact(params);
    }

    if (action === 'getContacts') {
      return getContacts();
    }

    return jsonResponse({ status: 'error', message: 'Unknown action' });

  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

// ─── ADD CONTACT ─────────────────────────────────────────────────────────────
function addContact(params) {
  const sheet = getOrCreateSheet();

  const row = [
    params.dateCaptured || new Date().toISOString().split('T')[0],
    params.name || '',
    params.company || '',
    params.role || '',
    params.email || '',
    params.phone || '',
    params.website || '',
    params.event || '',
    params.notes || '',
    params.followupDate || '',
    params.reminderEmail || '',
    'Pending'
  ];

  sheet.appendRow(row);

  // Schedule follow-up reminder email
  if (params.reminderEmail && params.followupDate) {
    scheduleReminder(params);
  }

  return jsonResponse({
    status: 'ok',
    message: 'Contact saved',
    name: params.name
  });
}

// ─── GET CONTACTS ─────────────────────────────────────────────────────────────
function getContacts() {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return jsonResponse({ status: 'ok', contacts: [] });
  }

  const contacts = data.slice(1).map(row => ({
    dateCaptured: row[0],
    name: row[1],
    company: row[2],
    role: row[3],
    email: row[4],
    phone: row[5],
    website: row[6],
    event: row[7],
    notes: row[8],
    followupDate: row[9],
    reminderEmail: row[10],
    status: row[11]
  }));

  return jsonResponse({ status: 'ok', contacts });
}

// ─── SCHEDULE REMINDER ───────────────────────────────────────────────────────
function scheduleReminder(params) {
  try {
    const followupDate = new Date(params.followupDate + 'T09:00:00');
    const now = new Date();

    // Only schedule if the date is in the future
    if (followupDate > now) {
      ScriptApp.newTrigger('sendFollowUpEmail')
        .timeBased()
        .at(followupDate)
        .create();

      // Store the reminder details for the trigger to use
      const props = PropertiesService.getScriptProperties();
      const key = 'reminder_' + Date.now();
      props.setProperty(key, JSON.stringify({
        to: params.reminderEmail,
        name: params.name,
        company: params.company,
        notes: params.notes,
        event: params.event,
        followupDate: params.followupDate
      }));
    }
  } catch (err) {
    // Reminder scheduling failed silently - contact still saved
    Logger.log('Reminder scheduling error: ' + err);
  }
}

// ─── SEND FOLLOW-UP EMAIL ────────────────────────────────────────────────────
// This is called by the time-based trigger
function sendFollowUpEmail() {
  const props = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();

  // Find the earliest unprocessed reminder
  const reminderKeys = Object.keys(allProps).filter(k => k.startsWith('reminder_'));

  for (const key of reminderKeys) {
    try {
      const reminder = JSON.parse(allProps[key]);
      const followupDate = new Date(reminder.followupDate + 'T00:00:00');
      const today = new Date();

      // Send if today is the follow-up date
      if (followupDate.toDateString() === today.toDateString()) {
        const subject = `Follow-up reminder: ${reminder.name}`;
        const body = buildReminderEmail(reminder);
        MailApp.sendEmail({
          to: reminder.to,
          subject: subject,
          htmlBody: body
        });
        // Remove processed reminder
        props.deleteProperty(key);
      }
    } catch (err) {
      Logger.log('Error processing reminder ' + key + ': ' + err);
    }
  }
}

// ─── BUILD REMINDER EMAIL ────────────────────────────────────────────────────
function buildReminderEmail(r) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Poppins', Arial, sans-serif; background: #F7F5F7; margin: 0; padding: 20px; }
  .card { background: white; border-radius: 12px; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid rgba(18,49,116,0.1); }
  .header { background: #0c2155; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
  .header h1 { color: white; font-size: 16px; margin: 0; font-weight: 700; }
  .header p { color: rgba(255,255,255,0.6); font-size: 12px; margin: 4px 0 0; }
  .name { font-size: 20px; font-weight: 700; color: #123174; margin-bottom: 4px; }
  .co { font-size: 14px; color: #5a6a9a; margin-bottom: 16px; }
  .badge { display: inline-block; background: #fde8f3; color: #a0245e; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 16px; }
  .notes { background: #F7F5F7; border-radius: 8px; padding: 14px; font-size: 13px; color: #123174; line-height: 1.6; font-style: italic; margin-bottom: 16px; }
  .footer { font-size: 11px; color: #5a6a9a; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(18,49,116,0.1); }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>🌸 KWS Contact Capture</h1>
    <p>Follow-up reminder from Kingstown Web Studio</p>
  </div>
  <p style="font-size:13px;color:#5a6a9a;margin-bottom:12px;">Time to follow up with:</p>
  <div class="name">${r.name}</div>
  <div class="co">${r.company || r.role || ''}</div>
  ${r.event ? `<div class="badge">Met at: ${r.event}</div>` : ''}
  ${r.notes ? `<div class="notes">"${r.notes}"</div>` : ''}
  <p style="font-size:13px;color:#5a6a9a;line-height:1.6;">This reminder was set on the day you captured their contact details. Good luck with the follow-up!</p>
  <div class="footer">Sent by KWS Contact Capture &middot; kingstownwebstudio.co.uk</div>
</div>
</body>
</html>`;
}

// ─── SHEET SETUP ─────────────────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Add headers
    sheet.appendRow(HEADERS);
    // Style headers
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground('#123174');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    // Freeze header row
    sheet.setFrozenRows(1);
    // Set column widths
    sheet.setColumnWidth(1, 110);  // Date
    sheet.setColumnWidth(2, 150);  // Name
    sheet.setColumnWidth(3, 160);  // Company
    sheet.setColumnWidth(4, 140);  // Role
    sheet.setColumnWidth(5, 180);  // Email
    sheet.setColumnWidth(6, 120);  // Phone
    sheet.setColumnWidth(7, 150);  // Website
    sheet.setColumnWidth(8, 140);  // Event
    sheet.setColumnWidth(9, 280);  // Notes
    sheet.setColumnWidth(10, 110); // Follow-up date
    sheet.setColumnWidth(11, 180); // Reminder email
    sheet.setColumnWidth(12, 90);  // Status
  }

  return sheet;
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── MANUAL TEST ─────────────────────────────────────────────────────────────
// Run this function manually from the editor to test your sheet setup
function testSetup() {
  const sheet = getOrCreateSheet();
  Logger.log('Sheet ready: ' + sheet.getName());
  Logger.log('Headers: ' + sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0].join(', '));
}
