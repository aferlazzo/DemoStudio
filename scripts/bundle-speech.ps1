$ErrorActionPreference='Stop'
$local=Join-Path (Split-Path $PSScriptRoot -Parent) '.local'
New-Item -ItemType Directory -Force "$local/python","$local/piper-packages","$local/piper-voices" | Out-Null
Invoke-WebRequest 'https://www.python.org/ftp/python/3.12.10/python-3.12.10-embed-amd64.zip' -OutFile "$local/python.zip"
Expand-Archive "$local/python.zip" "$local/python" -Force
Remove-Item "$local/python.zip"
# Embedded Python ignores environment paths; explicitly enable the bundled packages.
@('python312.zip','.','../piper-packages','import site') | Set-Content "$local/python/python312._pth" -Encoding ascii
python -m pip install --target "$local/piper-packages" piper-tts==1.8.0
if($LASTEXITCODE -ne 0){throw 'Piper dependencies failed to install'}
& "$local/python/python.exe" -m piper.download_voices en_US-ljspeech-high --download-dir "$local/piper-voices"
if($LASTEXITCODE -ne 0){throw 'Piper voice download failed'}
@{engine='piper';python='python/python.exe';packages='piper-packages'} | ConvertTo-Json | Set-Content "$local/speech.json" -Encoding utf8
Invoke-WebRequest 'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high/MODEL_CARD' -OutFile "$local/piper-voices/MODEL_CARD"

# App-local Microsoft runtime DLLs avoid relying on a developer VC runtime installation.
foreach($dll in @('vcruntime140.dll','vcruntime140_1.dll','msvcp140.dll')){
  $file=Join-Path $env:SystemRoot "System32/$dll"
  if(!(Test-Path $file)){throw "Missing required redistributable $dll"}
  Copy-Item $file "$local/python/$dll" -Force
}
