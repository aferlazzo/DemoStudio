$ErrorActionPreference='Stop'
$installer=(Get-ChildItem dist/demoMaker-Setup-*.exe | Select-Object -First 1).FullName
$installDir=Join-Path $env:LOCALAPPDATA 'Programs/demoMaker'
$p=Start-Process $installer -ArgumentList '/S',"/D=$installDir" -PassThru -Wait
if($p.ExitCode -ne 0){throw 'Installer failed'}
$shortcut=Join-Path ([Environment]::GetFolderPath('Desktop')) 'demoMaker.lnk'
$startMenu=Join-Path ([Environment]::GetFolderPath('Programs')) 'demoMaker.lnk'
if(!(Test-Path $shortcut) -or !(Test-Path $startMenu)){throw 'Desktop or Start menu shortcut missing'}
$env:DEMOMAKER_SMOKE_DIR=Join-Path $PWD 'verification'
New-Item -ItemType Directory -Force $env:DEMOMAKER_SMOKE_DIR | Out-Null
$previousPath=$env:PATH
try {
  # The installed app must run with development tools absent from PATH.
  $env:PATH="$env:SystemRoot\System32;$env:SystemRoot"
  $shell=New-Object -ComObject WScript.Shell
  $target=$shell.CreateShortcut($shortcut).TargetPath
  Start-Process $shortcut
  $deadline=(Get-Date).AddMinutes(8)
  do {
    Start-Sleep -Seconds 2
    if(Test-Path "$env:DEMOMAKER_SMOKE_DIR/installed-error.txt"){throw (Get-Content -Raw "$env:DEMOMAKER_SMOKE_DIR/installed-error.txt")}
    if((Get-Date) -gt $deadline){throw 'Installed desktop shortcut test timed out'}
  } until(Test-Path "$env:DEMOMAKER_SMOKE_DIR/installed-report.json")
} finally {$env:PATH=$previousPath;Remove-Item Env:DEMOMAKER_SMOKE_DIR}
Get-Content verification/installed-report.json
# Verify MP4 codecs and dimensions using bundled FFmpeg, never a global binary.
$ffmpeg=Join-Path $installDir 'resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe'
foreach($format in @('standard','reel')){
  $info=(& $ffmpeg -hide_banner -i "verification/$format.mp4" -f null - 2>&1 | Out-String)
  if($LASTEXITCODE -ne 0 -or $info -notmatch 'Video: h264' -or $info -notmatch 'Audio: aac'){throw "Invalid $format codecs"}
  $expected=if($format -eq 'reel'){'1080x1920'}else{'1280x900'}
  if($info -notmatch $expected){throw "Invalid $format dimensions"}
  $info | Set-Content "verification/$format-metadata.txt"
}
$uninstaller=Join-Path $installDir 'Uninstall demoMaker.exe'
if(!(Test-Path $uninstaller)){throw 'Uninstaller missing'}
Start-Process $uninstaller -ArgumentList '/S' -Wait
Start-Sleep -Seconds 5
if(Test-Path $shortcut){throw 'Uninstall left desktop shortcut'}
