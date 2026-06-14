@echo off
if exist "c:\Users\lpawa\Downloads\captain pizza\.git" (
    echo Git repository folder (.git) EXISTS. > git_repo_status.txt
) else (
    echo Git repository folder (.git) DOES NOT EXIST. > git_repo_status.txt
)
pause
