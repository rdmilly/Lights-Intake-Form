# 📋 Complete Setup Guide

This guide walks you through setting up the PNWLights multi-step quote form from start to finish.

**⏱️ Estimated Time: 15-20 minutes**

---

## Table of Contents

1. [Create Google Sheet](#step-1-create-google-sheet)
2. [Set Up Apps Script](#step-2-set-up-apps-script)
3. [Deploy the Webhook](#step-3-deploy-the-webhook)
4. [Configure the Form](#step-4-configure-the-form)
5. [Test the Integration](#step-5-test-the-integration)
6. [Add to Your Website](#step-6-add-to-your-website)
7. [Zapier + Jobber (Optional)](#step-7-zapier--jobber-optional)
8. [Troubleshooting](#troubleshooting)

---

## Step 1: Create Google Sheet

### 1.1 Create New Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: `PNWLights Quote Submissions`

### 1.2 Add Column Headers

In **Row 1**, add these headers (columns A through R):

| Col | Header |
|-----|--------|
| A | Timestamp |
| B | First Name |
| C | Last Name |
| D | Email |
| E | Phone |
| F | Company |
| G | Property Type |
| H | Experience |
| I | Areas to Light |
| J | Color Preference |
| K | Custom Color |
| L | Street Address |
| M | Unit/Apt |
| N | City |
| O | State |
| P | ZIP Code |
| Q | Additional Notes |
| R | Marketing Opt-in |

**💡 Tip:** Select Row 1, then **Format → Text → Bold** to make headers stand out.

---

## Step 2: Set Up Apps Script

### 2.1 Open Apps Script Editor

1. In your Google Sheet, click **Extensions → Apps Script**
2. A new tab opens with the script editor
3. Delete any existing code (like `function myFunction() {}`)

### 2.2 Paste the Script

1. Open `webhook-script.gs` from this repository
2. Copy the entire contents
3. Paste into the Apps Script editor

### 2.3 Configure Your Email

Find this line near the top:

```javascript
const EMAIL_TO = 'your-email@pnwlights.com';
```

Replace with your actual email address:

```javascript
const EMAIL_TO = 'ryan@pnwlights.com';
```

**Optional CC:**
```javascript
const EMAIL_CC = 'partner@pnwlights.com';
```

### 2.4 Save the Project

1. Click **File → Save** (or `Ctrl+S`)
2. Name the project: `PNWLights Quote Handler`

---

## Step 3: Deploy the Webhook

### 3.1 Start New Deployment

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Select **Web app**

### 3.2 Configure Settings

| Setting | Value |
|---------|-------|
| Description | `Quote Form Handler v1` |
| Execute as | `Me (your-email@gmail.com)` |
| Who has access | `Anyone` |

### 3.3 Authorize and Deploy

1. Click **Deploy**
2. Click **Authorize access**
3. Choose your Google account
4. Click **Advanced → Go to PNWLights Quote Handler (unsafe)**
   - *(This is safe—it's your own script!)*
5. Click **Allow**

### 3.4 Copy Your Webhook URL

After deployment, you'll see a URL like:

```
https://script.google.com/macros/s/AKfycbx...long-string.../exec
```

**⚠️ Copy this URL and save it somewhere!** You'll need it in the next step.

---

## Step 4: Configure the Form

### 4.1 Open the Form File

Open `quote-form.html` in your code editor (VSCode).

### 4.2 Update the Webhook URL

Find this line (around line 850):

```javascript
const WEBHOOK_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace with your actual Web App URL:

```javascript
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

### 4.3 Enable Production Mode

Find this line:

```javascript
const DEV_MODE = true;
```

Change to:

```javascript
const DEV_MODE = false;
```

### 4.4 Save the File

Save your changes (`Ctrl+S`).

---

## Step 5: Test the Integration

### 5.1 Open the Form Locally

1. Right-click `quote-form.html` in VSCode
2. Select **Open with Live Server**
3. The form opens in your browser

### 5.2 Submit a Test Entry

Fill out the form with test data:
- Step 1: Select "Home"
- Step 2: Select "No, first time!"
- Step 3: Select a few areas
- Step 4: Select a color
- Step 5: Enter a test address
- Step 6: Enter your contact info
- Click **Get My Free Quote!**

### 5.3 Verify It Worked

Check these things:

- [ ] **Google Sheet** has a new row with your test data
- [ ] **Email notification** arrived in your inbox
- [ ] **Confirmation screen** appeared in the form

✅ If all three work, you're ready to deploy!

---

## Step 6: Add to Your Website

Choose one of these options:

### Option A: Standalone Page (Easier)

1. Upload `quote-form.html` to your web hosting
2. Access it at: `https://pnwlights.com/quote-form.html`
3. Link to it from your main site

### Option B: Inline in Main Site (Better SEO)

This keeps everything on one page, which search engines prefer.

**Step 1: Copy the CSS**

From `quote-form.html`, copy everything between `<style>` and `</style>`.
Add it to your main `styles.css` file.

**Step 2: Copy the HTML**

Copy the entire `<div class="pnw-form-widget">...</div>` block.
Paste it into your `index.html` where you want the form to appear.

**Step 3: Copy the JavaScript**

Copy the entire `<script>...</script>` block.
Add it just before `</body>` in your `index.html`.

**Step 4: Remove the Jobber iframe**

Delete the old Jobber embedded form from your page.

---

## Step 7: Zapier + Jobber (Optional)

If you want form submissions to automatically create clients in Jobber:

### 7.1 Create Zapier Account

1. Go to [zapier.com](https://zapier.com)
2. Sign up (free tier: 100 tasks/month)

### 7.2 Create the Zap

**Trigger:**
- App: Google Sheets
- Event: New Spreadsheet Row
- Select your "PNWLights Quote Submissions" sheet

**Action 1: Find or Create Client**
- App: Jobber
- Event: Find or Create Client
- Map fields:
  - First Name → Column B
  - Last Name → Column C
  - Email → Column D
  - Phone → Column E
  - Company → Column F
  - Street → Column L
  - City → Column N
  - State → Column O
  - ZIP → Column P

**Action 2: Create Request**
- App: Jobber
- Event: Create Request
- Map fields:
  - Client → Client ID from Action 1
  - Title → `Holiday Lighting Quote Request`
  - Details → Combine columns G, H, I, J, K, Q

### 7.3 Test and Enable

1. Test the Zap with your test submission
2. Turn it on!

---

## Troubleshooting

### Form submits but no data appears in Sheet

1. ✅ Verify `DEV_MODE = false` in the form
2. ✅ Check the WEBHOOK_URL is correct (no typos)
3. ✅ View Apps Script logs: **Executions** tab

### No email notification received

1. ✅ Check spam/junk folder
2. ✅ Verify `EMAIL_TO` is correct in the script
3. ✅ Check Apps Script permissions include Gmail

### "Script function not found" error

1. ✅ Make sure you pasted the entire script
2. ✅ Check for the `doPost` function in your code

### Need to update the deployed script

1. Make changes in Apps Script
2. **Deploy → Manage deployments**
3. Click the pencil icon ✏️
4. Change version to **New version**
5. Click **Deploy**

*The URL stays the same—no need to update the form!*

---

## Need Help?

Common issues are usually:
1. Webhook URL not updated
2. DEV_MODE still set to `true`
3. Script not deployed as Web App

For other issues, check the Apps Script **Executions** log for error details.

---

**🎄 Happy holidays and good luck with your quote form!**
