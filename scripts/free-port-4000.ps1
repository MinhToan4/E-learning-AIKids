# Free TCP port 4000 + stop API node holding Prisma query engine (fixes EPERM on generate).
$ErrorActionPreference = 'SilentlyContinue'
$pids = @()
try {
  $pids = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique
} catch {}
foreach ($procId in $pids) {
  if ($procId -and $procId -ne 0) {
    Write-Host "Stopping PID $procId on :4000"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
}
# Also stop tsx watch / api from this monorepo
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
  $cmd = $_.CommandLine
  if ($cmd -and ($cmd -match 'E-learning-AIKids-full' -and ($cmd -match 'tsx|src/index|@aikids/api'))) {
    Write-Host "Stopping node $($_.ProcessId) (API lock)"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 1
Write-Host "Port 4000 / Prisma lock check done."
