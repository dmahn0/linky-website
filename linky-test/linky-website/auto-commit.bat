@echo off
echo Auto-committing changes...
cd /d "C:\Users\USER\linky\linky-platform\linky-test\linky-website"

REM Add all changes
git add -A

REM Get current date and time
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"

set "timestamp=%YYYY%-%MM%-%DD% %HH%:%Min%:%Sec%"

REM Commit with timestamp
git commit -m "Auto commit: %timestamp%"

echo Commit completed!
pause