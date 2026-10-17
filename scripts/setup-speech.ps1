$ErrorActionPreference='Stop'
$studioRoot=Split-Path $PSScriptRoot -Parent
$localRoot=Join-Path $studioRoot '.local'
New-Item -ItemType Directory -Force $localRoot | Out-Null
$speechPython=$env:DEMOSTUDIO_PYTHON
if(-not $speechPython -and (Test-Path (Join-Path $localRoot 'speech.json'))){$speechPython=(Get-Content -Raw (Join-Path $localRoot 'speech.json') | ConvertFrom-Json).python}
if(-not $speechPython){
  $bundledPython=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
  if(Test-Path $bundledPython){$speechPython=$bundledPython}
  elseif(Get-Command py -ErrorAction SilentlyContinue){$speechPython=(& py -3 -c 'import sys;print(sys.executable)')}
  elseif(Get-Command python -ErrorAction SilentlyContinue){$speechPython=(Get-Command python).Source}
}
if(-not $speechPython){throw 'Python 3.10–3.12 is required for local narration. Install Python from python.org, then run Setup Narration.cmd again.'}
& $speechPython -c 'import sys;assert (3,10)<=sys.version_info[:2]<=(3,12), "Use Python 3.10, 3.11 or 3.12"'
if($LASTEXITCODE -ne 0){throw 'A compatible Python runtime was not found.'}
$packages=Join-Path $localRoot 'piper-packages'
& $speechPython -m pip install --upgrade --target $packages piper-tts==1.8.0
if($LASTEXITCODE -ne 0){throw 'Piper installation failed. Check your internet connection.'}
$models=Join-Path $localRoot 'piper-voices'
New-Item -ItemType Directory -Force $models | Out-Null
$previousPythonPath=$env:PYTHONPATH
try{
  $env:PYTHONPATH=$packages
  & $speechPython -m piper.download_voices en_US-ljspeech-high --download-dir $models
  if($LASTEXITCODE -ne 0){throw 'Piper voice download failed. Check your internet connection and retry setup.'}
}finally{$env:PYTHONPATH=$previousPythonPath}
@{engine='piper';python=$speechPython;packages=$packages} | ConvertTo-Json | Set-Content (Join-Path $localRoot 'speech.json') -Encoding utf8
Write-Output 'Free local Piper narration is ready.'
