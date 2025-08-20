@echo off
echo Starting Sportzone Backend...
echo.
echo Make sure PostgreSQL is running and accessible
echo Database: sportzone_db
echo User: postgres
echo Password: postgres
echo.
echo If you need to change these settings, edit config.env file
echo.
pause
npm run start:dev
