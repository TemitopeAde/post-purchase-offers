// Paste this file into a Google Apps Script project.
// Script properties:
//   SPREADSHEET_ID: ID between /d/ and /edit in the Google Sheet URL
//   LIFECYCLE_WEBHOOK_SECRET: long random secret shared with Wix
// Deploy as a Web app, execute as you, with access for anyone.

var LIFECYCLE_TYPES = [
  'AppInstalled', 'AppRemoved', 'PaidPlanPurchased', 'PaidPlanChanged',
  'PaidPlanAutoRenewalCancelled', 'PlanConvertedToPaid', 'PlanReactivated',
  'PlanTransferred'
];

var LIFECYCLE_COLUMNS = [
  ['eventId', 'Event ID'], ['eventType', 'Event type'],
  ['receivedAt', 'Received at (UTC)'], ['occurredAt', 'Occurred at (UTC)'],
  ['appName', 'App name'], ['appId', 'App ID'], ['appVersion', 'App version'],
  ['instanceId', 'Instance ID'], ['accountId', 'Account ID'], ['siteId', 'Site ID'],
  ['siteName', 'Site name'], ['siteUrl', 'Site URL'], ['ownerEmail', 'Owner email'],
  ['planId', 'Event plan'], ['currentPlanId', 'Current plan'],
  ['previousPlanId', 'Previous plan'], ['billingCycle', 'Billing cycle'],
  ['previousBillingCycle', 'Previous billing cycle'], ['invoiceId', 'Invoice ID'],
  ['expiresOn', 'Expires on'], ['couponName', 'Coupon name'], ['isFree', 'Is free'],
  ['autoRenewing', 'Auto renewing'], ['freeTrialStatus', 'Free trial status'],
  ['freeTrialEndDate', 'Free trial end date'], ['cancelReason', 'Cancel reason'],
  ['userReason', 'User cancel reason'], ['cancellationType', 'Cancellation type'],
  ['cancelledDuringFreeTrial', 'Cancelled during free trial'],
  ['reactivationReason', 'Reactivation reason'], ['originInstanceId', 'Origin instance ID'],
  ['snapshotStatus', 'Instance details status'], ['payloadJson', 'Full event JSON'],
  ['snapshotJson', 'Full instance JSON']
];

function lifecycleJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function lifecycleCell_(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'boolean' || typeof value === 'number') return value;
  var text = typeof value === 'string' ? value : JSON.stringify(value);
  if (text.length > 45000) throw new Error('Lifecycle value exceeds the supported cell size.');
  return /^[\s]*[=+@-]/.test(text) ? "'" + text : text;
}

function lifecycleSheet_(eventType) {
  if (LIFECYCLE_TYPES.indexOf(eventType) === -1) throw new Error('Unknown lifecycle type.');
  var properties = PropertiesService.getScriptProperties();
  var spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Set the SPREADSHEET_ID script property.');
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheet = spreadsheet.getSheetByName(eventType) || spreadsheet.insertSheet(eventType);
  if (sheet.getMaxColumns() < LIFECYCLE_COLUMNS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), LIFECYCLE_COLUMNS.length - sheet.getMaxColumns());
  }
  var headers = LIFECYCLE_COLUMNS.map(function (column) { return column[1]; });
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    var existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (JSON.stringify(existing) !== JSON.stringify(headers)) {
      throw new Error('Headers differ in tab ' + eventType + '. Rename that tab before retrying.');
    }
  }
  return sheet;
}

function setupLifecycleSheet() {
  if (!PropertiesService.getScriptProperties().getProperty('LIFECYCLE_WEBHOOK_SECRET')) {
    throw new Error('Set the LIFECYCLE_WEBHOOK_SECRET script property.');
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    LIFECYCLE_TYPES.forEach(function (eventType) { lifecycleSheet_(eventType); });
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock;
  var locked = false;
  try {
    var body = JSON.parse(e && e.postData ? e.postData.contents : '{}');
    var secret = PropertiesService.getScriptProperties().getProperty('LIFECYCLE_WEBHOOK_SECRET');
    if (!secret || body.secret !== secret) return lifecycleJson_({ ok: false, error: 'Unauthorized' });
    var record = body.record;
    if (!record || !/^[a-f0-9]{64}$/.test(record.eventId) ||
        LIFECYCLE_TYPES.indexOf(record.eventType) === -1 ||
        typeof record.payloadJson !== 'string') {
      return lifecycleJson_({ ok: false, error: 'Invalid lifecycle record' });
    }
    JSON.parse(record.payloadJson);
    var row = LIFECYCLE_COLUMNS.map(function (column) { return lifecycleCell_(record[column[0]]); });
    lock = LockService.getScriptLock();
    lock.waitLock(5000);
    locked = true;
    var sheet = lifecycleSheet_(record.eventType);
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1)
        .createTextFinder(record.eventId).matchEntireCell(true).useRegularExpression(false).findNext()) {
      return lifecycleJson_({ ok: true, duplicate: true, eventId: record.eventId });
    }
    if (lastRow >= sheet.getMaxRows()) sheet.insertRowsAfter(lastRow, 1);
    sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
    SpreadsheetApp.flush();
    return lifecycleJson_({ ok: true, duplicate: false, eventId: record.eventId });
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Lifecycle write failed');
    return lifecycleJson_({ ok: false, error: 'Lifecycle write failed; check Apps Script executions.' });
  } finally {
    if (locked) lock.releaseLock();
  }
}
