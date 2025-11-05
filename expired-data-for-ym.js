#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
let pLimit;

// --- CONFIGURATION ---
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
    MEMBERSHIP_NAME_CORRECTIONS: {
        "1 month unlimited": "Studio 1 Month Unlimited", "12 Class Package (Studio).": "Studio 12 Class Package",
        "3 month U/L class": "Studio 3 Month Unlimited", "Anniversary Special: 45 minutes Semi Private": "Studio Semi Private Class",
        "Annual Unlimited": "Studio Annual Unlimited", "Limited Edition : 57 Class Pack": "Limited Edition : 57 Class Pack",
        "Pop up Studio Single class": "Studio Single Class", "Pop-up Studio 4 Class Package.": "Studio 4 Class Package",
        "Pop-up Studio 8 Class Package.": "Studio 8 Class Package", "Studio 1 Month Unlimited Membership": "Studio 1 Month Unlimited",
        "Studio 1 Month Unlimited.": "Studio 1 Month Unlimited", "Studio 10 Single Class Pack": "Studio 10 Single Class Pack",
        "Studio 12 Class Package": "Studio 12 Class Package", "Studio 2 Week Unlimited": "Studio 2 Week Unlimited",
        "Studio 2 Week Unlimited Membership": "Studio 2 Week Unlimited", "Studio 2 Week Unlimited.": "Studio 2 Week Unlimited",
        "Studio 20 Single Class Pack": "Studio 20 Single Class Pack", "Studio 3 Month U/L Monthly Installment": "Studio 3 Month Unlimited - Monthly Installment",
        "Studio 3 Month Unlimited Membership": "Studio 3 Month Unlimited", "Studio 3 Month Unlimited.": "Studio 3 Month Unlimited",
        "Studio 30 Single Class Pack": "Studio 30 Single Class Pack", "Studio 4 Class Package": "Studio 4 Class Package",
        "Studio 4 Class Package.": "Studio 4 Class Package", "Studio 6 Month Unlimited Membership": "Studio 6 Month Unlimited",
        "Studio 8 Class Package": "Studio 8 Class Package", "Studio 8 Class Package.": "Studio 8 Class Package",
        "Studio Annual Membership - Monthly Intsallment": "Studio Annual Unlimited - Monthly Installment", "Studio Annual Unlimited Membership": "Studio Annual Unlimited",
        "Studio Annual Unlimited.": "Studio Annual Unlimited", "Studio Newcomers 2 Week Unlimited": "Studio Newcomers 2 Week Unlimited",
        "Studio Newcomers 2 Week Unlimited Membership": "Studio Newcomers 2 Week Unlimited", "Studio Newcomers 2 Week Unlimited.": "Studio Newcomers 2 Week Unlimited",
        "The BURN Pacakge": "The Burn Package", "V'Day Special: Shared Studio 8 Class Package": "Shared Studio 8 Class Package",
        "Virtual 1 Month Unlimited.": "Virtual 1 Month Unlimited", "Virtual 1 Week Unlimited Top Up.": "Virtual 1 Week Unlimited Top Up",
        "Virtual 12 Class Package.": "Virtual 12 Class Package", "Virtual 2 Week Unlimited.": "Virtual 2 Week Unlimited",
        "Virtual 3 Month Unlimited Single Payment.": "Virtual 3 Month Unlimited Single Payment", "Virtual 4 Class Package.": "Virtual 4 Class Package",
        "Virtual 8 Class Package.": "Virtual 8 Class Package", "Virtual Single Class.": "Virtual Single Class"
    },
    EXCLUSION_KEYWORDS: /\bsign-up\b|\blink\b|\blrs\b|\bhost\b|\bhosted\b|\b2 for 1\b|\bopen barre\b|\bx\b|\bp57\b|\bphysique\b|\bfree\b|\binfluencer\b|\bcomplimentary\b|\bsweat\b|\bsign\b|\blink\b|\bstaff\b|\bfamily\b|\btest\b|\breferral\b|\bcomp\b|\bcomped\b|\bhost\b|\bhosted\b|\bx\b|\bp57\b|\bvirtual\b|\bff\b|\b57 class\b|\bsemi\b|\bstudio single class\b|\bvirtual single class\b/i,
    // Pricing maps by location
    PRICING_13752: {
        "Studio Open Barre Class": 0, "Studio Single Class": 1500, "Studio 4 Class Package": 5350,
        "Studio 8 Class Package": 10200, "Studio 12 Class Package": 15050, "Studio Newcomers 2 Week Unlimited": 7500,
        "Studio Newcomers 2 Week Unlimited Membership": 7500, "Studio 2 Week Unlimited Membership": 9916.5,
        "Studio 2 Week Unlimited": 9916.5, "Studio Private Class": 5000, "Studio 1 Month Unlimited Membership": 17750,
        "Studio 1 Month Unlimited": 17750, "Studio 3 Month Unlimited Membership": 50750, "Studio 3 Month Unlimited": 50750,
        "Studio 6 Month Unlimited Membership": 99750, "Studio 6 Month Unlimited": 99750, "Studio Annual Unlimited Membership": 192500,
        "Studio Annual Unlimited": 192500, "Studio Complimentary Class": 0, "Studio Staff/Family Class": 0,
        "Virtual Private Class": 4500, "Studio Free Influencer Class": 0, "Studio Happy Hour Private": 3000,
        "Studio 3 Month U/L Monthly Installment": 14500, "Studio 3 Month Unlimited - Monthly Installment": 14500,
        "Studio 20 Single Class Pack": 30000, "Studio 10 Single Class Pack": 15000, "Studio 30 Single Class Pack": 45000,
        "Studio Private Class X 10": 50000, "Studio Annual Membership - Monthly Intsallment": 13750,
        "Studio Annual Unlimited - Monthly Installment": 13750, "Virtual Private Class X 10": 45000,
        "Pre/Post Natal Trial Class": 0, "Twain x Physique 57 - powerCycle": 0, "Free Trial Sign Up - Mallika Parekh": 0,
        "Newcomers 2 For 1": 1500, "Studio Complimentary Referral Class": 0, "Studio Referrer Complimentary Class Package": 0,
        "Physique 57 Complimentary Class - Sign up Link": 0, "Studio Extended 10 Single Class Pack": 15000,
        "Studio Anniversary 4 Complimentary Class Package": 0, "Summer Bootcamp - Studio 6 Week Unlimited": 30000,
        "Studio Private - Anisha (Single Class)": 5950, "Studio Privates - Anisha x 10": 59500,
        "Virtual Private - Anisha": 5400, "Virtual Privates - Anisha x 10": 54000, "Barre 1 month Unlimited": 15250,
        "powerCycle 1 month Unlimited": 15250, "Strength Lab 1 month Unlimited": 15250, "Barre 3 months Unlimited": 43500,
        "powerCycle 3 months Unlimited": 43500, "Strength Lab 3 months Unlimited": 15250, "Barre 6 month Unlimited": 85500,
        "powerCycle 6 months Unlimited": 85500, "Strength Lab 6 months Unlimited": 85500, "Barre Annual Membership": 165000,
        "powerCycle Annual Membership": 165000, "Strength Lab Annual Membership": 165000, "Barre 2 week Unlimited": 8500,
        "powerCycle 2 week Unlimited": 8500, "Strength Lab 2 week Unlimited": 8500, "Owner's Special - 2 for 1": 1500,
        "CA - Studio 5 Class Pack": 0
    },
    PRICING_33905: {
        "Studio Single Class": 1200, "Studio Open Barre Class": 0, "Studio 4 Class Package": 4450,
        "Studio Newcomers 2 Week Unlimited Membership": 5750, "Studio Newcomers 2 Week Unlimited": 5750,
        "Studio 2 Week Unlimited": 7200, "Studio 2 Week Unlimited Membership": 7200, "Studio 1 Month Unlimited Membership": 13900,
        "Studio 1 Month Unlimited": 13900, "Studio 3 Month Unlimited Membership": 40200, "Studio 3 Month Unlimited": 40200,
        "Studio Annual Unlimited Membership": 148800, "Studio Annual Unlimited": 148800, "Studio 6 Month Unlimited Membership": 78300,
        "Studio 6 Month Unlimited": 78300, "Studio 8 Class Package": 8300, "Studio 12 Class Package": 12500,
        "Hosted Class 2 Week Unlimited Membership": 7200, "Studio Free Influencer Class": 0, "Test": 1,
        "Studio 20 Single Class Pack": 24000, "Influencer Class (Tahlia)": 0, "OOO Sign Up link": 0,
        "Anmol Bajaj Complimentary Class": 0, "Studio 10 Single Class Pack": 12000, "Studio 30 Single Class Pack": 36000,
        "Saksha Narayan Complimentary Class": 0, "Akshitha Basavaraju Complimentary Class": 0,
        "Dhanya Ramkumar Complimentary Class": 0, "Nilu Thapa Complimentary Class": 0, "Studio Complimentary Class": 0,
        "Women's Day Complimentary Class": 0, "Studio Private Class": 3925, "Mother's Day Complimentary Class": 0,
        "Bhavana Rameskumar Complimentary Class": 0, "Shraddha & Khushi Complimentary Class": 0,
        "Aakansha & Pooja Complimentary Class": 0, "Sisters in Sweat Complimentary Class": 0,
        "Studio Staff Family / Friend": 0, "Scoop Sign Up link": 0, "Studio 3 Class Complimentary Package": 0,
        "Sunrise Package": 0, "Studio 30 Private Class Package": 117750, "Karthika Anand Complimentary Class": 0,
        "Recovery Complimentary Class": 0, "1st Anniversary Sign up link": 0, "Studio Newcomer 2 for 1": 1200,
        "Protima Tiwari Complimentary Class": 0, "Anniversary Special: 45 minutes Semi Private": 0,
        "test": 10000, "New Studio 10 Single Class Pack": 12000, "Summer Bootcamp - Studio 6 Week Unlimited": 22000,
        "Kickstarter Pack - 5 classes in 10 days": 4900, "Newcomer 8 Class Package": 8300, "ByTwo Sign Up Link": 0,
        "6 Private Classes & 2 Studio Single Classes": 25950, "Studio 4 Private Class Package": 11000,
        "Copper + Cloves Single Class Package": 900, "Copper + Cloves Credit": 450, "Copper + Cloves Complimentary Class": 0,
        "Copper + Cloves Free Class": 0, "Copper + Cloves 10 Class Pack": 8100
    },
    // Associates by location
    ASSOCIATES: {
        "Kwality House, Kemps Corner": ["Akshay Rane", "Zaheer Agarbattiwala", "Vahishta Fitter"],
        "Supreme HQ, Bandra": ["Shipra Bhika", "Imran Shaikh", "Nadiya Shaikh", "Deesha Changwani"],
        "Kenkere House": ["Prathap", "Api", "Nunu", "Gokul"]
    },
    // Percentage allocation by location when ENABLE_FRESH_ALLOCATION is true
    ALLOCATION_PERCENTAGES: {
        "Kwality House, Kemps Corner": {
            "Akshay Rane": 40,
            "Zaheer Agarbattiwala": 40,
            "Vahishta Fitter": 20
        },
        "Supreme HQ, Bandra": {
            "Shipra Bhika": 35,
            "Imran Shaikh": 35,
            "Nadiya Shaikh": 20,
            "Deesha Changwani": 15
        },
        "Kenkere House": {
            "Prathap": 35,
            "Api": 35,
            "Nunu": 15,
            "Gokul": 15
        }
    },
    // Associate email patterns for matching
    ASSOCIATE_EMAILS: {
        "akshay": "Akshay Rane", "zaheer": "Zaheer Agarbattiwala", "vahishta": "Vahishta Fitter", "saniya": "Saniya Makwana",
        "shipre": "Shipra Bhika", "imran": "Imran Shaikh", "nadiya": "Nadiya Shaikh", "deesha": "Deesha Changwani",
        "prathap": "Prathap", "api": "Api", "nunu": "Nunu", "gokul": "Gokul"
    },
    GOOGLE_OAUTH: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
        TOKEN_URL: "https://oauth2.googleapis.com/token"
    },
    MOMENCE_HEADERS: {
        'Authorization': `Bearer ${process.env.MOMENCE_ACCESS_TOKEN}`,
        'Cookie': process.env.MOMENCE_ALL_COOKIES,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    // Yellow Messenger Configuration
    YELLOW_MESSENGER: {
        API_KEY: process.env.YM_API_KEY || 'MKll8rVXzCjtY4--7MGSDOgYy4v1CzSVdjAkvxAh',
        API_BASE_URL: 'https://cloud.yellow.ai/cdp/api/v1/user/',
        BOT_PARAM: '?bot=x1614586769188',
        CONCURRENT_REQUESTS: 200,
        BATCH_SIZE: 1000
    }
};

// --- HELPER FUNCTIONS ---

function formatDateToIST(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(date).replace(',', '');
}

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber === "-") return "";
    // Remove all non-numeric characters
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, '');
    // If phone is exactly 10 digits, prepend "91"
    if (cleanedPhone.length === 10) {
        return "91" + cleanedPhone;
    }
    return cleanedPhone;
}

function isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length < 10) return false;
    
    // If it starts with 91 (India), it must be exactly 12 digits
    if (phoneNumber.startsWith('91')) {
        return phoneNumber.length === 12;
    }
    
    // For other country codes, accept 10-15 digits
    return phoneNumber.length >= 10 && phoneNumber.length <= 15;
}

function getLocationId(homeLocation) {
    if (!homeLocation) return "ofiyjc";
    
    const location = homeLocation.toLowerCase();
    
    if (location.includes("kenkere")) {
        return "gfnfwh";
    } else if (location.includes("supreme")) {
        return "au6520";
    } else {
        return "ofiyjc";
    }
}

// --- DATA FETCHING & PROCESSING ---

class GoogleSheetService {
    constructor() {
        this.accessToken = null;
        this.tokenExpiry = 0;
    }

    async #getAccessToken() {
        if (this.accessToken && Date.now() < this.tokenExpiry) return this.accessToken;
        try {
            const response = await axios.post(CONFIG.GOOGLE_OAUTH.TOKEN_URL, new URLSearchParams({
                client_id: CONFIG.GOOGLE_OAUTH.CLIENT_ID, client_secret: CONFIG.GOOGLE_OAUTH.CLIENT_SECRET,
                refresh_token: CONFIG.GOOGLE_OAUTH.REFRESH_TOKEN, grant_type: "refresh_token"
            }));
            const tokenData = response.data;
            this.accessToken = tokenData.access_token;
            this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;
            return this.accessToken;
        } catch (error) {
            console.error("Fatal: Failed to refresh Google access token.", error.response?.data || error.message);
            throw new Error("Could not get Google access token.");
        }
    }

    async clearSheet() {
        const token = await this.#getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${CONFIG.SHEET_NAME}!A1:Z:clear`;
        await axios.post(url, {}, { headers: { "Authorization": `Bearer ${token}` } });
    }

    async writeToSheet(range, data) {
        if (data.length === 0) return;
        const token = await this.#getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED`;
        await axios.post(url, { values: data }, {
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
        });
    }

    async readExistingAssignments() {
        try {
            const token = await this.#getAccessToken();
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.GOOGLE_SHEET_ID}/values/${CONFIG.SHEET_NAME}!A2:R`;
            const response = await axios.get(url, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            const rows = response.data.values || [];
            const assignmentMap = new Map();
            
            // Map: uniqueId -> assignedAssociate
            rows.forEach(row => {
                if (row.length >= 18) {
                    const uniqueId = row[0]; // Column A
                    const assignedAssociate = row[17]; // Column R (Assigned Associate)
                    if (uniqueId && assignedAssociate && assignedAssociate !== "-") {
                        assignmentMap.set(uniqueId, assignedAssociate);
                    }
                }
            });
            
            return assignmentMap;
        } catch (error) {
            return new Map();
        }
    }
}

// --- DATA FETCHING & PROCESSING ---

async function fetchMomenceData(urls) {
    const fetchPromises = urls.map(url =>
        axios.get(url, { headers: CONFIG.MOMENCE_HEADERS })
            .then(response => response.data.items || [])
            .catch(error => {
                console.error(`Failed to fetch data from ${url}:`, error.message);
                return []; // Return empty array on failure to not break the process
            })
    );
    const results = await Promise.all(fetchPromises);
    return results.flat(); // Flatten array of arrays into a single array
}

// Fetch customer data by memberId and hostId pairs
async function fetchCustomerDataByMembers(memberHostPairs) {
    console.log(`📞 Fetching customer data for ${memberHostPairs.length} unique members...`);
    
    const customerMap = new Map();
    
    async function fetchCustomerData(memberId, hostId, retryCount = 0) {
        const maxRetries = 3;
        const baseDelay = 500; // Start with 500ms delay        
        try {
            const url = `${CONFIG.CUSTOMER_DATA_API_URL}?memberId=${memberId}&hostId=${hostId}`;
            const response = await axios.get(url, { 
                headers: CONFIG.MOMENCE_HEADERS,
                timeout: CONFIG.CUSTOMER_API_TIMEOUT
            });
            
            if (response.data?.message) {
                const c = response.data.message;
                const rawPhone = c.phoneNumber || c.smsContact?.number || "";
                const phone = formatPhoneNumber(rawPhone);
                
                // Only return if we have a valid phone number
                if (phone && isValidPhoneNumber(phone)) {
                    return {
                        memberId: c.memberId,
                        phoneNumber: phone,
                        email: c.email || "-",
                        firstName: c.firstName || "-",
                        lastName: c.lastName || "-"
                    };
                }
            }
        } catch (error) {
            // Retry logic for 403 errors
            if (error.response?.status === 403 && retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff: 500ms, 1s, 2s
                await new Promise(resolve => setTimeout(resolve, delay));
                
                // Retry the request
                return await fetchCustomerData(memberId, hostId, retryCount + 1);
            }
        }
        return null;
    }
    
    // Process in batches
    const BATCH_SIZE = CONFIG.CUSTOMER_API_MAX_CONCURRENT;
    let processed = 0;
    let withPhone = 0;
    
    for (let i = 0; i < memberHostPairs.length; i += BATCH_SIZE) {
        const batch = memberHostPairs.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
            batch.map(({ memberId, hostId }) => fetchCustomerData(memberId, hostId))
        );
        
        results.forEach(customer => {
            if (customer?.memberId && !customerMap.has(customer.memberId)) {
                customerMap.set(customer.memberId, customer);
                withPhone++;
            }
        });
        
        processed += batch.length;
        if (processed % 600 === 0 || processed === memberHostPairs.length) {
            console.log(`  ✓ ${processed}/${memberHostPairs.length} (${withPhone} with phones)`);
        }
    }
    
    console.log(`✅ Fetched ${customerMap.size} customers with valid phones`);
    return customerMap;
}

function processAndFilterExpirations(expirationItems, frozenMemberIds) {
    // Correct names and filter by keywords and excluded member IDs
    const cleanedData = expirationItems.map(item => {
        const correctedName = CONFIG.MEMBERSHIP_NAME_CORRECTIONS[item.membershipName] || item.membershipName;
        return { ...item, membershipName: correctedName };
    }).filter(item =>
        !CONFIG.EXCLUSION_KEYWORDS.test(item.membershipName) && !frozenMemberIds.has(item.memberId)
    );

    // Note: The final filtering to get the latest entry per member is handled
    // later in the script, after all data has been merged.
    return cleanedData;
}

function mergeUsageData(expirationData, usageItems) {
    // Create a lookup map for faster processing
    const usageMap = new Map();
    usageItems.forEach(item => {
        const key = `${item.memberId}-${item.membershipName}`;
        const existing = usageMap.get(key);
        // Store only the most recent usage record
        if (!existing || new Date(item.orderDate) > new Date(existing.orderDate)) {
            usageMap.set(key, item);
        }
    });

    // Merge data
    return expirationData.map(member => {
        const usageEntry = usageMap.get(`${member.memberId}-${member.membershipName}`);
        return { ...member, ...usageEntry }; // Combine properties, usageEntry properties will overwrite if they exist
    });
}

// Get revenue based on membership name and home location
function getRevenue(membershipName, homeLocation) {
    if (!membershipName) return 0;
    
    // Use Kenkere House pricing (33905) if location is Kenkere House, otherwise use 13752
    const isKenkereHouse = homeLocation && homeLocation.toLowerCase().includes("kenkere");
    const pricingMap = isKenkereHouse ? CONFIG.PRICING_33905 : CONFIG.PRICING_13752;
    
    return pricingMap[membershipName] || 0;
}

// Extract associate name from sold by email
function extractAssociateFromEmail(soldBy) {
    if (!soldBy || typeof soldBy !== 'string') return null;
    
    const lowerEmail = soldBy.toLowerCase();
    for (const [key, name] of Object.entries(CONFIG.ASSOCIATE_EMAILS)) {
        if (lowerEmail.includes(key)) {
            return name;
        }
    }
    return null;
}

// Convert Sold By email to name
function formatSoldBy(soldBy) {
    if (!soldBy || typeof soldBy !== 'string') return "-";
    
    // Try to extract associate name from email
    const associateName = extractAssociateFromEmail(soldBy);
    if (associateName) return associateName;
    
    // If no match, return the original value (might already be a name)
    return soldBy;
}

// Calculate percentage-based allocation for associates based on revenue
function calculatePercentageAllocation(items, location) {
    const associates = CONFIG.ASSOCIATES[location];
    const percentages = CONFIG.ALLOCATION_PERCENTAGES[location];
    
    if (!associates || !percentages) return {};
    
    const totalRevenue = items.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const allocation = {};
    
    // Calculate target revenue for each associate based on percentages
    associates.forEach(associate => {
        const percentage = percentages[associate] || 0;
        const targetRevenue = (percentage / 100) * totalRevenue;
        allocation[associate] = {
            percentage: percentage,
            targetRevenue: targetRevenue,
            actualRevenue: 0,
            actualCount: 0,
            items: []
        };
    });
    
    return allocation;
}

// Assign associate with improved load balancing
function assignAssociate(item, homeLocation, soldBy, assignmentTracker, existingAssignment = null) {
    // Get associates for this location
    const associates = CONFIG.ASSOCIATES[homeLocation];
    if (!associates || associates.length === 0) return "-";
    
    // If we have an existing assignment and fresh allocation is disabled, use it
    if (!CONFIG.ENABLE_FRESH_ALLOCATION && existingAssignment && associates.includes(existingAssignment)) {
        // Update tracker with existing assignment
        if (!assignmentTracker[homeLocation]) {
            assignmentTracker[homeLocation] = {};
        }
        if (!assignmentTracker[homeLocation][existingAssignment]) {
            assignmentTracker[homeLocation][existingAssignment] = { revenue: 0, count: 0, items: [] };
        }
        assignmentTracker[homeLocation][existingAssignment].revenue += item.revenue || 0;
        assignmentTracker[homeLocation][existingAssignment].count += 1;
        assignmentTracker[homeLocation][existingAssignment].items.push(item);
        return existingAssignment;
    }
    
    // Fresh allocation logic (when flag is TRUE or no existing assignment)
    // Try to match with sold by email first
    const soldByAssociate = extractAssociateFromEmail(soldBy);
    if (soldByAssociate && associates.includes(soldByAssociate)) {
        // Update tracker
        if (!assignmentTracker[homeLocation]) {
            assignmentTracker[homeLocation] = {};
        }
        if (!assignmentTracker[homeLocation][soldByAssociate]) {
            assignmentTracker[homeLocation][soldByAssociate] = { revenue: 0, count: 0, items: [] };
        }
        assignmentTracker[homeLocation][soldByAssociate].revenue += item.revenue || 0;
        assignmentTracker[homeLocation][soldByAssociate].count += 1;
        assignmentTracker[homeLocation][soldByAssociate].items.push(item);
        return soldByAssociate;
    }
    
    // Initialize tracker for location if needed
    if (!assignmentTracker[homeLocation]) {
        assignmentTracker[homeLocation] = {};
        associates.forEach(assoc => {
            assignmentTracker[homeLocation][assoc] = { revenue: 0, count: 0, items: [] };
        });
    }
    
    // Improved load balancing: find associate with lowest revenue
    // In case of tie, pick the one with fewer items
    let selectedAssociate = associates[0];
    let minRevenue = Infinity;
    let minCount = Infinity;
    
    for (const assoc of associates) {
        if (!assignmentTracker[homeLocation][assoc]) {
            assignmentTracker[homeLocation][assoc] = { revenue: 0, count: 0, items: [] };
        }
        const tracker = assignmentTracker[homeLocation][assoc];
        
        // Primary: lowest revenue, Secondary: lowest count
        if (tracker.revenue < minRevenue || (tracker.revenue === minRevenue && tracker.count < minCount)) {
            minRevenue = tracker.revenue;
            minCount = tracker.count;
            selectedAssociate = assoc;
        }
    }
    
    // Update tracker
    assignmentTracker[homeLocation][selectedAssociate].revenue += item.revenue || 0;
    assignmentTracker[homeLocation][selectedAssociate].count += 1;
    assignmentTracker[homeLocation][selectedAssociate].items.push(item);
    
    return selectedAssociate;
}

function formatDataForSheet(finalData, frozenMemberIds, customerMap) {
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.DAYS_THRESHOLD);
    
    // Filter data: only include records where endDate is before today - 60 days
    const filteredData = finalData.filter(item => {
        const endDate = new Date(item.endDate);
        if (isNaN(endDate.getTime())) return false;
        return endDate < cutoffDate;
    });
    
    // Format final rows - only include rows with valid phone numbers and unique userIds
    const formattedRows = [];
    const seenUserIds = new Set();
    
    // Excluded names (case-insensitive)
    const excludedNames = [
        { firstName: 'mitali', lastName: 'kumar' },
        { firstName: 'saachi', lastName: 'shetty' },
        { firstName: 'mallika', lastName: 'parekh' }
    ];
    
    filteredData.forEach(item => {
        const customerData = customerMap.get(item.memberId);
        
        // Skip if no customer data or no phone number or invalid phone or duplicate userId
        if (!customerData || !customerData.phoneNumber || !isValidPhoneNumber(customerData.phoneNumber) || seenUserIds.has(item.memberId)) {
            return;
        }
        
        const email = (customerData.email || item.email || "").toLowerCase();
        const firstName = (customerData.firstName || item.firstName || "").toLowerCase().trim();
        const lastName = (customerData.lastName || item.lastName || "").toLowerCase().trim();
        
        // Skip if email contains "physique 57"
        if (email.includes("physique") && email.includes("57")) {
            return;
        }
        
        // Skip if name matches excluded list
        const isExcludedName = excludedNames.some(excluded => 
            firstName === excluded.firstName && lastName === excluded.lastName
        );
        
        if (isExcludedName) {
            return;
        }
        
        seenUserIds.add(item.memberId);
        
        formattedRows.push([
            item.memberId,                                // User ID
            customerData.phoneNumber,                     // Phone (formatted, no special chars)
            customerData.email || item.email || "-",      // Email
            customerData.firstName || item.firstName || "-", // First Name
            customerData.lastName || item.lastName || "-",   // Last Name
            "lapsed-members",                             // Tags
            item.membershipName || "-",                   // Membership Name
            formatDateToIST(item.endDate),                // End Date
            getLocationId(item.homeLocation)              // ID (mapped from homeLocation)
        ]);
    });
    
    console.log(`📊 Final output: ${formattedRows.length} unique rows with valid phone numbers`);

    return formattedRows;
}

// --- YELLOW MESSENGER INTEGRATION ---

/**
 * Fetches all existing user IDs from Yellow Messenger API
 * @returns {Promise<Array>} Array of user IDs
 */
async function fetchAllYMUserIds() {
    const url = 'https://cloud.yellow.ai/cdp/api/v1/user?properties=userId&bot=x1614586769188';
    const apiKey = CONFIG.YELLOW_MESSENGER.API_KEY;
    const limit = 50;
    let offset = 0;
    let allUserIds = [];
    let hasMoreData = true;
    
    console.log("\n📥 Fetching all existing user IDs from Yellow Messenger...");
    
    while (hasMoreData) {
        try {
            const response = await axios.get(`${url}&offset=${offset}&limit=${limit}`, { 
                headers: { 'x-api-key': apiKey } 
            });
            
            if (response.status === 200) {
                const userData = response.data.data.data;
                if (userData.length > 0) {
                    allUserIds = allUserIds.concat(userData.map(u => u.userId?.value).filter(Boolean));
                    offset += limit;
                } else {
                    hasMoreData = false;
                }
            } else {
                console.log(`⚠️ Error: ${response.status} - ${JSON.stringify(response.data)}`);
                hasMoreData = false;
            }
        } catch (error) {
            console.error('❌ Error fetching user IDs:', error.response ? error.response.data : error.message);
            hasMoreData = false;
        }
    }
    
    console.log(`✅ Pulled ${allUserIds.length} user IDs from Yellow Messenger`);
    return allUserIds;
}

/**
 * Deletes users from Yellow Messenger by their user IDs
 * @param {Array} userIds - Array of user IDs to delete
 */
async function deleteYMUsers(userIds) {
    if (userIds.length === 0) {
        console.log("ℹ️ No user IDs to delete from Yellow Messenger");
        return;
    }
    
    console.log(`\n🗑️ Deleting ${userIds.length} users from Yellow Messenger...`);
    
    const limit = pLimit(CONFIG.YELLOW_MESSENGER.CONCURRENT_REQUESTS);
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const failedUserIds = [];
    
    // Helper function to delete a single user with retry logic
    const deleteUserWithRetry = async (userId, retryCount = 0) => {
        const url = `${CONFIG.YELLOW_MESSENGER.API_BASE_URL}${encodeURIComponent(userId)}${CONFIG.YELLOW_MESSENGER.BOT_PARAM}`;
        const maxRetries = 3;
        
        try {
            const response = await axios.delete(url, { 
                headers: { 'x-api-key': CONFIG.YELLOW_MESSENGER.API_KEY } 
            });
            
            return { success: true, status: response.status };
        } catch (error) {
            // Ignore 404 errors (user already deleted)
            if (error.response && error.response.status === 404) {
                return { success: true, status: 404 };
            }
            
            // Retry on specific error codes if we haven't exceeded max retries
            const shouldRetry = error.response && 
                               (error.response.status === 429 || error.response.status >= 500) &&
                               retryCount < maxRetries;
            
            if (shouldRetry) {
                const delay = Math.pow(2, retryCount) * 500; // Exponential backoff: 500ms, 1s, 2s
                await new Promise(resolve => setTimeout(resolve, delay));
                return deleteUserWithRetry(userId, retryCount + 1);
            }
            
            // Failed after retries or non-retryable error
            return { 
                success: false, 
                userId, 
                status: error.response ? error.response.status : 'NETWORK_ERROR',
                error: error.message 
            };
        }
    };
    
    const promises = userIds.map((userId) =>
        limit(async () => {
            const result = await deleteUserWithRetry(userId);
            
            processedCount++;
            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                failedUserIds.push(result.userId);
                console.error(`  ⚠️ Error deleting ${result.userId}: ${result.status}`);
            }
            
            if (processedCount % 100 === 0) {
                console.log(`  ⏳ Progress: ${processedCount}/${userIds.length}`);
            }
        })
    );
    
    await Promise.allSettled(promises);
    
    console.log("\n--- Delete Summary ---");
    console.log(`Total Processed: ${processedCount}`);
    console.log(`✅ Successes: ${successCount}`);
    console.log(`❌ Failures: ${errorCount}`);
    console.log("--------------------\n");
    
    // If there were failures, retry them once more
    if (failedUserIds.length > 0) {
        console.log(`🔄 Retrying ${failedUserIds.length} failed deletions...`);
        
        let retrySuccessCount = 0;
        const retryPromises = failedUserIds.map((userId) =>
            limit(async () => {
                const result = await deleteUserWithRetry(userId);
                if (result.success) {
                    retrySuccessCount++;
                    successCount++;
                    errorCount--;
                } else {
                    console.error(`  ⚠️ Retry failed for ${result.userId}: ${result.status}`);
                }
            })
        );
        
        await Promise.allSettled(retryPromises);
        
        console.log(`\n✅ Retry recovered ${retrySuccessCount}/${failedUserIds.length} deletions`);
        console.log(`Final: ${successCount} successes, ${errorCount} failures\n`);
    }
}

/**
 * Creates new users in Yellow Messenger from sheet data
 * @param {Array} sheetRows - Array of user data rows from the sheet
 */
async function createYMUsers(sheetRows) {
    if (!sheetRows || sheetRows.length === 0) {
        console.log("ℹ️ No user data to create in Yellow Messenger");
        return;
    }
    
    console.log(`\n👥 Creating ${sheetRows.length} users in Yellow Messenger...`);
    
    // Transform sheet rows to Yellow Messenger user format and validate
    // Sheet columns: userId, phone, email, firstName, lastName, tags, membershipName, endDate, ID
    const users = sheetRows
        .map((row, index) => {
            const [userId, phone, email, firstName, lastName, tags, membershipName, endDate, ID] = row;
            
            return {
                userId: userId ? userId.toString() : '',
                firstName: firstName ? firstName.toString() : '',
                lastName: lastName ? lastName.toString() : '',
                phone: phone ? phone.toString() : '',
                tags: tags ? [tags] : ['lapsed-members'],
                ID: ID ? ID.toString() : '',
                rowIndex: index
            };
        })
        .filter(u => {
            // Validate required fields and phone number format
            if (!u.userId || !u.firstName || !u.phone) return false;
            if (!isValidPhoneNumber(u.phone)) {
                console.log(`  ⚠️ Skipping row ${u.rowIndex}: Invalid phone number ${u.phone}`);
                return false;
            }
            return true;
        })
        .map(u => {
            // Remove rowIndex before sending to API
            const { rowIndex, ...user } = u;
            return user;
        });
    
    if (users.length === 0) {
        console.log("⚠️ No valid users to create (missing required fields or invalid phones)");
        return;
    }
    
    console.log(`📊 Valid users for creation: ${users.length}`);
    
    const url = `https://cloud.yellow.ai/cdp/api/v1/user/create-bulk?bot=x1614586769188&uponConflict=UPDATE_EXISTING`;
    const apiKey = CONFIG.YELLOW_MESSENGER.API_KEY;
    const batchSize = CONFIG.YELLOW_MESSENGER.BATCH_SIZE;
    let totalSuccess = 0;
    let totalFailed = 0;
    
    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const payload = { users: batch };
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(users.length / batchSize);
        
        try {
            console.log(`  📤 Creating batch ${batchNum}/${totalBatches} (${batch.length} users)...`);
            
            const response = await axios.post(url, payload, {
                headers: { 
                    'x-api-key': apiKey, 
                    'Content-Type': 'application/json' 
                }
            });
            
            console.log(`  ✅ Batch ${batchNum}: ${response.status} - Success`);
            totalSuccess += batch.length;
        } catch (error) {
            const errorData = error.response ? error.response.data : error.message;
            const errorMsg = JSON.stringify(errorData);
            console.error(`  ❌ Batch ${batchNum} error: ${errorMsg}`);
            
            // Try to parse which row failed and retry without it
            const rowMatch = errorMsg.match(/Row \[(\d+)\]/);
            if (rowMatch && batch.length > 1) {
                const failedRowIndex = parseInt(rowMatch[1]);
                console.log(`  🔄 Retrying batch ${batchNum} without row ${failedRowIndex}...`);
                
                // Remove the failed row and retry
                const retryBatch = batch.filter((_, idx) => idx !== failedRowIndex);
                
                try {
                    const retryResponse = await axios.post(url, { users: retryBatch }, {
                        headers: { 
                            'x-api-key': apiKey, 
                            'Content-Type': 'application/json' 
                        }
                    });
                    console.log(`  ✅ Batch ${batchNum} retry: ${retryResponse.status} - Success (${retryBatch.length} users)`);
                    totalSuccess += retryBatch.length;
                    totalFailed += 1;
                } catch (retryError) {
                    console.error(`  ❌ Batch ${batchNum} retry also failed`);
                    totalFailed += batch.length;
                }
            } else {
                totalFailed += batch.length;
            }
        }
    }
    
    console.log(`\n✅ Yellow Messenger user creation complete`);
    console.log(`   📊 Success: ${totalSuccess}, Failed: ${totalFailed}`);
}

// --- MAIN EXECUTION ---

async function main() {
    // Load p-limit dynamically
    pLimit = (await import('p-limit')).default;
    
    const startTime = Date.now();
    const sheetService = new GoogleSheetService();

    if (!CONFIG.MOMENCE_HEADERS.Cookie) {
        console.error("FATAL: MOMENCE_AUTH_TOKEN is not defined in the .env file.");
        process.exit(1);
    }

    try {
        // Clear the sheet and write the new header row
        await sheetService.clearSheet();
        await sheetService.writeToSheet(`${CONFIG.SHEET_NAME}!A1`, [CONFIG.HEADERS_FOR_SHEET]);

        // Fetch frozen members
        console.log("📥 Fetching frozen members...");
        const frozenItems = await fetchMomenceData(CONFIG.FROZEN_URLS);
        const frozenMemberIds = new Set(frozenItems.map(item => item.memberId));

        // Fetch not-activated members
        console.log("📥 Fetching not-activated members...");
        const notActivatedItems = await fetchMomenceData(CONFIG.NOT_ACTIVATED_URLS);
        const notActivatedMemberIds = new Set(notActivatedItems.map(item => item.memberId));

        // Combine exclusion sets
        const exclusionMemberIds = new Set([...frozenMemberIds, ...notActivatedMemberIds]);

        // Fetch all expiring and upcoming expiring memberships
        console.log("📥 Fetching expiration data...");
        const expirationItems = await fetchMomenceData(CONFIG.EXPIRATION_URLS);

        // Pre-process and filter the expiration data
        console.log("🔧 Processing and filtering expiration data...");
        const processedExpirations = processAndFilterExpirations(expirationItems, exclusionMemberIds);

        // Fetch usage data to enrich the expiration data
        console.log("📥 Fetching usage data...");
        const usageItems = await fetchMomenceData(CONFIG.USAGE_URLS);

        // Merge usage data into the filtered expiration list
        console.log("🔧 Merging usage data...");
        const mergedData = mergeUsageData(processedExpirations, usageItems);

        // Keep only the latest record per member
        console.log("🔧 Filtering to latest record per member...");
        const latestByMemberId = new Map();
        
        mergedData.forEach(item => {
            const memberId = item.memberId;
            if (!memberId) return;

            const endDate = new Date(item.endDate);
            if (isNaN(endDate.getTime())) return;

            const existing = latestByMemberId.get(memberId);
            if (!existing) {
                latestByMemberId.set(memberId, item);
            } else {
                const existingEndDate = new Date(existing.endDate);
                if (endDate > existingEndDate) {
                    latestByMemberId.set(memberId, item);
                }
            }
        });
        
        const finalData = Array.from(latestByMemberId.values());

        // Build member-host pairs for customer data fetching
        // Determine hostId from homeLocation: Kenkere House = 33905, others = 13752
        const memberHostPairs = [];
        const uniqueMemberIds = new Set();
        
        finalData.forEach(item => {
            if (item.memberId && !uniqueMemberIds.has(item.memberId)) {
                uniqueMemberIds.add(item.memberId);
                
                // Determine hostId based on home location
                const homeLocation = (item.homeLocation || "").toLowerCase();
                const hostId = homeLocation.includes("kenkere") ? 33905 : 13752;
                
                memberHostPairs.push({ 
                    memberId: item.memberId, 
                    hostId: hostId,
                    homeLocation: item.homeLocation 
                });
            }
        });
        
        // Fetch customer data with phone numbers
        const customerMap = await fetchCustomerDataByMembers(memberHostPairs);

        // Format and filter the data
        const sheetRows = formatDataForSheet(finalData, frozenMemberIds, customerMap);

        // Write to Google Sheets
        if (sheetRows.length > 0) {
            await sheetService.writeToSheet(`${CONFIG.SHEET_NAME}!A2`, sheetRows);
            console.log(`✅ Wrote ${sheetRows.length} rows to sheet`);
            
            // --- YELLOW MESSENGER INTEGRATION ---
            console.log("\n" + "=".repeat(50));
            console.log("🟡 YELLOW MESSENGER SYNC");
            console.log("=".repeat(50));
            
            // Step 1: Fetch all existing Yellow Messenger user IDs
            const existingYMUserIds = await fetchAllYMUserIds();
            
            // Step 2: Delete all existing users from Yellow Messenger
            if (existingYMUserIds.length > 0) {
                await deleteYMUsers(existingYMUserIds);
            }
            
            // Step 3: Create new users in Yellow Messenger from sheet data
            await createYMUsers(sheetRows);
            
            console.log("=".repeat(50));
            console.log("✅ Yellow Messenger sync complete");
            console.log("=".repeat(50) + "\n");
        } else {
            console.log("⚠️ No valid data to write");
        }

        const duration = (Date.now() - startTime) / 1000;
        console.log(`\n✅ Completed in ${duration.toFixed(2)}s`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();