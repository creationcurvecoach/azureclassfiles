@ECHO OFF

REM - Get current directory
SET SUBDIR=%~dp0

REM Compile client app and copy output to this folder
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\msbuild %SUBDIR%\Source\DemoClientApp.csproj
COPY %SUBDIR%Source\bin\Debug\DemoClientApp.exe %SUBDIR%DemoClientApp.exe /Y
COPY %SUBDIR%Source\bin\Debug\DemoClientApp.exe.config %SUBDIR%DemoClientApp.exe.config /Y