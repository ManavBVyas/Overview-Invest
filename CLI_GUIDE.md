# 🎛️ Overview Invest - Service Manager CLI

## Firebase-Style Interactive Command Panel

A professional CLI tool to manage all your trading platform services from one place!

---

## ⚡ Quick Start

### **Launch the CLI:**
```cmd
overview-cli.bat
```

Or directly:
```cmd
node cli.js
```

---

## 📋 Features

### **Service Management:**
- ✅ Start/Stop all services with one command
- ✅ Start/Stop individual services
- ✅ View real-time service status
- ✅ Restart all services
- ✅ Color-coded output

### **Database Tools:**
- ✅ Run database migrations
- ✅ Cleanup price history
- ✅ View logs

### **Services Managed:**
1. **Redis** (Port: 6379) - Database cache
2. **Python Market Sim** - Price generation
3. **Node.js Backend** (Port: 5000) - API server
4. **React Frontend** (Port: 5173) - Web UI

---

## 🎮 Commands

### **Main Menu Options:**

| Key | Command | Description |
|-----|---------|-------------|
| `1` | Start All | Starts all 4 services in sequence |
| `2` | Stop All | Stops all running services |
| `3` | Start Redis | Start Redis only |
| `4` | Start Python | Start Python Market Sim only |
| `5` | Start Node.js | Start backend server only |
| `6` | Start React | Start frontend only |
| `7` | Stop Redis | Stop Redis only |
| `8` | Stop Python | Stop Python only |
| `9` | Stop Node.js | Stop backend only |
| `10` | Stop React | Stop frontend only |
| `r` | Restart All | Stop then start all services |
| `d` | Run Migration | Execute database migrations |
| `c` | Cleanup History | Clear old price data |
| `l` | View Logs | Show service logs |
| `q` | Quit | Exit CLI (stops all services) |

---

## 🎨 Visual Features

### **Color-Coded Output:**
- 🟢 **Green**: Success messages, running services
- 🔴 **Red**: Errors, stopped services
- 🟡 **Yellow**: Warnings, in-progress actions
- 🔵 **Blue**: Python service logs
- 🟦 **Cyan**: React service logs

### **Service Status Display:**
```
📊 SERVICE STATUS:

  ● RUNNING   Redis (Database)          Port: 6379
  ● RUNNING   Python Market Sim         Port: N/A
  ● RUNNING   Node.js Backend           Port: 5000
  ○ STOPPED   React Frontend            Port: 5173
```

---

## 📖 Usage Examples

### **Example 1: Fresh Start**
```
> 1  (Start All Services)
⏳ Starting Redis...
✅ Redis started on port 6379
⏳ Starting Python Market Sim...
✅ Python Market Sim started
⏳ Starting Node.js Backend...
✅ Node.js Backend started on port 5000
⏳ Starting React Frontend...
✅ React Frontend started on port 5173
✨ All services started!
```

### **Example 2: Restart After Code Changes**
```
> r  (Restart All)
🛑 Stopping all services...
✅ All services stopped

🚀 Starting all services...
✨ All services started!
```

### **Example 3: Start Only Backend**
```
> 3  (Start Redis)
> 5  (Start Node.js)
```

---

## 🔧 Advanced Features

### **Automatic Process Management:**
- Each service runs in a child process
- Logs are captured and displayed in real-time
- Services are properly killed on exit
- Handles Ctrl+C gracefully

### **Error Handling:**
- Detects if service is already running
- Handles Docker container states
- Shows meaningful error messages
- Auto-recovery on failures

---

## 🚨 Important Notes

### **Before First Use:**
1. Make sure Docker Desktop is installed
2. Python virtual environment must exist (`python-market-sim/venv/`)
3. Node dependencies installed in `server/` and `client/`

### **Port Conflicts:**
If services fail to start, check if ports are in use:
- Redis: 6379
- Node.js: 5000
- React: 5173

### **Windows Compatibility:**
- Uses `cmd.exe` shell
- Paths are Windows-compatible
- Docker commands work with Docker Desktop

---

## 🎯 Tips & Tricks

### **1. Start in Order:**
For manual start, follow this sequence:
```
3 → 4 → 5 → 6
(Redis → Python → Node → React)
```

### **2. Quick Development Restart:**
After editing code:
```
9 (Stop Node)
5 (Start Node)
```

### **3. Database Reset:**
```
c (Cleanup History)
d (Run Migration)
```

### **4. View All Logs:**
```
l (View Logs)
```
All service logs display in the terminal

---

## 🐛 Troubleshooting

### **"Redis failed to start"**
- Ensure Docker Desktop is running
- Check if port 6379 is available
- Try: `docker ps` to see containers

### **"Python venv not found"**
```cmd
cd python-market-sim
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### **"Node modules missing"**
```cmd
cd server
npm install

cd ../client
npm install
```

### **Services won't stop**
- Press `q` to quit CLI
- Or use Windows Task Manager
- Kill `node.exe` and `python.exe` processes

---

## 📦 What Gets Installed/Started

### **Docker Containers:**
- `redis-market` - Redis server (auto-created if missing)

### **Node.js Processes:**
- `node index.js` (Backend API)
- `npm run dev` (React dev server)
- `python main.py` (Market simulator)

---

## 🎨 Customization

### **Change Colors:**
Edit `cli.js` and modify the `colors` object:
```javascript
const colors = {
    green: '\x1b[32m',  // Success
    red: '\x1b[31m',    // Errors
    // etc...
};
```

### **Add New Commands:**
1. Add menu option in `printMenu()`
2. Add case in `promptUser()` switch statement
3. Implement the function

---

## 🚀 Pro Mode

### **Run from Anywhere:**
Add to system PATH:
```
1. Right-click "This PC" → Properties
2. Advanced System Settings → Environment Variables
3. Add: C:\Overview Invest V5\TradingApp
4. Now run `overview-cli` from any directory!
```

---

## ✅ Success Indicators

When everything is working:
- All services show `● RUNNING`
- No error messages in red
- Web UI accessible at http://localhost:5173
- API responding at http://localhost:5000

---

## 📞 Quick Reference Card

```
START ALL    : 1
STOP ALL     : 2
RESTART      : r
QUIT         : q

INDIVIDUAL:
Redis  : 3/7
Python : 4/8
Node   : 5/9
React  : 6/10

TOOLS:
Migration: d
Cleanup  : c
Logs     : l
```

---

**🎉 You now have a professional Firebase-style CLI for your trading platform!**

Just run: `overview-cli.bat`
