@echo off
chcp 65008 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0export-zip.ps1"
