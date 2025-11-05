#!/usr/bin/env node
/**
 * Google OAuth Refresh Token Generator
 * 
 * This script helps you generate a new Google OAuth refresh token
 * for accessing Google Sheets API.
 * 
 * Usage:
 *   1. Install googleapis: npm install googleapis
 *   2. Run: node generate-refresh-token.js
 *   3. Follow the prompts
 */

const { google } = require('googleapis');
const readline = require('readline');

console.log('\n🔐 Google OAuth Refresh Token Generator\n');
console.log('This script will help you generate a new refresh token for Google Sheets API.\n');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function generateRefreshToken() {
    try {
        // Get Client ID
        const clientId = await question('Enter your Google OAuth Client ID: ');
        if (!clientId.trim()) {
            console.error('❌ Client ID is required!');
            process.exit(1);
        }

        // Get Client Secret
        const clientSecret = await question('Enter your Google OAuth Client Secret: ');
        if (!clientSecret.trim()) {
            console.error('❌ Client Secret is required!');
            process.exit(1);
        }

        // Create OAuth2 client
        const oauth2Client = new google.auth.OAuth2(
            clientId.trim(),
            clientSecret.trim(),
            'http://localhost'  // Redirect URI
        );

        // Define scopes
        const scopes = [
            'https://www.googleapis.com/auth/spreadsheets'
        ];

        // Generate authorization URL
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'  // Force to get refresh token
        });

        console.log('\n📋 Step 1: Authorize this app');
        console.log('Open this URL in your browser:\n');
        console.log(authUrl);
        console.log('\n');

        // Get authorization code from user
        const code = await question('Step 2: After authorizing, paste the code from the URL here: ');
        if (!code.trim()) {
            console.error('❌ Authorization code is required!');
            process.exit(1);
        }

        console.log('\n⏳ Exchanging code for tokens...\n');

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code.trim());
        
        if (!tokens.refresh_token) {
            console.error('❌ No refresh token received!');
            console.error('This might happen if you\'ve already authorized this app.');
            console.error('Try revoking access at https://myaccount.google.com/permissions');
            console.error('and run this script again.');
            process.exit(1);
        }

        // Display results
        console.log('✅ Success! Here are your credentials:\n');
        console.log('─'.repeat(60));
        console.log('GOOGLE_CLIENT_ID=' + clientId.trim());
        console.log('GOOGLE_CLIENT_SECRET=' + clientSecret.trim());
        console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('─'.repeat(60));

        console.log('\n📝 Next steps:');
        console.log('1. Copy the credentials above');
        console.log('2. Update your .env file with these values');
        console.log('3. In Railway, go to Variables tab and update:');
        console.log('   - GOOGLE_CLIENT_ID');
        console.log('   - GOOGLE_CLIENT_SECRET');
        console.log('   - GOOGLE_REFRESH_TOKEN');
        console.log('\n✨ Done! You can now use these credentials in your script.\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the generator
generateRefreshToken();
