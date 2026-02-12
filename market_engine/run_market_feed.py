import yfinance as yf
import time
import datetime
import pandas as pd
import redis
import json
import sys

# Redis Configuration
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_CHANNEL = 'stock_updates'

def connect_redis():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)
        r.ping()
        print(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
        return r
    except redis.ConnectionError:
        print(f"Error: Could not connect to Redis at {REDIS_HOST}:{REDIS_PORT}")
        print("Please ensure your Redis server is running.")
        return None

def main():
    # Define assets
    assets_config = [
        # Banking & Financial Services
        {"ticker": "HDFCBANK.NS", "name": "HDFC Bank", "type": "Banking"},
        {"ticker": "SBIN.NS", "name": "SBI", "type": "Banking"},
        {"ticker": "ICICIBANK.NS", "name": "ICICI Bank", "type": "Banking"},
        {"ticker": "AXISBANK.NS", "name": "Axis Bank", "type": "Banking"},
        {"ticker": "KOTAKBANK.NS", "name": "Kotak Bank", "type": "Banking"},
        {"ticker": "BAJFINANCE.NS", "name": "Bajaj Finance", "type": "Finance"},
        {"ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv", "type": "Finance"},
        {"ticker": "INDUSINDBK.NS", "name": "IndusInd Bank", "type": "Banking"},
        {"ticker": "BANKBARODA.NS", "name": "Bank of Baroda", "type": "Banking"},
        {"ticker": "PNB.NS", "name": "PNB", "type": "Banking"},
        
        # Technology
        {"ticker": "TCS.NS", "name": "TCS", "type": "IT Services"},
        {"ticker": "INFY.NS", "name": "Infosys", "type": "IT Services"},
        {"ticker": "HCLTECH.NS", "name": "HCL Tech", "type": "IT Services"},
        {"ticker": "WIPRO.NS", "name": "Wipro", "type": "IT Services"},
        {"ticker": "LTIM.NS", "name": "LTIMindtree", "type": "IT Services"},
        {"ticker": "TECHM.NS", "name": "Tech Mahindra", "type": "IT Services"},
        {"ticker": "OFSS.NS", "name": "Oracle Fin", "type": "IT Services"},
        {"ticker": "TATAELXSI.NS", "name": "Tata Elxsi", "type": "IT Services"},
        {"ticker": "PERSISTENT.NS", "name": "Persistent", "type": "IT Services"},
        {"ticker": "MPHASIS.NS", "name": "Mphasis", "type": "IT Services"},

        # Energy & Power
        {"ticker": "RELIANCE.NS", "name": "Reliance", "type": "Energy"},
        {"ticker": "NTPC.NS", "name": "NTPC", "type": "Energy"},
        {"ticker": "ONGC.NS", "name": "ONGC", "type": "Energy"},
        {"ticker": "POWERGRID.NS", "name": "Power Grid", "type": "Energy"},
        {"ticker": "ADANIPOWER.NS", "name": "Adani Power", "type": "Energy"},
        {"ticker": "ADANIGREEN.NS", "name": "Adani Green", "type": "Energy"},
        {"ticker": "TATAPOWER.NS", "name": "Tata Power", "type": "Energy"},
        {"ticker": "JSWENERGY.NS", "name": "JSW Energy", "type": "Energy"},
        {"ticker": "IOC.NS", "name": "Indian Oil", "type": "Energy"},
        {"ticker": "BPCL.NS", "name": "BPCL", "type": "Energy"},

        # Metals & Mining
        {"ticker": "JSWSTEEL.NS", "name": "JSW Steel", "type": "Metals"},
        {"ticker": "COALINDIA.NS", "name": "Coal India", "type": "Metals"},
        {"ticker": "TATASTEEL.NS", "name": "Tata Steel", "type": "Metals"},
        {"ticker": "VEDL.NS", "name": "Vedanta", "type": "Metals"},
        {"ticker": "HINDZINC.NS", "name": "Hindustan Zinc", "type": "Metals"},
        {"ticker": "HINDALCO.NS", "name": "Hindalco", "type": "Metals"},
        {"ticker": "NMDC.NS", "name": "NMDC", "type": "Metals"},
        {"ticker": "SAIL.NS", "name": "SAIL", "type": "Metals"},
        {"ticker": "JINDALSTEL.NS", "name": "Jindal Steel", "type": "Metals"},
        {"ticker": "NATIONALUM.NS", "name": "NALCO", "type": "Metals"},

        # Healthcare
        {"ticker": "LICI.NS", "name": "LIC India", "type": "Insurance"},
        {"ticker": "SUNPHARMA.NS", "name": "Sun Pharma", "type": "Healthcare"},
        {"ticker": "CIPLA.NS", "name": "Cipla", "type": "Healthcare"},
        {"ticker": "DRREDDY.NS", "name": "Dr. Reddy's", "type": "Healthcare"},
        {"ticker": "APOLLOHOSP.NS", "name": "Apollo Hosp", "type": "Healthcare"},
        {"ticker": "ZYDUSLIFE.NS", "name": "Zydus Life", "type": "Healthcare"},
        {"ticker": "MAXHEALTH.NS", "name": "Max Health", "type": "Healthcare"},
        {"ticker": "SBILIFE.NS", "name": "SBI Life", "type": "Insurance"},
        {"ticker": "HDFCLIFE.NS", "name": "HDFC Life", "type": "Insurance"},
        {"ticker": "STARHEALTH.NS", "name": "Star Health", "type": "Insurance"},

        # Consumer
        {"ticker": "HINDUNILVR.NS", "name": "HUL", "type": "Consumer"},
        {"ticker": "ITC.NS", "name": "ITC", "type": "Consumer"},
        {"ticker": "TITAN.NS", "name": "Titan", "type": "Consumer"},
        {"ticker": "NESTLEIND.NS", "name": "Nestle", "type": "Consumer"},
        {"ticker": "DMART.NS", "name": "foxDMart", "type": "Retail"},
        {"ticker": "ASIANPAINT.NS", "name": "Asian Paints", "type": "Consumer"},
        {"ticker": "TATACONSUM.NS", "name": "Tata Consumer", "type": "Consumer"},
        {"ticker": "BRITANNIA.NS", "name": "Britannia", "type": "Consumer"},
        {"ticker": "GODREJCP.NS", "name": "Godrej CP", "type": "Consumer"},
        {"ticker": "VBL.NS", "name": "Varun Bev", "type": "Consumer"},

        # Agro
        {"ticker": "PIIND.NS", "name": "PI Ind", "type": "Agro Cham"},
        {"ticker": "UPL.NS", "name": "UPL", "type": "Agro Chem"},
        {"ticker": "COROMANDEL.NS", "name": "Coromandel", "type": "Agro Chem"},
        {"ticker": "BAYERCROP.NS", "name": "Bayer Crop", "type": "Agro Chem"},
        {"ticker": "SUMICHEM.NS", "name": "Sumitomo", "type": "Agro Chem"},
        {"ticker": "CHAMBLFERT.NS", "name": "Chambal Fert", "type": "Agro Chem"},
        {"ticker": "FACT.NS", "name": "FACT", "type": "Agro Chem"},
        {"ticker": "GNFC.NS", "name": "GNFC", "type": "Agro Chem"},
        {"ticker": "DEEPAKFERT.NS", "name": "Deepak Fert", "type": "Agro Chem"},
        {"ticker": "RCF.NS", "name": "RCF", "type": "Agro Chem"},

        # Automobile
        {"ticker": "MARUTI.NS", "name": "Maruti", "type": "Automobile"},
        {"ticker": "M&M.NS", "name": "M&M", "type": "Automobile"},
        {"ticker": "TMPV.NS", "name": "Tata Motors", "type": "Automobile"},
        {"ticker": "BAJAJ-AUTO.NS", "name": "Bajaj Auto", "type": "Automobile"},
        {"ticker": "EICHERMOT.NS", "name": "Eicher Motors", "type": "Automobile"},
        {"ticker": "TVSMOTOR.NS", "name": "TVS Motor", "type": "Automobile"},
        {"ticker": "HEROMOTOCO.NS", "name": "Hero MotoCorp", "type": "Automobile"},
        {"ticker": "MOTHERSON.NS", "name": "Motherson", "type": "Automobile"},
        {"ticker": "BOSCHLTD.NS", "name": "Bosch", "type": "Automobile"},
        {"ticker": "TIINDIA.NS", "name": "Tube Inv", "type": "Automobile"},
        
        # Travel
        {"ticker": "INDIGO.NS", "name": "IndiGo", "type": "Travel"},
        {"ticker": "IRCTC.NS", "name": "IRCTC", "type": "Travel"},
        {"ticker": "MMYT", "name": "MakeMyTrip", "type": "Travel"}, 
        {"ticker": "INDHOTEL.NS", "name": "Taj Hotels", "type": "Travel"},
        {"ticker": "EASEMYTRIP.NS", "name": "Easy Trip", "type": "Travel"},
        {"ticker": "THOMASCOOK.NS", "name": "Thomas Cook", "type": "Travel"},
        {"ticker": "MHRIL.NS", "name": "Mahindra Hol", "type": "Travel"},
        {"ticker": "LEMONTREE.NS", "name": "Lemon Tree", "type": "Travel"},
        {"ticker": "BLS.NS", "name": "BLS Intl", "type": "Travel"},
        {"ticker": "YATRA.NS", "name": "Yatra", "type": "Travel"},

        # Defense
        {"ticker": "HAL.NS", "name": "HAL", "type": "Defense"},
        {"ticker": "BEL.NS", "name": "BEL", "type": "Defense"},
        
        # Crypto
        {"ticker": "BTC-USD", "name": "Bitcoin", "type": "Crypto"},
        {"ticker": "ETH-USD", "name": "Ethereum", "type": "Crypto"}
    ]

    r = connect_redis()
    
    # Extract all tickers
    tickers_list = [asset['ticker'] for asset in assets_config]
    
    print(f"Starting Market Feed for {len(tickers_list)} assets...")
    print("Publishing to Redis channel: 'stock_updates'")
    
    # Helper to chunk list
    def chunked(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i:i + n]

    while True:
        try:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"--- Fetching Data: {timestamp} ---")
            
            all_latest_prices = {}
            
            for batch in chunked(tickers_list, 30):
                try:
                    # Use 1m interval for more granular/recent data
                    data = yf.download(batch, period="1d", interval="1m", progress=False, threads=False)
                    
                    if not data.empty and 'Close' in data:
                        # Get the last valid row
                        closes = data['Close'].iloc[-1]
                        
                        if isinstance(closes, pd.Series):
                            for ticker in batch:
                                if ticker in closes.index:
                                     val = closes[ticker]
                                     # Use real prices without any artificial jitter
                                     all_latest_prices[ticker] = float(val)
                        else:
                             # Single ticker case
                             val = closes
                             # Use real price without jitter
                             all_latest_prices[batch[0]] = float(val)
                except Exception as e:
                    print(f"Batch fetch error: {e}")
            
            # Prepare and publish updates
            for asset in assets_config:
                ticker = asset['ticker']
                price = all_latest_prices.get(ticker)
                
                if price is not None and not pd.isna(price):
                    # Create payload
                    payload = {
                        "ticker": ticker,
                        "name": asset['name'],
                        "type": asset['type'],
                        "price": float(price),
                        "currency": "₹" if ".NS" in ticker else "$",
                        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    
                    # Publish to Redis
                    if r:
                        r.publish(REDIS_CHANNEL, json.dumps(payload))
                    
                    # Optional: Print to console for verify
                    # print(f"Published: {asset['name']} - {payload['price']}")
                
            print("Updates published successfully.")
            
        except Exception as e:
            print(f"Global loop error: {e}")
            # Try to reconnect to Redis if it failed
            if not r:
                 r = connect_redis()

        time.sleep(5)

if __name__ == "__main__":
    main()
