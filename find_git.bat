@echo off
echo Searching for Git installation... > git_search_log.txt
echo ==================================== >> git_search_log.txt

set "git_paths="
set "git_paths=%git_paths%;C:\Program Files\Git\cmd\git.exe"
set "git_paths=%git_paths%;C:\Program Files (x86)\Git\cmd\git.exe"
set "git_paths=%git_paths%;%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe"
set "git_paths=%git_paths%;C:\Git\cmd\git.exe"

set "found_git="

for %%G in (
    "C:\Program Files\Git\cmd\git.exe"
    "C:\Program Files (x86)\Git\cmd\git.exe"
    "%USERPROFILE%\AppData\Local\Programs\Git\cmd\git.exe"
    "C:\Git\cmd\git.exe"
) do (
    echo Checking: %%~G >> git_search_log.txt
    if exist %%G (
        echo FOUND: %%~G >> git_search_log.txt
        set "found_git=%%~G"
        goto :found
    )
)

echo Git was NOT found in common locations. >> git_search_log.txt
goto :end

:found
echo Successfully located Git: "%found_git%" >> git_search_log.txt
echo Attempting git status using located Git... >> git_search_log.txt
"%found_git%" status >> git_search_log.txt 2>&1

:end
echo Search completed. >> git_search_log.txt
echo Search completed. Check git_search_log.txt.
pause
