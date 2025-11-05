# 🔑 Fix Momence 401 Unauthorized Error

## The Problem

You're seeing errors like:
```
Failed to fetch data from https://api.momence.com/host/13752/reports/...
Request failed with status code 401
```

This means **Momence authentication cookies are missing or expired**.

## ⚡ Quick Fix

### Step 1: Add MOMENCE_ALL_COOKIES to Railway

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click on your service** → **Variables** tab
3. **Add new variable**:

```
Name:  MOMENCE_ALL_COOKIES
Value: momence.device.id=bf885f4b-2f95-45e9-ab8f-13753c71ff65; ribbon.connect.sid=s%3AFojosehASk_v46MzWKGgRowKA3qPVN1s.CFTf2XwtcuKtdeCjrFN8fSdWSfbqFfGhVFEBff0RUTw
```

Copy the value from your local `.env` file:
```bash
cat .env | grep MOMENCE_ALL_COOKIES
```

### Step 2: Check if Cookies are Still Valid

Momence session cookies typically expire after a period of inactivity. If adding the cookies doesn't work, they may have expired.

## 🔄 If Cookies Have Expired

You need to get fresh cookies by logging into Momence:

### Option 1: Manual Cookie Extraction

1. **Open Momence** in your browser: https://momence.com/login
2. **Log in** with your credentials
3. **Open DevTools** (F12 or Cmd+Option+I)
4. **Go to Application tab** (Chrome) or Storage tab (Firefox)
5. **Click on Cookies** → `https://momence.com`
6. **Find these cookies**:
   - `momence.device.id`
   - `ribbon.connect.sid`
7. **Copy the values** and format as:
   ```
   momence.device.id=<value>; ribbon.connect.sid=<value>
   ```
8. **Update both**:
   - Local `.env` file: `MOMENCE_ALL_COOKIES="..."`
   - Railway Variables: `MOMENCE_ALL_COOKIES=...`

### Option 2: Use a Momence Auth Script

If you have a script that automates Momence login (like the one in your workspace that generates the `.env` file), run it to get fresh cookies:

```bash
# If you have an auth script
node momence-auth-script.js

# Then update Railway with the new cookies from .env
cat .env | grep MOMENCE_ALL_COOKIES
```

## 📋 Complete Environment Variable Checklist for Railway

Make sure ALL these variables are set in Railway:

- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `GOOGLE_REFRESH_TOKEN`
- ⚠️ `MOMENCE_ALL_COOKIES` (← This one is missing!)

## 🔍 How to Tell if Cookies are Expired

**Expired cookies** show these symptoms:
- ❌ 401 Unauthorized errors from Momence API
- ❌ "Authentication required" messages
- ❌ Script completes but finds 0 records

**Valid cookies** result in:
- ✅ Successful API calls to Momence
- ✅ Data fetched from frozen-memberships, expiration, etc.
- ✅ Records written to Google Sheet

## 🆘 Still Getting 401 Errors?

### Debug Steps:

1. **Test cookies locally**:
   ```bash
   # Run the script locally with your .env file
   node expired-data-for-ym.js
   ```
   
   If it works locally but not on Railway, the Railway variable is wrong.

2. **Check cookie format**:
   - Should be: `name1=value1; name2=value2`
   - No quotes in Railway (quotes are for .env file only)
   - Semicolon and space between cookies

3. **Verify cookies aren't expired**:
   - Log into Momence in your browser
   - If you're redirected to login page, cookies are expired
   - Get fresh cookies using Option 1 or 2 above

4. **Check API permissions**:
   - Make sure your Momence account has access to hostIds 13752 and 33905
   - Verify you can see the reports in Momence dashboard manually

## 📝 Example: Complete Setup

Here's what your Railway Variables should look like (use YOUR actual values):

```
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REFRESH_TOKEN=<your-google-refresh-token>
MOMENCE_ALL_COOKIES=momence.device.id=<device-id>; ribbon.connect.sid=<session-id>
```

Copy the actual values from your local `.env` file!

## ⏱️ Cookie Expiration

Momence session cookies typically expire:
- After **10 days** of inactivity
- When you **log out** from Momence
- When cookies are **manually cleared** from browser

**Pro Tip**: Set a reminder to refresh cookies every week to avoid interruptions in your cron job!

---

**After fixing**, your next deployment log should show:
```
✅ Environment variables validated successfully
   MOMENCE_COOKIES: Set (momence.device.id=bf885f4b...)
📥 Fetching frozen members...
✅ Fetched X frozen members
```

Instead of 401 errors! 🎉
