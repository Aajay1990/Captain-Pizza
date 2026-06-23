@echo off
echo Running build and push process... > build_and_push_log.txt
echo ==================================== >> build_and_push_log.txt

cd /d "c:\Users\lpawa\Downloads\captain pizza"

:: Check if git is available in standard path
where git >nul 2>&1
if %errorlevel% equ 0 (
    set "GIT_CMD=git"
    echo Using system git. >> build_and_push_log.txt
    goto :git_ready
)

:: If not in path, search common installation paths
echo Searching common Git paths... >> build_and_push_log.txt
if exist "C:\Program Files\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files\Git\cmd\git.exe"
    echo Found git at C:\Program Files\Git\cmd\git.exe >> build_and_push_log.txt
    goto :git_ready
)
if exist "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe" (
    set "GIT_CMD=%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe"
    echo Found git at AppData Local >> build_and_push_log.txt
    goto :git_ready
)
if exist "C:\Program Files (x86)\Git\cmd\git.exe" (
    set "GIT_CMD=C:\Program Files (x86)\Git\cmd\git.exe"
    echo Found git at Program Files (x86) >> build_and_push_log.txt
    goto :git_ready
)

echo ERROR: Git is not installed or could not be found! >> build_and_push_log.txt
echo Please download and install Git: https://git-scm.com/download/win
pause
exit /b 1

:git_ready
echo. >> build_and_push_log.txt

:: Initialize Git if .git folder doesn't exist
if not exist ".git" (
    echo [0/6] Initializing Git repository...
    echo Git repository is not initialized. Initializing now... >> build_and_push_log.txt
    "%GIT_CMD%" init >> build_and_push_log.txt 2>&1
    "%GIT_CMD%" branch -M main >> build_and_push_log.txt 2>&1
)

:: Check Git configuration (username/email)
set "CHECK_NAME="
set "CHECK_EMAIL="
for /f "tokens=*" %%i in ('"%GIT_CMD%" config user.name') do set "CHECK_NAME=%%i"
for /f "tokens=*" %%i in ('"%GIT_CMD%" config user.email') do set "CHECK_EMAIL=%%i"

if "%CHECK_NAME%"=="" goto :setup_config
if "%CHECK_EMAIL%"=="" goto :setup_config

:git_config_done

:: Get or set remote origin
"%GIT_CMD%" remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding remote origin... >> build_and_push_log.txt
    "%GIT_CMD%" remote add origin "https://github.com/Aajay1990/Captain-Pizza.git" >> build_and_push_log.txt 2>&1
)

:: Remove nested .git folders that cause submodule issues
if exist "backend\.git" (
    echo Removing nested backend\.git... >> build_and_push_log.txt
    rmdir /s /q "backend\.git" >> build_and_push_log.txt 2>&1
    "%GIT_CMD%" rm --cached -f backend >> build_and_push_log.txt 2>&1
)
if exist "frontend\.git" (
    echo Removing nested frontend\.git... >> build_and_push_log.txt
    rmdir /s /q "frontend\.git" >> build_and_push_log.txt 2>&1
    "%GIT_CMD%" rm --cached -f frontend >> build_and_push_log.txt 2>&1
)

echo [1/6] Git status: >> build_and_push_log.txt
"%GIT_CMD%" status >> build_and_push_log.txt 2>&1

:: Ask about npm install
echo.
set "INSTALL_CHOICE=n"
set /p INSTALL_CHOICE="Run 'npm install' for backend and frontend? (y/n, default: n): "
if /i "%INSTALL_CHOICE%"=="y" (
    echo [1.5/6] Installing backend dependencies... >> build_and_push_log.txt
    echo Installing backend dependencies...
    cd backend
    call npm install >> ..\build_and_push_log.txt 2>&1
    cd ..

    echo [1.6/6] Installing frontend dependencies... >> build_and_push_log.txt
    echo Installing frontend dependencies...
    cd frontend
    call npm install >> ..\build_and_push_log.txt 2>&1
    cd ..
)

echo [2/6] Building frontend... >> build_and_push_log.txt
echo Building frontend...
cd frontend
call npm run build >> ..\build_and_push_log.txt 2>&1
if %errorlevel% neq 0 (
    echo BUILD FAILED — check build_and_push_log.txt
    cd ..
    pause
    exit /b 1
)
cd ..
echo Build succeeded. >> build_and_push_log.txt

echo [2.5/6] Updating root dist folder... >> build_and_push_log.txt
echo Updating root dist folder...
if exist "dist" (
    rmdir /s /q "dist" >> build_and_push_log.txt 2>&1
)
xcopy /e /i /y "frontend\dist" "dist" >> build_and_push_log.txt 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Failed to copy dist >> build_and_push_log.txt
) else (
    echo Root dist folder updated. >> build_and_push_log.txt
)

echo.
echo ========================================================
echo  ENTER COMMIT MESSAGE
echo ========================================================
set "COMMIT_MSG="
set /p COMMIT_MSG="Enter commit message (or press Enter for default): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Update backend and frontend dist folder
)

echo [3/6] Staging backend + frontend + dist... >> build_and_push_log.txt
"%GIT_CMD%" add backend/ >> build_and_push_log.txt 2>&1
"%GIT_CMD%" add frontend/ >> build_and_push_log.txt 2>&1
"%GIT_CMD%" add dist/ >> build_and_push_log.txt 2>&1
"%GIT_CMD%" add -A >> build_and_push_log.txt 2>&1
echo Staging complete. >> build_and_push_log.txt

echo [4/6] Committing... >> build_and_push_log.txt
"%GIT_CMD%" commit -m "%COMMIT_MSG%" >> build_and_push_log.txt 2>&1

echo [5/6] Pushing to GitHub... >> build_and_push_log.txt
"%GIT_CMD%" push -u origin main >> build_and_push_log.txt 2>&1
if %errorlevel% neq 0 (
    echo Standard push failed. Trying force push... >> build_and_push_log.txt
    "%GIT_CMD%" push -u origin main --force >> build_and_push_log.txt 2>&1
)

echo [6/6] Done! >> build_and_push_log.txt
echo.
echo ========================================================
echo  PUSH COMPLETE — check build_and_push_log.txt for details
echo ========================================================
pause
exit /b 0

:setup_config
echo.
echo ========================================================
echo  GIT USER CONFIGURATION REQUIRED!
echo ========================================================
set /p GIT_EMAIL="Enter your GitHub Email: "
set /p GIT_NAME="Enter your GitHub Name/Username: "

"%GIT_CMD%" config --global user.email "%GIT_EMAIL%" >> build_and_push_log.txt 2>&1
"%GIT_CMD%" config --global user.name "%GIT_NAME%" >> build_and_push_log.txt 2>&1
goto :git_config_done
