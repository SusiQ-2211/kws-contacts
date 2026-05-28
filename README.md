# KWS Contact Capture
### Kingstown Web Studio - Networking Contact App

A PWA (Progressive Web App) for capturing business cards at events, saving to Google Sheets, and sending follow-up reminders.

---

## Files in this folder

| File | What it does |
|---|---|
| `index.html` | The complete app - this is everything |
| `manifest.json` | Makes it installable on iPhone home screen |
| `google-apps-script.js` | Paste this into Google Apps Script for the sheet backend |
| `README.md` | This file |

You'll also need two icon images (see Step 3 below):
- `icon-192.png` - 192×192px version of your KWS logo
- `icon-512.png` - 512×512px version of your KWS logo

---

## Step 1 - Set up GitHub Pages (free hosting)

1. Go to **github.com** and create a free account
2. Click **New repository** (the green button)
3. Name it `kws-contacts` - tick "Add a README file" - click Create
4. Click **Add file → Upload files**
5. Upload all files from this folder (index.html, manifest.json, google-apps-script.js, both icon PNGs)
6. Click **Commit changes**
7. Go to **Settings → Pages** (in the left sidebar)
8. Under "Source" select **Deploy from a branch**
9. Select **main** branch, **/ (root)** folder - click Save
10. Wait 2 minutes, then your app is live at: `https://YOUR-USERNAME.github.io/kws-contacts`

---

## Step 2 - Set up Google Sheet backend

1. Open a new Google Sheet in your Google Drive - name it **KWS Contacts**
2. Go to **Extensions → Apps Script**
3. Delete all the default code in the editor
4. Open `google-apps-script.js` from this folder, copy everything, paste it in
5. Click **Save** (the floppy disk icon)
6. Click **Deploy → New deployment**
7. Click the gear icon next to "Type" and select **Web app**
8. Fill in:
   - Description: `KWS Contact Capture`
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy**
10. Click **Authorize access** - sign in with your Google account
11. Copy the **Web app URL** - it looks like `https://script.google.com/macros/s/LONG_STRING/exec`

---

## Step 3 - Configure the app

1. Visit your app URL on your iPhone
2. Tap the share button in Safari → **Add to Home Screen** → Add
3. Open the app from your home screen
4. Tap the **Settings** tab (bottom right)
5. Paste your Apps Script URL into "Apps Script Web App URL"
6. Enter your email address for follow-up reminders
7. Your Vision API key is already pre-filled

That's it - you're live!

---

## Step 4 - Create app icons

You need two PNG versions of your KWS logo (pink square with daisy):
- `icon-192.png` at 192×192 pixels
- `icon-512.png` at 512×512 pixels

Export these from Canva/Photoshop/your design tool and upload them to your GitHub repository alongside the other files.

---

## How to use the app

**Capturing a card:**
1. Tap the camera icon or the + button
2. Tap the scan zone to photograph the card
3. Vision API reads the card and fills in the fields - check and edit if needed
4. Tap the mic to speak your notes ("warm lead, mentioned she wants a new site before autumn")
5. Select where you met them
6. Choose your follow-up reminder timing
7. Tap Save

**Follow-up reminders:**
- On the day you set, you'll get an email with the person's details and your notes
- Open the contact and tap "Mark follow-up done" when you've contacted them

**Your Google Sheet:**
- Every contact is saved as a row
- Navy header row, all your fields in columns
- You can sort, filter, add notes directly in the sheet

---

## Troubleshooting

**Camera not working:** iOS Safari requires the site to be served over HTTPS. GitHub Pages does this automatically - make sure you're using the github.io URL, not opening the file directly.

**OCR not filling fields:** The Vision API key is pre-configured. If it stops working, check the key in Settings. Cards with unusual fonts or poor lighting may need manual editing.

**Sheet not saving:** Check your Apps Script URL in Settings. If you re-deploy the Apps Script, the URL changes - you'll need to update it in the app.

**Voice notes not working:** Voice recognition requires Safari on iOS. It works in Safari but not in Chrome on iPhone.

---

## Your API key

Your Google Cloud Vision API key is baked into the app. If you need to change it, go to Settings in the app and update it there, or edit the `VISION_API_KEY` constant at the top of the JavaScript in index.html.

---

*Built for Susi Hogan, Kingstown Web Studio*
*kingstownwebstudio.co.uk*
