@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20+ is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)
if not exist .env copy .env.example .env >nul
node server.js
pause
