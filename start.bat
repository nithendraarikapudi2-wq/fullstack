@echo off
title Knowledge Portal Launcher
echo Starting the integrated ecosystem...
powershell -ExecutionPolicy Bypass -File "%~dp0run_all.ps1"
echo.
echo Launch sequence completed.
pause
