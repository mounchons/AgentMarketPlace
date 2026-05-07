@echo off
setlocal enabledelayedexpansion
REM ============================================================================
REM dev-link.bat - Symlink Claude Code plugin cache to local working tree
REM
REM Usage:   dev-link.bat [plugin-name]
REM Default: system-design-doc
REM Example: dev-link.bat ui-mockup
REM
REM What it does:
REM   1. Finds the currently-installed plugin version under
REM      %%USERPROFILE%%\.claude\plugins\cache\agent-marketplace\<plugin>\<version>
REM   2. Renames that version dir to <version>-dev-backup
REM   3. Creates a junction at <version> pointing to local plugins\<plugin>
REM   4. Restart Claude Code -> it now loads from local working tree
REM
REM See docs\local-testing-guide.md for full workflow.
REM ============================================================================

set PLUGIN_NAME=%~1
if "%PLUGIN_NAME%"=="" set PLUGIN_NAME=system-design-doc

REM ---- Resolve repo root (this script lives in tools\) ----------------------
set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR:~0,-7%
set LOCAL_PLUGIN=%REPO_ROOT%\plugins\%PLUGIN_NAME%

REM ---- Resolve cache base ---------------------------------------------------
set CACHE_BASE=%USERPROFILE%\.claude\plugins\cache\agent-marketplace\%PLUGIN_NAME%

echo.
echo === dev-link [%PLUGIN_NAME%] ===
echo Repo root:    %REPO_ROOT%
echo Local plugin: %LOCAL_PLUGIN%
echo Cache base:   %CACHE_BASE%
echo.

REM ---- Validate local plugin exists -----------------------------------------
if not exist "%LOCAL_PLUGIN%\.claude-plugin\plugin.json" (
    echo [ERROR] Local plugin manifest not found:
    echo         %LOCAL_PLUGIN%\.claude-plugin\plugin.json
    echo Make sure you are running this from the correct repo and the plugin exists.
    exit /b 1
)

REM ---- Validate cache base exists -------------------------------------------
if not exist "%CACHE_BASE%" (
    echo [ERROR] Cache base directory not found:
    echo         %CACHE_BASE%
    echo The plugin may not be installed via the agent-marketplace yet.
    echo Run /plugin install %PLUGIN_NAME%@agent-marketplace in Claude Code first.
    exit /b 1
)

REM ---- Find currently installed version (skip *-dev-backup) -----------------
set CURRENT_VERSION=
for /d %%d in ("%CACHE_BASE%\*") do (
    set DNAME=%%~nxd
    set SUFFIX=!DNAME:~-11!
    if not "!SUFFIX!"=="-dev-backup" set CURRENT_VERSION=!DNAME!
)

if "%CURRENT_VERSION%"=="" (
    echo [ERROR] No installed version directory found under %CACHE_BASE%
    exit /b 1
)

set CACHE_DIR=%CACHE_BASE%\%CURRENT_VERSION%
set BACKUP_DIR=%CACHE_BASE%\%CURRENT_VERSION%-dev-backup

echo Found installed version: %CURRENT_VERSION%
echo.

REM ---- Check if already linked ----------------------------------------------
fsutil reparsepoint query "%CACHE_DIR%" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] %CACHE_DIR% is already a junction.
    echo        Possibly already dev-linked. Run dev-unlink.bat first to refresh.
    exit /b 0
)

REM ---- Refuse if backup already exists --------------------------------------
if exist "%BACKUP_DIR%" (
    echo [ERROR] Backup directory already exists:
    echo         %BACKUP_DIR%
    echo A previous dev-link may have been interrupted. Manual cleanup needed.
    exit /b 1
)

REM ---- Backup current cache dir ---------------------------------------------
echo Backing up cache to %CURRENT_VERSION%-dev-backup ...
ren "%CACHE_DIR%" "%CURRENT_VERSION%-dev-backup"
if errorlevel 1 (
    echo [ERROR] Could not rename %CACHE_DIR%.
    echo         Make sure Claude Code is fully closed and try again.
    exit /b 1
)

REM ---- Create junction ------------------------------------------------------
echo Creating junction %CACHE_DIR% -^> %LOCAL_PLUGIN% ...
mklink /J "%CACHE_DIR%" "%LOCAL_PLUGIN%" >nul
if errorlevel 1 (
    echo [ERROR] mklink failed. Reverting backup ...
    ren "%BACKUP_DIR%" "%CURRENT_VERSION%"
    exit /b 1
)

echo.
echo === SUCCESS ===
echo %PLUGIN_NAME% cache is now linked to local working tree.
echo   Cache:  %CACHE_DIR%   (junction)
echo   Source: %LOCAL_PLUGIN%
echo   Backup: %BACKUP_DIR%
echo.
echo Next steps:
echo   1. Restart Claude Code so it picks up the new plugin files.
echo   2. Run /help %PLUGIN_NAME% to verify new commands appear.
echo   3. When done testing, run: tools\dev-unlink.bat %PLUGIN_NAME%
echo.
endlocal
