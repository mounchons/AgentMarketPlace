@echo off
setlocal enabledelayedexpansion
REM ============================================================================
REM dev-unlink.bat - Restore original cached plugin from backup
REM
REM Usage:   dev-unlink.bat [plugin-name]
REM Default: system-design-doc
REM
REM What it does:
REM   1. Finds <version>-dev-backup directory
REM   2. Verifies the live <version> is a junction (not a real dir with data)
REM   3. Removes the junction (which does NOT touch the local source)
REM   4. Renames backup back to <version>
REM
REM See docs\local-testing-guide.md for full workflow.
REM ============================================================================

set PLUGIN_NAME=%~1
if "%PLUGIN_NAME%"=="" set PLUGIN_NAME=system-design-doc

set CACHE_BASE=%USERPROFILE%\.claude\plugins\cache\agent-marketplace\%PLUGIN_NAME%

echo.
echo === dev-unlink [%PLUGIN_NAME%] ===
echo Cache base: %CACHE_BASE%
echo.

REM ---- Validate cache base --------------------------------------------------
if not exist "%CACHE_BASE%" (
    echo [ERROR] Cache base not found: %CACHE_BASE%
    exit /b 1
)

REM ---- Find backup directory ------------------------------------------------
set BACKUP_DIR=
for /d %%d in ("%CACHE_BASE%\*-dev-backup") do (
    set BACKUP_DIR=%%d
)

if "%BACKUP_DIR%"=="" (
    echo [ERROR] No *-dev-backup directory found under %CACHE_BASE%
    echo Nothing to restore. Was dev-link.bat run for %PLUGIN_NAME%?
    exit /b 1
)

REM ---- Derive original version name -----------------------------------------
for %%i in ("%BACKUP_DIR%") do set BACKUP_NAME=%%~nxi
set ORIG_VERSION=%BACKUP_NAME:-dev-backup=%
set CACHE_DIR=%CACHE_BASE%\%ORIG_VERSION%

echo Backup found:    %BACKUP_DIR%
echo Restore target:  %CACHE_DIR%
echo.

REM ---- Confirm cache dir is a junction (not real data) ----------------------
if not exist "%CACHE_DIR%" (
    echo [WARN] %CACHE_DIR% does not exist. Will create directly from backup.
    goto :restore
)

fsutil reparsepoint query "%CACHE_DIR%" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] %CACHE_DIR% is NOT a junction.
    echo         It looks like a real directory. Aborting to prevent data loss.
    echo         Investigate manually before running this script again.
    exit /b 1
)

REM ---- Remove junction (safe: only removes link, NOT target) ----------------
echo Removing junction ...
rmdir "%CACHE_DIR%"
if errorlevel 1 (
    echo [ERROR] Could not remove junction at %CACHE_DIR%.
    echo         Make sure Claude Code is fully closed and try again.
    exit /b 1
)

:restore
REM ---- Rename backup back to original ---------------------------------------
echo Restoring backup -^> %ORIG_VERSION% ...
ren "%BACKUP_DIR%" "%ORIG_VERSION%"
if errorlevel 1 (
    echo [ERROR] Could not restore backup. Run manually:
    echo         ren "%BACKUP_DIR%" "%ORIG_VERSION%"
    exit /b 1
)

echo.
echo === SUCCESS ===
echo %PLUGIN_NAME% restored to original cached version.
echo   Restored: %CACHE_DIR%
echo.
echo Restart Claude Code to load the original plugin.
echo.
endlocal
