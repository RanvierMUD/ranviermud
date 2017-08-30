@echo off
for /D %%i in (bundles/*) do (
  if exist "%cd%\bundles\%%i\package.json" (
    cd "%cd%\bundles\%%i"
    echo Updating %%i
    call npm install >nul 2>&1
  )
)
