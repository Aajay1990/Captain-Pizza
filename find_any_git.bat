@echo off
echo Deep scanning for git.exe... > git_deep_search_log.txt
echo ==================================== >> git_deep_search_log.txt

echo Searching C:\Program Files... >> git_deep_search_log.txt
dir "C:\Program Files\*git.exe" /s /b >> git_deep_search_log.txt 2>nul

echo Searching C:\Program Files (x86)... >> git_deep_search_log.txt
dir "C:\Program Files (x86)\*git.exe" /s /b >> git_deep_search_log.txt 2>nul

echo Searching AppData Local... >> git_deep_search_log.txt
dir "%USERPROFILE%\AppData\Local\*git.exe" /s /b >> git_deep_search_log.txt 2>nul

echo Searching AppData Roaming... >> git_deep_search_log.txt
dir "%USERPROFILE%\AppData\Roaming\*git.exe" /s /b >> git_deep_search_log.txt 2>nul

echo Deep scan completed. >> git_deep_search_log.txt
echo Completed. Check git_deep_search_log.txt.
pause
