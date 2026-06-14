@echo off
echo Running git and build diagnostics... > git_debug_log.txt
echo ==================================== >> git_debug_log.txt

echo [1/4] PATH variable: >> git_debug_log.txt
echo %PATH% >> git_debug_log.txt
echo ==================================== >> git_debug_log.txt

echo [2/4] Testing git command: >> git_debug_log.txt
where git >> git_debug_log.txt 2>&1
git status >> git_debug_log.txt 2>&1
echo ==================================== >> git_debug_log.txt

echo [3/4] Trying git stage and commit: >> git_debug_log.txt
git add -A >> git_debug_log.txt 2>&1
git commit -m "feat: TV strip fixes - image layout, overlay, scrollbar, ticker editable, floating buttons hidden, whitespace removed" >> git_debug_log.txt 2>&1
echo ==================================== >> git_debug_log.txt

echo [4/4] Trying git push: >> git_debug_log.txt
git push origin main >> git_debug_log.txt 2>&1
git push origin master >> git_debug_log.txt 2>&1
echo ==================================== >> git_debug_log.txt

echo Diagnostics completed. >> git_debug_log.txt
echo Diagnostics completed. Check git_debug_log.txt in your folder.
pause
