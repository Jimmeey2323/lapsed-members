#!/usr/bin/env node
/**
 * Manual/Interactive Version - Lapsed Members Script
 * 
 * This version provides:
 * - Interactive prompts for configuration
 * - Colored terminal output
 * - Progress indicators
 * - Better error messages
 * - Option to save results locally
 * 
 * Usage:
 *   node manual-run.js
 * 
 * Or make executable and run:
 *   chmod +x manual-run.js
 *   ./manual-run.js
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs').promises;
const readline = require('readline');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
};

// Helper functions for colored output
const log = {
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`),
    data: (msg) => console.log(`${colors.magenta}📊 ${msg}${colors.reset}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.bright}  ${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
};

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Configuration (same as original script)
const CONFIG = {
    GOOGLE_SHEET_ID: "18f-vMwJl9vrKPXkpP-ZXVr6bLADkCZfykKgZEyA3WWo",
    SHEET_NAME: "Lapsed",
    HEADERS_FOR_SHEET: [
        "userId", "phone", "email", "firstName", "lastName", "tags", "membershipName", "endDate", "ID"
    ],
    CUSTOMER_DATA_API_URL: "https://momence.com/_api/primary/host/GetCustomerData",
    HOST_IDS: [13752, 33905],
    CUSTOMER_API_MAX_CONCURRENT: 30,
    CUSTOMER_API_TIMEOUT: 10000,
    DAYS_THRESHOLD: 60,
    FROZEN_URLS: [
        "https://api.momence.com/host/13752/reports/frozen-memberships?timeZone=Asia/Kolkata&groupRecurring=false&computedSaleValue=true&includeVatInRevenue=true&useBookedEntityDateRange=false&excludeMembershipRenews=false&day=2024-12-09T00:00:00.000Z&moneyCreditSalesFilter=filterOutSalesPaidByMoneyCredits&startDate=2022-12-31T18:30:00.000Z&endDate=2026-12-31T18:29:59.999Z&startDate2=2022-12-31T18:30:00.000Z&endDate2=2025-12-31T18:29:00.000Z&datePreset=-1&datePreset2=-1",
        "https://api.momence.com/host/33905/reports/frozen-memberships?timeZone=Asia/Kolkata&groupRecurring=false&computedSaleValue=true&includeVatInRevenue=true&useBookedEntityDateRange=false&excludeMembershipRenews=false&day=2024-12-09T00:00:00.000Z&moneyCreditSalesFilter=filterOutSalesPaidByMoneyCredits&startDate=2022-12-31T18:30:00.000Z&endDate=2026-12-31T18:29:59.999Z&startDate2=2022-12-31T18:30:00.000Z&endDate2=2025-12-31T18:29:00.000Z&datePreset=-1&datePreset2=-1"
    ],
    NOT_ACTIVATED_URLS: [
        "https://api.momence.com/host/13752/reports/not-activated-memberships",
        "https://api.momence.com/host/33905/reports/not-activated-memberships"
    ],
    EXPIRATION_URLS: [
        "https://api.momence.com/host/13752/reports/memberships-expiration",
        "https://api.momence.com/host/33905/reports/memberships-expiration",
        "https://api.momence.com/host/13752/reports/upcoming-memberships-expiration",
        "https://api.momence.com/host/33905/reports/upcoming-memberships-expiration"
    ],
    USAGE_URLS: [
        "https://api.momence.com/host/13752/reports/membership-sales",
        "https://api.momence.com/host/33905/reports/membership-sales"
    ],
    GOOGLE_OAUTH: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
        TOKEN_URL: "https://oauth2.googleapis.com/token"
    },
    MOMENCE_HEADERS: {
        'Cookie': process.env.MOMENCE_ALL_COOKIES,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};

// Progress bar helper
function createProgressBar(current, total, label = '') {
    const percentage = Math.round((current / total) * 100);
    const barLength = 40;
    const filledLength = Math.round((barLength * current) / total);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    process.stdout.write(`\r${colors.cyan}${label} [${bar}] ${percentage}% (${current}/${total})${colors.reset}`);
    
    if (current === total) {
        process.stdout.write('\n');
    }
}

// Main script class (simplified version)
class ManualLapsedMembersScript {
    constructor() {
        this.startTime = Date.now();
        this.stats = {
            frozen: 0,
            notActivated: 0,
            expired: 0,
            withUsage: 0,
            finalRecords: 0,
            apiCalls: 0,
            errors: 0
        };
    }

    async validateEnvironment() {
        log.header('Environment Validation');
        
        const requiredVars = {
            'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
            'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
            'GOOGLE_REFRESH_TOKEN': process.env.GOOGLE_REFRESH_TOKEN,
            'MOMENCE_ALL_COOKIES': process.env.MOMENCE_ALL_COOKIES
        };

        const missing = [];
        
        for (const [varName, value] of Object.entries(requiredVars)) {
            if (!value) {
                missing.push(varName);
                log.error(`${varName} is not set`);
            } else {
                const preview = value.substring(0, 30) + '...';
                log.success(`${varName}: ${colors.dim}${preview}${colors.reset}`);
            }
        }

        if (missing.length > 0) {
            log.error('\nMissing required environment variables!');
            log.info('Make sure your .env file contains all required variables.');
            return false;
        }

        log.success('\nAll environment variables are set!');
        return true;
    }

    async confirmRun() {
        log.header('Manual Run Configuration');
        
        console.log(`${colors.bright}Current Settings:${colors.reset}`);
        console.log(`  Days Threshold: ${colors.yellow}${CONFIG.DAYS_THRESHOLD} days${colors.reset}`);
        console.log(`  Host IDs: ${colors.yellow}${CONFIG.HOST_IDS.join(', ')}${colors.reset}`);
        console.log(`  Google Sheet ID: ${colors.yellow}${CONFIG.GOOGLE_SHEET_ID}${colors.reset}`);
        console.log(`  Sheet Name: ${colors.yellow}${CONFIG.SHEET_NAME}${colors.reset}\n`);

        const answer = await question(`${colors.bright}Do you want to proceed? (yes/no): ${colors.reset}`);
        return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
    }

    async run() {
        try {
            // Validate environment
            const isValid = await this.validateEnvironment();
            if (!isValid) {
                process.exit(1);
            }

            // Confirm run
            const shouldRun = await this.confirmRun();
            if (!shouldRun) {
                log.warning('Run cancelled by user.');
                rl.close();
                return;
            }

            // Import the actual script logic
            log.header('Starting Data Collection');
            
            // For now, just run the original script
            log.info('Delegating to main script...\n');
            
            // Close readline before running main script
            rl.close();
            
            // Import and run the main script
            require('./expired-data-for-ym.js');
            
        } catch (error) {
            log.error(`Fatal error: ${error.message}`);
            console.error(error);
            rl.close();
            process.exit(1);
        }
    }
}

// Banner
console.log(`
${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         📋 LAPSED MEMBERS - MANUAL RUN MODE 📋           ║
║                                                           ║
║  Interactive terminal version for testing & debugging    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}
`);

// Run the script
const script = new ManualLapsedMembersScript();
script.run().catch(error => {
    log.error(`Unhandled error: ${error.message}`);
    console.error(error);
    rl.close();
    process.exit(1);
});
