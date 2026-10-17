@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to preview this site locally.
  pause
  exit /b 1
)
node "%~dp0serve.cjs"
if errorlevel 1 pause
