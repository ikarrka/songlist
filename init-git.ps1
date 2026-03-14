# Run from project folder: .\init-git.ps1
# Requires Git installed and in PATH

Set-Location $PSScriptRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git not found. Install Git from https://git-scm.com/ or add it to PATH." -ForegroundColor Red
    exit 1
}

if (Test-Path .git) {
    Write-Host "Git repo already initialized." -ForegroundColor Yellow
} else {
    git init
    Write-Host "Git initialized." -ForegroundColor Green
}

git add .
git status
git commit -m "Initial commit: songlist with light/dark theme"
Write-Host "`nNext: create empty repo on GitHub, then run:" -ForegroundColor Cyan
Write-Host '  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git' -ForegroundColor White
Write-Host '  git branch -M main' -ForegroundColor White
Write-Host '  git push -u origin main' -ForegroundColor White
