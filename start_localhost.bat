@echo off
echo ===================================================
echo             Captain Pizza Local Servers
echo ===================================================
echo.

:: Set PATH to explicitly include Node.js directories
set "NODE_PATH=C:\Program Files\nodejs;%USERPROFILE%\AppData\Roaming\npm"
set "PATH=%NODE_PATH%;%PATH%"

echo Starting Backend Server (on Port 5000)...
start "Captain Pizza - Backend" cmd /k "set \"PATH=%NODE_PATH%;%%PATH%%\" && cd backend && npm run dev"

echo Starting Frontend Server (on Port 8080)...
start "Captain Pizza - Frontend" cmd /k "set \"PATH=%NODE_PATH%;%%PATH%%\" && cd frontend && npm run dev"
echo.
echo ===================================================
echo Backend API:  http://localhost:5000
echo Frontend App: http://127.0.0.1:8080
echo ===================================================
echo.
echo Note: If "npm" is still not recognized, please open a fresh
echo Command Prompt from your Windows Start Menu and run:
echo   cd "c:\Users\lpawa\Downloads\captain pizza\backend"
echo   npm run dev
echo.
pause
