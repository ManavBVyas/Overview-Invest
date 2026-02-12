---
description: Start Phase 2 - Build Python Market Simulation Service
---

# Python Market Simulation Workflow

## Prerequisites
- Python 3.8+ installed
- Redis server installed or Docker available
- Node.js backend running

## Step-by-Step Implementation

### 1. Create Project Structure
```bash
cd "c:\Overview Invest V5\TradingApp"
mkdir python-market-sim
cd python-market-sim
mkdir models publishers
```

### 2. Set Up Virtual Environment
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install --upgrade pip
```

### 3. Create requirements.txt
Create file with:
```
redis==5.0.1
numpy==1.24.3
pandas==2.0.3
python-dotenv==1.0.0
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Install Redis

**Option A: Docker (Easiest)**
```bash
docker run -d -p 6379:6379 --name redis-market redis:latest
```

**Option B: Windows Native**
Download from: https://github.com/tporadowski/redis/releases
Extract and run `redis-server.exe`

**Option C: WSL**
```bash
wsl --install
wsl
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### 6. Create Python Files

See `IMPLEMENTATION_PLAN.md` for full code of:
- `models/price_engine.py`
- `models/candle_generator.py`
- `models/indicators.py`
- `publishers/redis_publisher.py`
- `main.py`
- `config.py`

### 7. Update Node.js Backend

Install Redis client:
```bash
cd ../server
npm install redis
```

Create `server/redis-subscriber.js` (see implementation plan)

Update `server/index.js` to import subscriber

### 8. Test the Flow

**Terminal 1 - Redis:**
```bash
redis-server
# Or: docker start redis-market
```

**Terminal 2 - Python Service:**
```bash
cd "c:\Overview Invest V5\TradingApp\python-market-sim"
venv\Scripts\activate
python main.py
```

**Terminal 3 - Node.js Backend:**
```bash
cd "c:\Overview Invest V5\TradingApp\server"
npm run dev
```

**Terminal 4 - React Frontend:**
```bash
cd "c:\Overview Invest V5\TradingApp\client"
npm run dev
```

### 9. Verify Data Flow

1. Check Python console for "Price tick generated" messages
2. Check Node.js console for "Received tick from Redis" messages
3. Open frontend - prices should update
4. Check browser dev tools - WebSocket should show price updates

### 10. Monitor Redis

```bash
redis-cli
SUBSCRIBE price_ticks
# You should see messages
```

## Troubleshooting

### Python Service Won't Start
- Check Python version: `python --version` (need 3.8+)
- Activate venv: `venv\Scripts\activate`
- Check Redis: `redis-cli ping` should return `PONG`

### Node.js Not Receiving Ticks
- Verify Redis is running: `redis-cli ping`
- Check Redis subscriber connection in Node logs
- Verify channel names match in Python and Node

### Chart Not Updating
- Check browser console for WebSocket errors
- Verify Socket.IO connection in Network tab
- Check that Node.js is broadcasting to Socket.IO

## Success Criteria

✅ Python service generates ticks every 2 seconds  
✅ Redis receives and queues ticks  
✅ Node.js subscribes and receives from Redis  
✅ Node.js broadcasts to WebSocket clients  
✅ React frontend receives and displays updates  
✅ Charts update in real-time  
✅ Candles form correctly for candlestick charts  

## Next Steps After Completion

Once Python service is working:
1. Add technical indicators (RSI, MACD, etc.)
2. Integrate market manipulation from database
3. Add multiple timeframe candles (1s, 5s, 1min, 5min, 1h)
4. Optional: Add ML-based price prediction
5. Move to Phase 3: Security hardening
