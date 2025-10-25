# 🤖 KLH Buddy Chatbot Setup Script
# This script helps you set up the multi-provider AI chatbot for your Smart Campus platform

Write-Host "🤖 KLH Buddy Chatbot Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeVersion = & node -v 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = & npm -v 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not available!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm detected: $npmVersion" -ForegroundColor Green
Write-Host ""

# Function to install dependencies
function Install-Dependencies {
    param([string]$path, [string]$name)

    Write-Host "📦 Installing $name dependencies..." -ForegroundColor Yellow
    Push-Location $path

    if (Test-Path "package.json") {
        & npm install --no-audit --no-fund
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $name dependencies installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install $name dependencies!" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  No package.json found in $path" -ForegroundColor Yellow
    }

    Pop-Location
}

# Install server dependencies
Install-Dependencies -path "server" -name "Backend"

# Install client dependencies
Install-Dependencies -path "client" -name "Frontend"

Write-Host ""
Write-Host "🔧 Environment Setup" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

# Check if .env files exist
$serverEnv = "server\.env"
$clientEnv = "client\.env"

if (-not (Test-Path $serverEnv)) {
    Write-Host "📝 Creating server/.env file..." -ForegroundColor Yellow
    $envContent = @"
# Smart Campus Backend Environment Variables
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your-mongodb-atlas-connection-string-here
JWT_SECRET=your-jwt-secret-here

# AI Chatbot Configuration (Choose ONE provider)
# OpenAI GPT (Recommended)
OPENAI_API_KEY=sk-your-openai-api-key-here

# OR Google Gemini (Free tier available)
# GEMINI_API_KEY=your-gemini-api-key-here

# OR Claude by Anthropic
# ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here

# OR HuggingFace (Free)
# HUGGINGFACE_API_KEY=hf_your-huggingface-token-here
"@

    $envContent | Out-File -FilePath $serverEnv -Encoding UTF8
    Write-Host "✅ Created server/.env file" -ForegroundColor Green
    Write-Host "   Please edit server/.env and add your MongoDB URI and choose one AI provider" -ForegroundColor Yellow
} else {
    Write-Host "✅ server/.env already exists" -ForegroundColor Green
}

if (-not (Test-Path $clientEnv)) {
    Write-Host "📝 Creating client/.env file..." -ForegroundColor Yellow
    $clientEnvContent = @"
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000
"@

    $clientEnvContent | Out-File -FilePath $clientEnv -Encoding UTF8
    Write-Host "✅ Created client/.env file" -ForegroundColor Green
} else {
    Write-Host "✅ client/.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Getting Started" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit server/.env file and add your MongoDB connection string" -ForegroundColor Yellow
Write-Host "2. Choose and configure ONE AI provider in server/.env" -ForegroundColor Yellow
Write-Host "3. Generate a JWT secret (optional): node -e `"console.log(require('crypto').randomBytes(48).toString('hex'))`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Start the backend:" -ForegroundColor Green
Write-Host "   cd server" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "5. Start the frontend (in a new terminal):" -ForegroundColor Green
Write-Host "   cd client" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "6. Open http://localhost:5173 and test the chatbot!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed setup instructions, see CHATBOT_README.md" -ForegroundColor Cyan
Write-Host ""

# Show available AI providers
Write-Host "🎯 AI Provider Options:" -ForegroundColor Cyan
Write-Host "1. OpenAI GPT (Recommended) - platform.openai.com" -ForegroundColor White
Write-Host "2. Google Gemini (Free) - makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "3. Claude by Anthropic - console.anthropic.com" -ForegroundColor White
Write-Host "4. HuggingFace (Free) - huggingface.co" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Start with OpenAI or Gemini for the best experience!" -ForegroundColor Yellow
