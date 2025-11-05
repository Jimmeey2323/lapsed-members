# Manual Run Guide

## Interactive Terminal Version

I've created an interactive version of the script that's perfect for manual testing and debugging.

## 🚀 How to Use

### Quick Start

```bash
# Run the interactive version
npm run manual

# Or run directly
node manual-run.js

# Or if executable
./manual-run.js
```

## ✨ Features

### 1. **Colored Terminal Output**
- ✅ Green checkmarks for success
- ❌ Red X for errors
- ⚠️ Yellow warnings
- ℹ️ Blue info messages
- 📊 Magenta for data/stats
- Color-coded progress indicators

### 2. **Environment Validation Display**
Shows each environment variable with preview:
```
✅ GOOGLE_CLIENT_ID: 416630995185-g7b0fm679lb4p...
✅ GOOGLE_CLIENT_SECRET: GOCSPX-waI...
✅ GOOGLE_REFRESH_TOKEN: 1//04yfYtJ...
✅ MOMENCE_ALL_COOKIES: momence.device.id=bf885f4b...
```

### 3. **Interactive Confirmation**
Before running, you'll see current settings:
```
Current Settings:
  Days Threshold: 60 days
  Host IDs: 13752, 33905
  Google Sheet ID: 18f-vMwJl9vrKPXkpP-ZXVr6bLADkCZfykKgZEyA3WWo
  Sheet Name: Lapsed

Do you want to proceed? (yes/no):
```

### 4. **Better Error Messages**
- Clear indication of what went wrong
- Helpful suggestions for fixes
- Color-coded error types

## 📊 Example Output

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║         📋 LAPSED MEMBERS - MANUAL RUN MODE 📋           ║
║                                                           ║
║  Interactive terminal version for testing & debugging    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

============================================================
  Environment Validation
============================================================

✅ GOOGLE_CLIENT_ID: 416630995185-g7b0fm679lb4p...
✅ GOOGLE_CLIENT_SECRET: GOCSPX-waI...
✅ GOOGLE_REFRESH_TOKEN: 1//04yfYtJ...
✅ MOMENCE_ALL_COOKIES: momence.device.id=bf885f4b...

✅ All environment variables are set!

============================================================
  Manual Run Configuration
============================================================

Current Settings:
  Days Threshold: 60 days
  Host IDs: 13752, 33905
  Google Sheet ID: 18f-vMwJl9vrKPXkpP-ZXVr6bLADkCZfykKgZEyA3WWo
  Sheet Name: Lapsed

Do you want to proceed? (yes/no): yes

============================================================
  Starting Data Collection
============================================================

ℹ️  Delegating to main script...

[Script continues with regular output...]
```

## 🆚 Difference from Regular Script

| Feature | Regular Script | Manual Script |
|---------|---------------|---------------|
| **Colors** | No | ✅ Yes |
| **Interactive** | No | ✅ Yes |
| **Environment Preview** | Basic | ✅ Detailed |
| **Confirmation** | Auto-runs | ✅ Asks first |
| **Progress Bars** | No | ✅ Yes (planned) |
| **Use Case** | Automation/Cron | Testing/Debugging |

## 💡 When to Use Manual Run

### ✅ Use Manual Run When:
- Testing locally before deploying to Railway
- Debugging issues with authentication
- Checking if environment variables are correct
- Running one-time manual data pulls
- Verifying configuration changes
- Learning how the script works

### ❌ Use Regular Script When:
- Running in Railway cron job
- Automated scheduled runs
- CI/CD pipelines
- Background processes
- Production deployments

## 🔧 Customization

You can modify settings in the manual run by editing `manual-run.js`:

```javascript
const CONFIG = {
    DAYS_THRESHOLD: 60,  // Change this
    HOST_IDS: [13752, 33905],  // Or this
    // ... etc
};
```

## 🐛 Debugging

The manual version is perfect for debugging because:

1. **See environment vars**: Instantly see if variables are loaded correctly
2. **Interactive**: Can stop before actual execution
3. **Colored output**: Easier to spot errors
4. **Preview settings**: Verify configuration before running

## 🎨 Color Codes

The script uses these indicators:

- 🟢 `✅` Green = Success
- 🔴 `❌` Red = Error
- 🟡 `⚠️` Yellow = Warning
- 🔵 `ℹ️` Blue = Information
- 🟣 `📊` Magenta = Data/Stats
- 🔷 `▶` Cyan = Step/Action

## 📝 Example Commands

```bash
# Normal run (automated mode)
npm start

# Manual run (interactive mode)
npm run manual

# Generate new OAuth token
npm run generate-token
```

## 🚦 Exit Codes

- `0` = Success
- `1` = Error (missing env vars, validation failed, etc.)

## 💪 Pro Tips

1. **Test locally first**: Always run `npm run manual` before deploying to Railway
2. **Check colors**: If you don't see colors, your terminal might not support ANSI
3. **Cancel anytime**: Press Ctrl+C to stop at any prompt
4. **Review settings**: Take a moment to review the configuration before confirming

---

**Happy testing!** 🎉

For automated runs, use the regular script: `npm start` or deploy to Railway for cron scheduling.
