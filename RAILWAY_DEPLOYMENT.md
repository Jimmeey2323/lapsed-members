# Railway Deployment Guide

This guide will help you deploy the lapsed members script as a cron job on Railway that runs daily at 9:30 PM.

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. GitHub repository connected (already done ✅)
3. Environment variables from your `.env` file

## Deployment Steps

### 1. Create a New Project on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose the `Jimmeey2323/lapsed-members` repository
5. Railway will automatically detect the Node.js project

### 2. Configure as a Cron Job

Railway now uses **Cron Jobs** as a service type. Here's how to set it up:

1. In your Railway project dashboard, click on your service
2. Go to **Settings** tab
3. Under **Service Settings**, change the service type to **"Cron Job"**
4. Set the **Cron Schedule** to: `30 21 * * *`
   - This runs daily at 21:30 (9:30 PM) UTC
   - To adjust for your timezone, calculate the UTC offset:
     - For IST (UTC+5:30): Use `0 16 * * *` for 9:30 PM IST
     - For EST (UTC-5): Use `30 2 * * *` for 9:30 PM EST
     - For PST (UTC-8): Use `30 5 * * *` for 9:30 PM PST

### 3. Set Environment Variables

In the Railway dashboard:

1. Go to **Variables** tab
2. Add the following environment variables from your `.env` file:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

Add any other environment variables that your script requires.

### 4. Configure Start Command (Optional)

Railway should auto-detect the start command from `package.json`, but you can override it:

1. Go to **Settings** → **Deploy**
2. Under **Start Command**, you can set: `node expired-data-for-ym.js`

### 5. Deploy

1. Railway will automatically deploy on push to `main` branch
2. You can manually trigger a deployment by clicking **"Deploy"**
3. Monitor the deployment in the **Deployments** tab

## Cron Schedule Reference

The cron schedule format is: `minute hour day month day-of-week`

Common schedules:
- `30 21 * * *` - Daily at 9:30 PM UTC
- `0 16 * * *` - Daily at 9:30 PM IST (4:00 PM UTC)
- `0 9 * * 1` - Every Monday at 9:00 AM UTC
- `0 */6 * * *` - Every 6 hours

## Monitoring & Logs

1. **View Logs**: Go to **Deployments** → Select a deployment → **View Logs**
2. **Check Execution**: Logs will show when the cron job runs
3. **Alerts**: Set up notifications in Railway settings for failures

## Timezone Considerations

Railway cron jobs run in **UTC timezone**. To convert your desired time to UTC:

- **India (IST = UTC+5:30)**: 9:30 PM IST = 4:00 PM UTC → `0 16 * * *`
- **US Eastern (EST = UTC-5)**: 9:30 PM EST = 2:30 AM UTC → `30 2 * * *`
- **US Pacific (PST = UTC-8)**: 9:30 PM PST = 5:30 AM UTC → `30 5 * * *`

## Testing

To test your deployment:

1. Manually trigger the job from Railway dashboard
2. Check the logs for successful execution
3. Verify the Google Sheet is updated with the latest data

## Troubleshooting

### Job not running at expected time
- Double-check the cron schedule matches your desired UTC time
- Verify the service type is set to "Cron Job"

### Script errors
- Check logs in Railway dashboard
- Verify all environment variables are set correctly
- Ensure dependencies are installed (check `package.json`)

### Authentication failures
- Verify Google OAuth credentials are correct
- Check if refresh token needs to be regenerated
- Ensure API permissions are granted

## Cost Optimization

- Railway's free tier includes $5 credit per month
- Cron jobs are cost-effective as they only run when scheduled
- Monitor usage in the **Usage** tab

## Alternative: Using Railway's Legacy Cron

If you prefer using an external cron service:

1. Deploy as a regular service
2. Use a service like **Cron-job.org** or **EasyCron**
3. Set up HTTP endpoint to trigger the script
4. Schedule the HTTP call for 9:30 PM

## Updates & Maintenance

- Push to `main` branch to automatically redeploy
- Railway will rebuild and restart the cron job
- No downtime for cron jobs (next scheduled run uses new code)

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository
