# 2-qadam: build-manifest.mjs yozgan manifest.json'ni o'qiydi va har bir satrni
# Windows'ning o'zida o'rnatilgan (offline, tarmoqsiz) System.Speech ovoz
# sintezatori bilan alohida WAV faylga yozadi. Bitta PowerShell jarayonida barcha
# satrlarni ketma-ket ishlaydi (har satr uchun alohida process ochishdan ancha tez).
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech

$manifestPath = Join-Path $PSScriptRoot 'out\manifest.json'
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = @{
  david = 'Microsoft David Desktop'
  zira  = 'Microsoft Zira Desktop'
}

$count = 0
foreach ($line in $manifest) {
  $voiceName = $voices[$line.voice]
  if (-not $voiceName) { $voiceName = $voices['zira'] }
  $synth.SelectVoice($voiceName)
  $synth.SetOutputToWaveFile($line.file)
  $synth.Speak($line.text)
  $synth.SetOutputToNull()
  $count++
}
$synth.Dispose()
Write-Output "Sintez qilindi: $count ta satr."
