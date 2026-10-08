@echo off
echo ========================================================
echo  Sahara Social Foundation - One-Click Git & Vercel Push
echo ========================================================
echo.
echo Staging all project changes...
git add .
echo.
echo Committing updates...
git commit -m "Update multi-device mobile layout and live CRM sync"
echo.
echo Pushing to GitHub (main branch)...
git push origin main
echo.
echo ========================================================
echo  SUCCESS! Changes pushed to GitHub!
echo  Vercel is now deploying your latest build.
echo ========================================================
echo.
pause
