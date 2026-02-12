# 🚀 Overview Invest - Automated Startup Scripts

## Quick Start

### Option 1: PowerShell (Recommended) ✨
```powershell
.\start_app.ps1
```
**Features:**
- ✅ Colored output
- ✅ Error handling
- ✅ Auto-creates Python venv if missing
- ✅ Checks for existing Redis container
- ✅ Window management

### Option 2: Batch File
```cmd
start_app.bat
```
**Features:**
- ✅ Works on all Windows versions
- ✅ Simple and reliable
- ✅ No PowerShell required

---

## What These Scripts Do

### 1. **start_app.ps1 / start_app.bat**
Automatically starts all 4 required services in the correct order:

1. **Redis** (Docker container)
   - Creates or starts `redis-market` container
   - Port: 6379

2. **Python Market Simulation** (New window)
   - Activates virtual environment
   - Runs `main.py`

3. **Node.js Backend** (New window)
   - Runs `npm run dev`
   - Port: 5000

4. **React Frontend** (New window)
   - Runs `npm run dev`
   - Port: 5173

### 2. **stop_app.ps1**
Cleanly stops all services:
- Stops Redis container
- Closes Python window
- Closes Node.js window
- Closes React window

---

## Prerequisites

### Before First Run:
1. **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop

2. **Python virtual environment** created (PowerShell script creates it automatically)
   ```bash
   cd python-market-sim
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Node.js dependencies** installed
   ```bash
   cd server
   npm install
   
   cd ../client
   npm install
   ```

---

## Usage

### Starting the Application

**PowerShell (Recommended):**
```powershell
# Right-click start_app.ps1 → Run with PowerShell
# Or in PowerShell terminal:
.\start_app.ps1
```

**Batch File:**
```cmd
# Double-click start_app.bat
# Or in CMD:
start_app.bat
```

### What You'll See:
```
===============================================
   OVERVIEW INVEST - TRADING PLATFORM
===============================================

[1/4] Starting Redis Server...
✅ Redis: STARTED

[2/4] Starting Python Market Simulation...
✅ Python Service: STARTED (new window)

[3/4] Starting Node.js Backend...
✅ Node.js Backend: STARTED (new window)

[4/4] Starting React Frontend...
✅ React Frontend: STARTED (new window)

===============================================
   ALL SERVICES STARTED SUCCESSFULLY!
===============================================
```

### Accessing the Application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Redis:** localhost:6379

---

## Stopping the Application

### Method 1: PowerShell Stop Script
```powershell
.\stop_app.ps1
```
This will:
- Stop Redis container
- Close all service windows
- Clean shutdown

### Method 2: Manual
1. Close the 3 PowerShell/CMD windows (Python, Node, React)
2. Stop Redis:
   ```bash
   docker stop redis-market
   ```

---

## Troubleshooting

### "Docker not found"
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- Make sure Docker Desktop is running (check system tray)

### "Redis container already exists"
- The script will automatically start the existing container
- To remove and recreate:
  ```bash
  docker rm -f redis-market
  .\start_app.ps1
  ```

### "Python venv not found"
- PowerShell script creates it automatically
- Or create manually:
  ```bash
cd python-market-sim
  python -m venv venv
  ```

### "Port already in use"
- Check if services are already running
- Stop them first with `stop_app.ps1`
- Or change ports in `.env` files

### "Permission denied" (PowerShell)
- Run PowerShell as Administrator
- Or enable script execution:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## Manual Startup (Without Scripts)

If you prefer to start services manually:

### Terminal 1: Redis
```bash
docker run -d -p 6379:6379 --name redis-market redis:latest
```

### Terminal 2: Python
```bash
cd "c:\Overview Invest V5\TradingApp\python-market-sim"
venv\Scripts\activate
python main.py
```

### Terminal 3: Node.js
```bash
cd "c:\Overview Invest V5\TradingApp\server"
npm run dev
```

### Terminal 4: React
```bash
cd "c:\Overview Invest V5\TradingApp\client"
npm run dev
```

---

## Features of Automation Scripts

### ✅ Error Detection
- Checks if Docker is running
- Validates Redis container status
- Handles existing containers gracefully

### ✅ Proper Startup Sequence
- Waits for each service to initialize
- Starts services in correct dependency order
- Prevents race conditions

### ✅ Visual Feedback
- Colored output (PowerShell)
- Progress indicators
- Success/error messages
- Clear instructions

### ✅ Window Management
- Each service in separate window
- Named windows for easy identification
- `/k` flag keeps windows open after errors

---

## File Structure

```
TradingApp/
├── start_app.ps1        # PowerShell startup script (recommended)
├── start_app.bat        # Batch startup script
├── stop_app.ps1         # PowerShell stop script
├── START_SCRIPTS.md     # This file
├── python-market-sim/   # Python service
├── server/              # Node.js backend
└── client/              # React frontend
```

---

## Tips

### Development Mode
- Use `start_app.ps1` for colored output and better experience
- Keep all windows visible to monitor logs

### Production Mode
- Don't use these scripts in production
- See deployment documentation for proper setup

### Debugging
- Check each window for error messages
- Python window shows market simulation logs
- Node.js window shows API requests
- React window shows compilation status

---

## Next Steps

After starting the application:

1. **Wait for all services to initialize** (~10-15 seconds)
2. **Open browser** to http://localhost:5173
3. **Login or register** a new account
4. **Start trading!**

### First-Time Setup:
1. Create admin account:
   ```bash
   cd server
   node create_admin.js
   ```

2. Access admin panel: http://localhost:5173/admin
   - Password: `admin123`

---

##  Additional Scripts

You can create your own scripts for specific tasks:

### Restart Script:
```powershell
.\stop_app.ps1
Start-Sleep -Seconds 2
.\start_app.ps1
```

### Development Script (without Redis):
```powershell
# For frontend-only development
cd client
npm run dev
```

---

## Support

If you encounter issues:
1. Check all windows for error messages
2. Verify prerequisites are installed
3. Try manual startup to isolate the problem
4. Check the troubleshooting section above

---

**Ready to trade? Run `.\start_app.ps1` and let's go! 🚀**
