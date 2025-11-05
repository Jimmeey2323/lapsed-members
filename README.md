# Lapsed Members Script

A Node.js script that fetches expired member data from Momence and processes it for tracking lapsed memberships.

## Features

- Fetches customer data from Momence API
- Processes expired memberships based on configurable threshold
- Integrates with Google Sheets for data export
- Handles frozen memberships data
- Secure OAuth authentication using environment variables

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google OAuth credentials for Sheets API access
- Momence API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jimmeey2323/lapsed-members.git
cd lapsed-members
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory and add your credentials:

```env
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Add other environment variables as needed
```

### Usage

Run the script manually:
```bash
node expired-data-for-ym.js
```

Or use npm:
```bash
npm start
```

## Railway Deployment (Automated Cron Job)

This script is configured to run automatically on Railway as a cron job at 9:30 PM daily.

### Quick Deployment

1. **Deploy to Railway**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Create new project from GitHub
   - Select `Jimmeey2323/lapsed-members` repository

2. **Configure Cron Schedule**:
   - Set service type to "Cron Job"
   - Cron schedule: `30 21 * * *` (9:30 PM UTC)
   - For IST (9:30 PM): Use `0 16 * * *`

3. **Set Environment Variables**:
   - Add all variables from your `.env` file
   - Required: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

📖 **For detailed deployment instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)**

## Troubleshooting

### OAuth Errors

If you encounter Google OAuth errors (like "invalid_client" or "invalid_grant"):

1. **See the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide** for detailed solutions
2. **Generate new credentials** using:
   ```bash
   npm install googleapis
   npm run generate-token
   ```
3. **Update Railway Variables** with the new credentials

### Common Issues

- **"OAuth client was not found"**: Your credentials are incorrect or missing in Railway → See [FIX_OAUTH_ERROR.md](./FIX_OAUTH_ERROR.md)
- **"Invalid grant"**: Your refresh token has expired - generate a new one
- **"401 Unauthorized from Momence API"**: Momence cookies are missing or expired → See [FIX_MOMENCE_401.md](./FIX_MOMENCE_401.md)
- **Script fails locally**: Check your `.env` file has correct values

For detailed solutions, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## Configuration

The script includes several configurable options in the `CONFIG` object:

- `GOOGLE_SHEET_ID`: Target Google Sheet for data export
- `SHEET_NAME`: Sheet tab name
- `DAYS_THRESHOLD`: Number of days to consider for lapsed memberships
- `HOST_IDS`: Momence host IDs to process
- `CUSTOMER_API_MAX_CONCURRENT`: Concurrent API request limit

## Security

- All sensitive credentials are stored in environment variables
- The `.env` file is excluded from version control
- No hardcoded secrets in the source code

## License

This project is for internal use only.