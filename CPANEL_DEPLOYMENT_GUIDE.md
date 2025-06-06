# cPanel Deployment Guide for Whitelist Web3 App

## 🚀 Quick Start

Your whitelist application has been successfully built and packaged for cPanel deployment. All files are ready in the `cpanel-deploy` directory.

## 📁 Generated Files

- **Total Files**: 125 files
- **Build Type**: Static Export (no server required)
- **Target Platform**: cPanel shared hosting
- **Build Date**: Generated automatically with each build

## 📋 Deployment Steps

### Step 1: Access cPanel File Manager
1. Log into your cPanel account
2. Navigate to **File Manager**
3. Go to the **public_html** directory

### Step 2: Clear Existing Files (if replacing)
If you're updating an existing deployment:
1. Select all files in public_html
2. Delete them (backup first if needed)
3. Empty the trash/recycle bin

### Step 3: Upload Files
1. **Option A - Individual Upload:**
   - Select all files from the `cpanel-deploy` folder
   - Upload them directly to public_html root

2. **Option B - Zip Upload (Recommended):**
   - Create a ZIP file of all contents in `cpanel-deploy`
   - Upload the ZIP file to public_html
   - Extract the ZIP file in public_html
   - Delete the ZIP file after extraction

### Step 4: Verify File Structure
Ensure your public_html directory looks like this:
```
public_html/
├── index.html                    (main entry point)
├── _next/                       (Next.js assets)
│   ├── static/
│   │   ├── chunks/
│   │   ├── css/
│   │   └── media/
│   └── [build-id]/
├── 404.html                     (error page)
├── favicon.ico
├── *.svg                        (logo files)
└── other static assets
```

### Step 5: Test Your Deployment
1. Visit your domain (e.g., https://yourdomain.com)
2. Verify the whitelist app loads correctly
3. Test wallet connection functionality
4. Ensure all features work as expected

## ⚠️ Important Requirements

### HTTPS Required
- **Web3 wallets require HTTPS** for security
- Ensure your domain has SSL certificate enabled
- Most cPanel providers offer free SSL certificates

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Web3 wallet extensions supported

## 🔧 Troubleshooting

### Common Issues

**1. App doesn't load / White screen**
- Check if all files uploaded correctly
- Verify index.html is in public_html root
- Check browser console for errors

**2. Wallet connection fails**
- Ensure HTTPS is enabled
- Check if wallet extension is installed
- Verify network connectivity

**3. 404 errors for assets**
- Verify _next folder structure is intact
- Check file permissions (should be 644 for files, 755 for folders)
- Ensure no files are corrupted during upload

**4. Styling issues**
- Check if CSS files in _next/static/css/ are present
- Verify no CDN/caching issues
- Clear browser cache

### File Permissions
Set these permissions in cPanel File Manager:
- **Files**: 644
- **Folders**: 755

## 📊 Build Information

The deployment includes:
- **Static HTML pages**: Pre-rendered for fast loading
- **JavaScript chunks**: Optimized and minified
- **CSS files**: Compiled Tailwind CSS
- **Assets**: SVG logos and icons
- **Web3 functionality**: Client-side only

## 🔄 Future Updates

To update your deployment:
1. Run `npm run build:cpanel` in your development environment
2. Replace all files in public_html with new files from `cpanel-deploy`
3. Clear any browser/CDN caches

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files uploaded correctly
3. Ensure HTTPS is working
4. Contact your hosting provider for server-specific issues

## 🎯 Features Included

Your deployed app includes:
- ✅ Wallet connection (MetaMask, WalletConnect, etc.)
- ✅ Currency selection (USDT, ePound)
- ✅ Whitelist approval functionality
- ✅ Mobile-responsive design
- ✅ Toast notifications
- ✅ Progress indicators
- ✅ Error handling

---

**Note**: This is a static export - no server-side functionality is required. All Web3 interactions happen client-side in the user's browser.
