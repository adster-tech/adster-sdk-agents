@echo off
REM Adster MCP Server Installation Script for Windows
REM This script installs the Adster MCP server for Claude Code integration

echo Installing Adster MCP Server for Claude Code...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Please install Node.js 18 or higher.
    echo Visit: https://nodejs.org/
    exit /b 1
)

echo Node.js detected
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed
    exit /b 1
)

echo npm detected
npm -v

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    exit /b 1
)

REM Build the project
echo.
echo Building MCP server...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed
    exit /b 1
)

echo.
echo Build complete!
echo.
echo Next steps:
echo.
echo 1. Add this MCP server to your Claude Code configuration
echo.
echo    Open your Claude Code settings and add:
echo.
echo    "mcpServers": {
echo      "adster-android-integrator": {
echo        "command": "node",
echo        "args": ["%CD%\dist\index.js"]
echo      }
echo    }
echo.
echo 2. Restart Claude Code
echo.
echo 3. Use the agent with:
echo    @agent-adster-android-integrator integrate Adster SDK into my Android project
echo.
echo Installation complete!
pause
