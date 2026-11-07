# Commonplace

A responsive, installable household money tracker. It records expenses and income, offers colorful icon based category choices, and shows monthly income, spending and the difference between them. Entries are stored on the current device and can be appended to a shared Google Sheet. The message helper extracts a likely amount, merchant and date from a pasted bank or payment SMS; both people review and confirm before adding it.

The savings goal is an optional monthly target. Its progress is calculated as recorded income minus recorded expenses, so it is an estimate of monthly surplus rather than a bank balance or a confirmed transfer into savings. The payday prompt encourages a simple pay-yourself-first habit. Entries can be archived from Recent activity; when connected, the Sheet row is retained with `Status = Archived` and can be restored by changing the status back to `Active`.

## Connect a Google Sheet

1. Create a Google Sheet and open **Extensions → Apps Script**.
2. Replace the editor contents with [`Code.gs`](Code.gs), then save.
3. Deploy → **New deployment** → **Web app**. Choose **Execute as: Me** and **Who has access: Anyone**, then deploy and authorize the script. The deployed endpoint URL grants read/write access to this sheet through the app, so keep it private and only use it in your household app.
4. Copy the web app URL. In Commonplace, open settings, paste the URL, add both email addresses and save. The first expense creates the `Expenses` tab and its headers.
5. In Apps Script, select `installDailyReminder` and click **Run** once. Approve the Sheets and email permissions. The daily email reminder will go to both addresses near 8 PM in the spreadsheet’s timezone. If you change the reminder time later, run `installDailyReminder` again.

## Run the web app

Serve this folder over HTTPS or localhost (for example, `npx serve .`), then open the URL on both phones and use **Add to Home Screen**. To share the app itself, host these static files on any HTTPS static host and use the same URL on both phones.

Each browser keeps a local cache and loads shared entries from the sheet when online. The sheet includes `Type` and `Status` columns. Existing expense rows are treated as expenses and active. Archived rows remain in the sheet for recovery. The entry interface can work offline, but an offline entry is not queued for later sheet delivery. Savings targets are stored on each device.

## Message suggestions and privacy

Web browsers do not have permission to read SMS inboxes. Paste a payment alert manually; the amount/merchant/date suggestion runs in your browser and the raw message is not sent to the Sheet. This app does not read email, SMS, or bank accounts. Review every suggestion before submitting it.

## Reminder behavior

The reminder is an email sent by Google Apps Script. Apps Script schedules near the requested hour (within a short time window), not at an exact minute. Both email addresses must be entered in settings before running `installDailyReminder`.

