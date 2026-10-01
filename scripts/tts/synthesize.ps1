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
# Ikkinchi ayol/erkak spiker (uch kishilik dialoglar uchun): tizimda boshqa
# inglizcha ovoz yo'q, shuning uchun o'sha ovoz boshqa tezlikda ishlatiladi —
# tinglovchi ikki spikerni ajrata olishi uchun.
$variants = @{
  zira2  = @{ base = 'zira';  rate = -2 }
  david2 = @{ base = 'david'; rate = -2 }
}

$count = 0
$skipped = 0
foreach ($line in $manifest) {
  if (Test-Path $line.file) { $skipped++; continue }
  $key = $line.voice
  $rate = 0
  if ($variants.ContainsKey($key)) { $rate = $variants[$key].rate; $key = $variants[$key].base }
  $voiceName = $voices[$key]
  if (-not $voiceName) { $voiceName = $voices['zira'] }
  $synth.SelectVoice($voiceName)
  $synth.Rate = $rate
  $synth.SetOutputToWaveFile($line.file)
  $synth.Speak($line.text)
  $synth.SetOutputToNull()
  $count++
}
$synth.Dispose()
Write-Output "Sintez qilindi: $count ta satr (mavjudligi uchun o'tkazib yuborildi: $skipped)."
