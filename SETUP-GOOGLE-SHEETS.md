# Save messages to Google Sheets

This connects the website and your Gmail to one Google Sheet:

| Tab | What lands there | When |
|---|---|---|
| **Website messages** | Every message sent through the contact form (both "Send on WhatsApp" and "Send by email") | Instantly |
| **Emails** | New emails in your Gmail inbox (skips Promotions, Social and emails you sent) | Every 5 minutes |

Each row has a **Status** column set to `New`, so you can change it to `Replied`, `Quoted`, `Won` and so on.

> **WhatsApp note:** messages people send straight to your WhatsApp number can't be read by Google Sheets. That needs the paid WhatsApp Business Platform from Meta. Messages that come through the website's "Send on WhatsApp" button *are* saved, because the website records them before opening WhatsApp.

Setup takes about 10 minutes and is done once.

---

## 1. Make the sheet and paste the script

1. Go to [sheets.new](https://sheets.new) (signed in as the Google account whose Gmail you want to log). Name it something like **ABBA Creators – Leads**.
2. Click **Extensions → Apps Script**.
3. Delete the code that's there, then paste in everything from [`google-apps-script/Code.gs`](google-apps-script/Code.gs).
4. Click the 💾 **Save** icon.

## 2. Turn on the website form

1. In Apps Script, click **Deploy → New deployment**.
2. Click the ⚙️ gear next to "Select type" and choose **Web app**.
3. Set:
   - **Description:** `Website contact form`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone** (this lets the website send messages in — it does *not* let anyone read your sheet)
4. Click **Deploy**, then **Authorize access** and allow it with your Google account.
   Google may say the app "isn't verified" — that's normal for your own script. Click **Advanced → Go to (project name)**.
5. Copy the **Web app URL** (it ends in `/exec`).
6. Open [`script.js`](script.js), find this line near the contact-form section and paste the URL between the quotes:

   ```js
   const SHEET_URL = ""; // ← paste your Apps Script web app URL here (ends in /exec)
   ```

7. Commit and push (or ask Claude to). Send yourself a test message from the Contact page — a **Website messages** tab appears in the sheet with your row.

## 3. Turn on Gmail logging

1. Back in Apps Script, pick **setupEmailTrigger** in the function dropdown at the top, then click **▶ Run**.
2. Allow the Gmail permission when asked.

That's it. It copies emails from the last 7 days right away, then checks every 5 minutes. Each copied email gets a Gmail label **Saved to Sheet** so it's never copied twice.

To stop it: Apps Script → **Triggers** (⏰ icon on the left) → delete the `logNewEmails` trigger.

---

## Changing the script later

If you edit `Code.gs`, the website keeps using the old version until you go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

## Spam protection

- A hidden "Website" field in the form catches most bots; anything that fills it is ignored.
- Messages without a name or message are rejected.
- Cells starting with `=`, `+`, `-` or `@` are escaped so nobody can slip a formula into your sheet.
