/**
 * Commonplace expense tracker backend.
 * Deploy this Apps Script as a web app (execute as you; access: anyone).
 * Run installDailyReminder once from the editor to authorize Sheets/Mail and
 * install the trigger. The sheet timezone controls the scheduled reminder.
 */
const SHEET_NAME = 'Expenses';
const HEADERS = ['Date', 'Amount', 'Description', 'Category', 'Paid by', 'Note', 'Entry ID', 'Type'];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.action === 'expense') appendExpense_(body.expense);
    if (body.action === 'config') saveConfig_(body);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// JSONP read endpoint lets the static app load shared rows without a server.
function doGet(e) {
  const data = getSheet_().getDataRange().getDisplayValues();
  const rows = data.slice(1).filter(r => r[6]).map(r => ({
    id: String(r[6]), date: String(r[0]), amount: Number(String(r[1]).replace(/,/g, '')), description: String(r[2]),
    category: String(r[3]), paidBy: String(r[4]), note: String(r[5]), type: String(r[7] || 'expense').toLowerCase(), createdAt: ''
  }));
  const payload = JSON.stringify({ ok: true, expenses: rows });
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  if (!/^[A-Za-z_$][\w.$]*$/.test(callback)) {
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(`${callback}(${payload})`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function appendExpense_(item) {
  if (!item || !item.amount || !item.description) throw new Error('Expense needs amount and description.');
  const sheet = getSheet_();
  sheet.appendRow([item.date || '', Number(item.amount), item.description, item.category || 'Other',
    item.paidBy || '', item.note || '', item.id || Utilities.getUuid(), item.type || 'expense']);
}

function saveConfig_(body) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('EMAILS', JSON.stringify((body.emails || []).filter(String)));
  props.setProperty('REMINDER_TIME', body.reminderTime || '20:00');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#e8ede4');
    sheet.setColumnWidths(1, HEADERS.length, 140);
  } else if (sheet.getRange(1, 8).getValue() !== 'Type') {
    sheet.getRange(1, 8).setValue('Type').setFontWeight('bold').setBackground('#e8ede4');
  }
  return sheet;
}

/** Run once manually after deploying and saving email addresses in the app. */
function installDailyReminder() {
  getSheet_();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'sendReminder')
    .forEach(t => ScriptApp.deleteTrigger(t));
  const time = PropertiesService.getScriptProperties().getProperty('REMINDER_TIME') || '20:00';
  const [hour, minute] = time.split(':').map(Number);
  // Apps Script clock triggers run within a short window around the selected hour.
  ScriptApp.newTrigger('sendReminder').timeBased().everyDays(1).atHour(hour).nearMinute(minute).create();
}

function sendReminder() {
  const props = PropertiesService.getScriptProperties();
  const emails = JSON.parse(props.getProperty('EMAILS') || '[]');
  if (!emails.length) return;
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  const day = Utilities.formatDate(new Date(), tz, 'EEEE, d MMMM');
  MailApp.sendEmail({
    to: emails.join(','),
    subject: 'A little 8 PM expense check-in',
    body: `Hi both,\n\nTake a minute to add today's household expenses to Commonplace.\n\n${day}\n${sheetUrl}\n\nA small check-in, then you're done.`,
    name: 'Commonplace'
  });
}

