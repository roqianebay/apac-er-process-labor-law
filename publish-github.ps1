$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Gh = "$env:ProgramFiles\GitHub CLI\gh.exe"
if (-not (Test-Path $Gh)) { $Gh = "$env:LocalAppData\Programs\GitHub CLI\gh.exe" }
if (-not (Test-Path $Gh)) { throw "Install GitHub CLI: winget install GitHub.cli" }

Set-Location $Root
& $Gh auth status

$Name = "apac-er-process-labor-law"
$User = & $Gh api user -q .login
Write-Host "GitHub user: $User"

if (-not (Test-Path .git)) {
  git init -b main
  git add .
  git commit -m "Initial APAC ER process and labor law site"
}

if (-not ((git remote) -contains "origin")) {
  & $Gh repo create $Name --public --source=. --remote=origin --description "APAC ER process and labor law (7-market matrix + country playbooks)"
  if ($LASTEXITCODE -ne 0) {
    git remote add origin "https://github.com/$User/$Name.git"
  }
}

git push -u origin main
& $Gh api "repos/$User/$Name/pages" -X POST -f build_type=workflow 2>$null | Out-Null

Write-Host ""
Write-Host "After Deploy GitHub Pages succeeds:"
Write-Host "https://$User.github.io/$Name/"