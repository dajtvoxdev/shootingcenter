@echo off
setlocal

set "ROOT=%~dp0"

echo Starting Backend and Frontend dev servers...

start "Shooting Center Backend" cmd /k "cd /d "%ROOT%backend" && npm run dev"
start "Shooting Center Frontend" cmd /k "cd /d "%ROOT%" && npm run dev"

echo Done. Two terminal windows have been opened.
