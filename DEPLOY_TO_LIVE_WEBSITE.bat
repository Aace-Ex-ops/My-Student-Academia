@echo off
title Deploying My Student Academia to Cloudflare Pages...
echo ======================================================================
echo   DEPLOYING LATEST MY STUDENT ACADEMIA TO LIVE CLOUDFLARE PAGES
echo ======================================================================
echo.
cd /d "c:\Users\adity\OneDrive\Desktop\My Student Academia\frontend"

echo [1/2] Verifying production build...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check errors.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Deploying assets to Cloudflare Pages (my-student-academia.pages.dev)...
echo If Cloudflare asks for authorization in your browser, please click "Allow".
echo.
call npx wrangler pages deploy dist --project-name=my-student-academia

echo.
echo ======================================================================
echo   DEPLOYMENT COMPLETE!
echo   Visit: https://my-student-academia.pages.dev
echo ======================================================================
echo.
pause
