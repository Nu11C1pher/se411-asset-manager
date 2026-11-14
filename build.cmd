@echo off
cd /d "%~dp0"

call npm.cmd ci

if errorlevel 1 exit /b 1

call npm.cmd test
if errorlevel 1 exit /b 1
call npm.cmd run build

if errorlevel 1 exit /b 1

pushd backend

call mvnw.cmd clean verify

set result=%errorlevel%

popd

exit /b %result%

