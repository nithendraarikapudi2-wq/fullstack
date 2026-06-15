Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Coordinated Knowledge Portal System Ecosystem..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Define ports
$GATEWAY_PORT = 8000
$SPRING_PORT = 8010
$NODE_PORT = 8020
$FRONTEND_PORT = 8005

Write-Host "1. Starting Spring Boot Backend (Port $SPRING_PORT)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

Write-Host "2. Starting Node.js Comments Backend (Port $NODE_PORT)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd node-backend; npm start" -WindowStyle Normal

Write-Host "3. Starting FastAPI API Gateway (Port $GATEWAY_PORT)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd gateway; uvicorn main:app --host 127.0.0.1 --port $GATEWAY_PORT" -WindowStyle Normal

Write-Host "4. Starting React Frontend (Port $FRONTEND_PORT)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev" -WindowStyle Normal

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "All components launched! Open: http://localhost:$FRONTEND_PORT" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
