# Start both Frontend and Backend
Write-Host "Starting Smart City Backend (Spring Boot :8085)..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\gradlew.bat bootRun"

Start-Sleep -Seconds 3

Write-Host "Starting Smart City Frontend (Next.js :3000)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Both Frontend (http://localhost:3000) and Backend (http://localhost:8085) are launching!" -ForegroundColor Yellow
