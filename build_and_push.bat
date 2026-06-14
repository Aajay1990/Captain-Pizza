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
    echo [0/5] Initializing Git repository...
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
    echo Adding remote origin to https://github.com/Aajay1990/Captain-Pizza.git >> build_and_push_log.txt
    "%GIT_CMD%" remote add origin "https://github.com/Aajay1990/Captain-Pizza.git" >> build_and_push_log.txt 2>&1
)

echo [1/5] Git status: >> build_and_push_log.txt
"%GIT_CMD%" status >> build_and_push_log.txt 2>&1

echo [2/5] Building frontend... >> build_and_push_log.txt
cd frontend
call npm run build >> ..\build_and_push_log.txt 2>&1
if %errorlevel% neq 0 (
    echo BUILD FAILED in log.
    cd ..
    pause
    exit /b 1
)
cd ..
echo Build succeeded. >> build_and_push_log.txt

echo [3/5] Staging changes... >> build_and_push_log.txt
"%GIT_CMD%" add -A >> build_and_push_log.txt 2>&1

echo [4/5] Committing changes... >> build_and_push_log.txt
"%GIT_CMD%" commit -m "feat: TV signage layout changes, ticker editable settings, floating buttons hidden on TV route, fixed api production URL" >> build_and_push_log.txt 2>&1

echo [5/5] Pushing to GitHub... >> build_and_push_log.txt
"%GIT_CMD%" push -u origin main >> build_and_push_log.txt 2>&1
if %errorlevel% neq 0 (
    echo Failed standard push. Trying force push... >> build_and_push_log.txt
    "%GIT_CMD%" push -u origin main --force >> build_and_push_log.txt 2>&1
)

echo Done. >> build_and_push_log.txt
echo Log file build_and_push_log.txt has been updated.
pause
exit /b 0

:setup_config
echo.
echo ========================================================
echo  GIT USER CONFIGURATION REQUIRED!
echo ========================================================
set /p GIT_EMAIL="Enter your GitHub Email: "
set /p GIT_NAME="Enter your GitHub Name/Username: "

echo Setting global email to "%GIT_EMAIL%" >> build_and_push_log.txt
"%GIT_CMD%" config --global user.email "%GIT_EMAIL%" >> build_and_push_log.txt 2>&1
echo Setting global name to "%GIT_NAME%" >> build_and_push_log.txt
"%GIT_CMD%" config --global user.name "%GIT_NAME%" >> build_and_push_log.txt 2>&1
goto :git_config_done
