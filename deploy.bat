@echo off
echo ========================================
echo    Whitelist App Deployment Helper
echo ========================================
echo.

echo Checking if build files exist...
if not exist "out" (
    echo ERROR: Build files not found!
    echo Please run: npm run build
    echo.
    pause
    exit /b 1
)

echo ✅ Build files found in 'out' directory
echo.

echo Creating deployment package...
if exist "whitelist-deployment.zip" del "whitelist-deployment.zip"

echo Compressing files for deployment...
powershell -command "Compress-Archive -Path 'out\*' -DestinationPath 'whitelist-deployment.zip' -Force"

if exist "whitelist-deployment.zip" (
    echo ✅ Deployment package created: whitelist-deployment.zip
    echo.
    echo 📁 Package contents:
    echo    - index.html (main app)
    echo    - _next/ folder (assets)
    echo    - Logo and icon files
    echo    - 404 error page
    echo.
    echo 🚀 DEPLOYMENT INSTRUCTIONS:
    echo.
    echo For cPanel hosting:
    echo 1. Extract whitelist-deployment.zip
    echo 2. Upload ALL extracted files to public_html
    echo 3. Ensure file structure is maintained
    echo.
    echo For other hosting:
    echo - See DEPLOYMENT_GUIDE.md for detailed instructions
    echo.
    echo ⚠️  IMPORTANT: Configure WalletConnect Project ID before deployment
    echo    Get your ID from: https://cloud.walletconnect.com/
    echo.
) else (
    echo ❌ Failed to create deployment package
    echo Please check if you have PowerShell available
)

echo.
echo Press any key to exit...
pause >nul
