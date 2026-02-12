# 🚀 Quick Start - Overview Invest Trading Platform

## ✅ **ONE-CLICK STARTUP**

### **To Start Everything:**
```cmd
START_ALL.bat
```
Double-click or run from CMD. This will:
1. ✅ Start Redis in Docker
2. ✅ Start Python Market Simulation (new window)
3. ✅ Start Node.js Backend (new window)  
4. ✅ Start React Frontend (new window)

**Then open:** http://localhost:5173

---

## ⏹️ **ONE-CLICK SHUTDOWN**

### **To Stop Everything:**
```cmd
STOP_ALL.bat
```
This will:
1. ✅ Stop Redis container
2. ✅ Close Python window
3. ✅ Close Node.js window
4. ✅ Close React window

---

## 📋 **Prerequisites**

Before first run, make sure:
- ✅ Docker Desktop is installed and **running**
- ✅ Python dependencies installed in `python-market-sim/venv/`
- ✅ Node.js dependencies installed in `server/` and `client/`

### **One-Time Setup:**

**Python:**
```cmd
cd python-market-sim
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Node.js:**
```cmd
cd server
npm install

cd ..\client
npm install
```

---

## 🧹 **CLEANUP PRICE HISTORY**

To reset all price history and start fresh:
```cmd
cd server
node cleanup_price_history.js
```

---

## 📊 **What Each Service Does**

| Service | Port | Purpose |
|---------|------|---------|
| **Redis** | 6379 | Message broker for real-time data |
| **Python** | - | Generates stock prices using GBM algorithm |
| **Node.js** | 5000 | API server + WebSocket for live updates |
| **React** | 5173 | Frontend UI |

---

## 🎯 **Daily Usage**

### **Every Day:**
1. Start Docker Desktop
2. Run `START_ALL.bat`
3. Open http://localhost:5173
4. Start trading!

### **When Done:**
1. Run `STOP_ALL.bat`
2. (Docker will keep running - that's fine)

---

## 🆘 **Troubleshooting**

### **"Docker is not running"**
- Start Docker Desktop
- Wait for it to fully initialize
- Run `START_ALL.bat` again

### **"Port already in use"**
- Run `STOP_ALL.bat` first
- Then `START_ALL.bat`

### **Python dependencies missing**
- Run the one-time setup commands above
- The script will create venv automatically

### **npm not found**
- Install Node.js from: https://nodejs.org
- Restart your terminal

---

## 📁 **File Structure**

```
TradingApp/
│
├── START_ALL.bat          ← Run this to start!
├── STOP_ALL.bat           ← Run this to stop
├── QUICK_START.md         ← This file
│
├── python-market-sim/     ← Price simulation service
├── server/                ← Node.js API backend
└── client/                ← React frontend
```

---

## 🎉 **You're Ready!**

Just run:
```cmd
START_ALL.bat
```

**Happy Trading! 📈**
