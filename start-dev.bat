@echo off
echo Starting development servers...

REM Get the local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :break
)
:break
set IP=%IP:~1%

echo Your local IP address is: %IP%

echo Starting server...
start cmd /k "cd server && npm start"

echo Starting client...
start cmd /k "cd client && npm run dev -- --host"

echo.
echo Access the application from your mobile device at:
echo http://%IP%:5173
echo.
echo Press any key to exit...
pause > nul
