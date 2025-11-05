# Quick Start: Deploy to Railway

## 🚀 One-Time Setup (5 minutes)

### Step 1: Deploy to Railway
1. Visit: https://railway.app/new
2. Click **"Deploy from GitHub repo"**
3. Select: `Jimmeey2323/lapsed-members`
4. Click **"Deploy Now"**

### Step 2: Configure as Cron Job
1. Click on your deployed service
2. Go to **Settings** → **Service**
3. Change **Service Type** to **"Cron Job"**
4. Set **Cron Schedule**:
   - For 9:30 PM IST: `0 16 * * *`
   - For 9:30 PM UTC: `30 21 * * *`
   - For 9:30 PM EST: `30 2 * * *`
   - For 9:30 PM PST: `30 5 * * *`

### Step 3: Add Environment Variables
1. Go to **Variables** tab
2. Click **"New Variable"**
3. Add these from your `.env` file:
   ```
   GOOGLE_CLIENT_ID = <your_value>
   GOOGLE_CLIENT_SECRET = <your_value>
   GOOGLE_REFRESH_TOKEN = <your_value>
   ```
4. Click **"Add"** for each variable

### Step 4: Deploy
1. Railway auto-deploys from GitHub
2. Check **Deployments** tab for status
3. View **Logs** to confirm successful execution

## ✅ You're Done!

The script will now run automatically every day at 9:30 PM.

## 📊 Monitor Execution

- **Logs**: Deployments → Select deployment → View Logs
- **Next Run**: Visible in cron job settings
- **Manual Run**: Deployments → Run Deployment

## 🔧 Making Changes

1. Edit code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "your changes"
   git push
   ```
3. Railway auto-deploys the new version

## 💰 Cost

- Railway free tier: $5/month credit
- Cron jobs are very cost-effective
- Monitor usage in **Usage** tab

## 🆘 Support

- Full Guide: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- Railway Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

---

### Timezone Helper

| Your Time | Cron Schedule | Explanation |
|-----------|---------------|-------------|
| 9:30 PM IST | `0 16 * * *` | IST is UTC+5:30, so 9:30 PM IST = 4:00 PM UTC |
| 9:30 PM UTC | `30 21 * * *` | Direct UTC time |
| 9:30 PM EST | `30 2 * * *` | EST is UTC-5, so 9:30 PM EST = 2:30 AM UTC |
| 9:30 PM PST | `30 5 * * *` | PST is UTC-8, so 9:30 PM PST = 5:30 AM UTC |

**Cron Format**: `minute hour day month dayOfWeek`
- `*` means "every"
- `30 21 * * *` = "at minute 30, hour 21, every day"
