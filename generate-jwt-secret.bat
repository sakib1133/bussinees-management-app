@echo off
REM Generate a strong JWT secret for production
REM Usage: generate-jwt-secret.bat

echo.
echo Generating strong JWT secret for production...
echo.

REM Using PowerShell to generate a random string
for /f "tokens=*" %%i in ('powershell -Command "[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))"') do set SECRET=%%i

echo ===============================================================
echo Generated JWT Secret (32 bytes, base64 encoded):
echo ===============================================================
echo.
echo %SECRET%
echo.
echo ===============================================================
echo.
echo Steps to use this secret:
echo.
echo 1. Go to Render Dashboard
echo 2. Select your Backend service
echo 3. Go to Environment tab
echo 4. Add/Update variable: JWT_SECRET
echo 5. Paste the secret above
echo 6. Click Save
echo 7. Service will automatically redeploy
echo.
echo Important:
echo   - Never commit this secret to Git
echo   - Never share this secret publicly
echo   - Keep this secret safe and secure
echo.
pause
