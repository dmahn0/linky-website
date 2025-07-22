# PowerShell script for auto-committing changes
Set-Location "C:\Users\USER\linky\linky-platform\linky-test\linky-website"

# Function to commit changes
function Commit-Changes {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    # Check if there are changes
    $status = git status --porcelain
    if ($status) {
        Write-Host "Changes detected. Committing..." -ForegroundColor Green
        git add -A
        git commit -m "Auto commit: $timestamp"
        Write-Host "Commit completed!" -ForegroundColor Green
    } else {
        Write-Host "No changes to commit." -ForegroundColor Yellow
    }
}

# Watch for file changes (optional - for continuous monitoring)
if ($args[0] -eq "-watch") {
    Write-Host "Watching for changes... Press Ctrl+C to stop." -ForegroundColor Cyan
    while ($true) {
        Commit-Changes
        Start-Sleep -Seconds 60  # Check every minute
    }
} else {
    # Single commit
    Commit-Changes
}