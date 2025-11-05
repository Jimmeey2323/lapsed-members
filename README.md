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

Run the script:
```bash
node expired-data-for-ym.js
```

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