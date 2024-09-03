@echo off

:: Define o diretório atual onde o script está sendo executado
set "projectDir=%~dp0"

:: Define os caminhos relativos das pastas e do script start.bat
set "downloads=%projectDir%downloads"
set "uploads=%projectDir%uploads"
set "startBat=%projectDir%start.bat"

:: Define o caminho da área de trabalho
set "desktop=%USERPROFILE%\Desktop"

:: Cria os atalhos
:: Para downloads
powershell -command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%desktop%\Downloads.lnk'); $sc.TargetPath = '%downloads%'; $sc.Save()"

:: Para uploads
powershell -command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%desktop%\Uploads.lnk'); $sc.TargetPath = '%uploads%'; $sc.Save()"

:: Para start.bat
powershell -command "$ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut('%desktop%\Start.lnk'); $sc.TargetPath = '%startBat%'; $sc.Save()"

echo Atalhos criados na área de trabalho!
pause
