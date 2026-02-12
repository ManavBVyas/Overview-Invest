# 🏥 Overview Invest - Health Check System

## Comprehensive System Testing & Diagnostics

A professional health check system that validates all components of your trading platform!

---

## 🚀 Quick Start

### **Run Health Check:**
```cmd
health-check.bat
```

Or directly:
```cmd
node health-check.js
```

---

## ✅ What Gets Tested

### **1. Infrastructure Services**
- ✅ Docker availability and status
- ✅ Redis container running
- ✅ Port availability (5000, 5173, 6379)

### **2. Backend Services**
- ✅ Node.js API responding
- ✅ WebSocket server accessible
- ✅ Database connection working
- ✅ Stock data accessible

### **3. Frontend**
- ✅ React dev server running
- ✅ Frontend accessible on port 5173

### **4. Authentication**
- ✅ Login endpoint configured
- ✅ Auth protection working
- ✅ JWT validation

### **5. Features**
- ✅ Quick Trade endpoints
- ✅ Admin panel access
- ✅ Analytics APIs

### **6. Python Service**
- ✅ Python process running
- ✅ Market simulation active

---

## 📊 Sample Output

```
╔════════════════════════════════════════════════════════════════════╗
║                  OVERVIEW INVEST - HEALTH CHECK                    ║
╚════════════════════════════════════════════════════════════════════╝

Running comprehensive system health check...

🐳 Testing Docker...
✓ Docker is installed
✓ Docker daemon is running

🔵 Testing Redis...
✓ Redis container is running
  → Up 2 hours

⚙️  Testing Backend API...
✓ Backend API responding
  → Status: 200
✓ WebSocket server accessible

🗄️  Testing Database Connection...
✓ Database connection working
  → Found 8 stocks

🌐 Testing Frontend...
✓ React frontend is running
  → Accessible on port 5173

🔐 Testing Authentication...
✓ Login endpoint responding correctly

⚡ Testing Quick Trades Feature...
✓ Quick Trade endpoints configured
  → Auth protection working

🔌 Testing Port Availability...
✓ Port 5000 (Node.js Backend)
  → Responding
✓ Port 5173 (React Frontend)
  → Responding
✓ Port 6379 (Redis)
  → Service running

🐍 Testing Python Market Simulation...
✓ Python process running

══════════════════════════════════════════════════════════════════════
                         TEST SUMMARY
══════════════════════════════════════════════════════════════════════

  Total Tests: 15
  ✓ Passed: 15
  ✗ Failed: 0
  Success Rate: 100.0%

  🎉 ALL TESTS PASSED! System is healthy.

══════════════════════════════════════════════════════════════════════
```

---

## 🔧 Using With CLI

The health check is integrated into the main CLI!

In `overview-cli.bat`:
```
> h  (Run Health Check)
```

---

## 💡 Auto-Fix Recommendations

If tests fail, you'll get actionable recommendations:

```
💡 RECOMMENDATIONS:

  • Start Redis: docker start redis-market
  • Start Backend: cd server && node index.js  
  • Start Frontend: cd client && npm run dev
  • Start Python: cd python-market-sim && venv\Scripts\activate && python main.py
```

---

## 📈 Advanced Features

### **1. Continuous Monitoring**
Run health check on a schedule:
```cmd
# Coming soon: health-check --watch
```

### **2. Export Results**
Save test results to file:
```cmd
node health-check.js > health-report.txt
```

### **3. CI/CD Integration**
Use in automated deployment:
```yaml
# .github/workflows/deploy.yml
- name: Health Check
  run: node health-check.js
```

---

## 🎯 Interpreting Results

### **Success Rates:**
- **100%**: ✅ Perfect! All systems operational
- **90-99%**: ⚠️ Mostly healthy, minor issues
- **70-89%**: ⚠️ Degraded performance, needs attention
- **<70%**: ❌ Critical - immediate action required

### **Common Failures & Fixes:**

#### **Redis Not Running**
```cmd
docker start redis-market
# or
docker run -d -p 6379:6379 --name redis-market redis:latest
```

#### **Backend Not Responding**
```cmd
cd server
node index.js
```

#### **Frontend Not Accessible**
```cmd
cd client
npm install  # if first time
npm run dev
```

#### **Database Connection Failed**
- Check `server/.env` file
- Verify Supabase credentials
- Test connection manually

---

## 🏗️ Architecture

```
health-check.js
├─ testDocker()           → Docker availability
├─ testRedis()            → Redis container status
├─ testBackend()          → API endpoints
├─ testDatabase()         → Database connectivity
├─ testFrontend()         → React server
├─ testAuth()             → Authentication flow
├─ testQuickTrades()      → Quick trade feature
├─ testPortsAvailable()   → Port conflicts
└─ testPythonService()    → Python process
```

---

## 🚨 Troubleshooting

### **"axios not found"**
Install dependencies:
```cmd
npm install axios
```

### **"All tests failing"**
Services probably aren't running. Use:
```cmd
overview-cli.bat
> 1  (Start All Services)
```

### **"Port already in use"**
Another service is using the port:
```cmd
netstat -ano | findstr :5000
taskkill /PID [process-id] /F
```

---

## 📊 Automated Testing Script

Want to test EVERYTHING? Run the full suite:

```cmd
health-check.bat
```

This will:
1. ✅ Test all infrastructure
2. ✅ Test all APIs
3. ✅ Test authentication
4. ✅ Test database
5. ✅ Test frontend
6. ✅ Generate report
7. ✅ Provide recommendations

---

## 🎉 Benefits

### **For Developers:**
- Instant system status
- Quick debugging
- Confidence in deployments

### **For DevOps:**
- Automated health checks
- CI/CD integration
- Monitoring automation

### **For Users:**
- Ensure platform stability
- Verify all features working
- Peace of mind

---

## 📝 Extending the Health Check

### **Add Custom Tests:**

Edit `health-check.js`:

```javascript
async function testYourFeature() {
    console.log(colors.bright + '\n🔥 Testing Your Feature...' + colors.reset);
    
    try {
        // Your test logic
        const result = await someTest();
        
        if (result) {
            log('PASS', 'Feature working');
        } else {
            log('FAIL', 'Feature broken');
        }
    } catch (error) {
        log('FAIL', 'Test failed', error.message);
    }
}

// Add to runHealthCheck():
await testYourFeature();
```

---

## 🎯 Best Practices

1. **Run Before Deployment** - Ensure everything works
2. **Run After Updates** - Verify nothing broke
3. **Run Daily** - Catch issues early
4. **Save Reports** - Track system health over time

---

## 📦 Files

```
TradingApp/
├── health-check.js        - Main health check script
├── health-check.bat       - Quick launcher
└── HEALTH_CHECK_GUIDE.md  - This guide
```

---

**🎉 You now have professional system diagnostics!**

Run: `health-check.bat` to test your entire platform!
