@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Install Node.js 20 or newer from https://nodejs.org/ then try again.
 pause
 exit /b 1
)
if not exist node_modules\ffmpeg-static\ffmpeg.exe (
 call npm install --no-audit --no-fund
 if errorlevel 1 (
  echo Setup failed. Check your internet connection and try again.
  pause
  exit /b 1
 )
)
echo Starting Demo Studio. Keep this window open while recording.
node server.mjs --open
pause
