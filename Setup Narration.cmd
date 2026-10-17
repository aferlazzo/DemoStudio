@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -File scripts\setup-speech.ps1
pause
