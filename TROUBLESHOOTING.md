# Troubleshooting Guide: Google OAuth Errors

## Error: "The OAuth client was not found" (invalid_client)

This is the error you're experiencing. Here's how to fix it:

### 🔍 What This Error Means

The Google OAuth credentials configured in Railway are either:
1. **Incorrect** - The CLIENT_ID or CLIENT_SECRET don't match
2. **Deleted** - The OAuth client was deleted from Google Cloud Console
3. **Not Set** - Environment variables are missing or empty in Railway

### ✅ Solution Steps

#### Step 1: Verify Environment Variables in Railway

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Click on your `lapsed-members` service
3. Go to **Variables** tab
4. Check if these variables exist:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REFRESH_TOKEN`

**If they're missing**, add them from your local `.env` file:

```bash
# Check your local .env file
cat .env | grep GOOGLE
```

Copy the values and add them to Railway Variables.

#### Step 2: Verify Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Look for your OAuth 2.0 Client ID
5. Verify the Client ID matches what's in Railway

**If the OAuth client is missing:**
- It may have been deleted
- You'll need to create a new one (see Step 3)

#### Step 3: Create New OAuth Credentials (If Needed)

If your OAuth client was deleted or you need new credentials:

1. **In Google Cloud Console:**
   - Go to **APIs & Services** → **Credentials**
   - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
   - Application type: **Desktop app** or **Web application**
   - Add authorized redirect URIs if needed
   - Click **Create**

2. **Download the credentials:**
   - Click on the newly created OAuth client
   - Note the **Client ID** and **Client Secret**

3. **Generate a new Refresh Token:**
   
   Use this Node.js script to generate a refresh token:

   ```javascript
   const { google } = require('googleapis');
   const readline = require('readline');

   const oauth2Client = new google.auth.OAuth2(
       'YOUR_CLIENT_ID',
       'YOUR_CLIENT_SECRET',
       'http://localhost'
   );

   const scopes = [
       'https://www.googleapis.com/auth/spreadsheets'
   ];

   const url = oauth2Client.generateAuthUrl({
       access_type: 'offline',
       scope: scopes
   });

   console.log('Authorize this app by visiting this url:', url);

   const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout
   });

   rl.question('Enter the code from that page here: ', (code) => {
       rl.close();
       oauth2Client.getToken(code, (err, token) => {
           if (err) return console.error('Error retrieving token', err);
           console.log('Your refresh token:', token.refresh_token);
       });
   });
   ```

4. **Update Railway Variables:**
   - Go to Railway → Variables
   - Update `GOOGLE_CLIENT_ID` with the new Client ID
   - Update `GOOGLE_CLIENT_SECRET` with the new Client Secret
   - Update `GOOGLE_REFRESH_TOKEN` with the new Refresh Token
   - Click **Save** or **Add** for each

#### Step 4: Update Local .env File

Don't forget to update your local `.env` file with the new credentials:

```env
GOOGLE_CLIENT_ID=your_new_client_id
GOOGLE_CLIENT_SECRET=your_new_client_secret
GOOGLE_REFRESH_TOKEN=your_new_refresh_token
```

#### Step 5: Redeploy on Railway

1. In Railway, go to **Deployments**
2. Click **Deploy** to trigger a new deployment
3. Check the logs to verify the error is resolved

### 🧪 Quick Test

To verify your credentials work, run this locally:

```bash
# Test locally first
node expired-data-for-ym.js
```

If it works locally but not on Railway, the issue is with Railway's environment variables.

## Other Common OAuth Errors

### Error: "invalid_grant"

**Meaning:** The refresh token has expired or been revoked.

**Fix:**
1. Generate a new refresh token (see Step 3 above)
2. Update `GOOGLE_REFRESH_TOKEN` in Railway Variables

### Error: "redirect_uri_mismatch"

**Meaning:** The redirect URI doesn't match what's configured in Google Cloud.

**Fix:**
1. Check authorized redirect URIs in Google Cloud Console
2. Add the correct URI to your OAuth client configuration

### Error: "access_denied"

**Meaning:** The OAuth client doesn't have permission to access the Google Sheets API.

**Fix:**
1. Enable Google Sheets API in Google Cloud Console
2. Go to **APIs & Services** → **Library**
3. Search for "Google Sheets API"
4. Click **Enable**

## Debugging Checklist

- [ ] Environment variables are set in Railway
- [ ] OAuth client exists in Google Cloud Console
- [ ] Client ID and Secret match between Railway and Google Cloud
- [ ] Refresh token is valid and not expired
- [ ] Google Sheets API is enabled
- [ ] Script works locally with same credentials
- [ ] Railway deployment logs show environment validation passing

## Still Having Issues?

### Check Railway Logs

```bash
# View detailed logs in Railway
railway logs
```

Look for:
- ✅ Environment variables validated successfully
- Any error messages with details

### Verify Credentials Format

Make sure there are no extra spaces or quotes:

```bash
# WRONG - has quotes
GOOGLE_CLIENT_ID="123456.apps.googleusercontent.com"

# CORRECT - no quotes in Railway
GOOGLE_CLIENT_ID=123456.apps.googleusercontent.com
```

### Test OAuth Flow Manually

Use curl to test the token refresh:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "grant_type=refresh_token"
```

If this returns an error, the credentials are definitely invalid.

## Need Help?

1. Check Railway logs for detailed error messages
2. Verify Google Cloud Console settings
3. Create a new issue on GitHub with:
   - Full error message from Railway logs
   - Steps you've already tried
   - Whether it works locally

---

**Last Updated:** November 5, 2025
