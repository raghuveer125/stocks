# Stock Market Application - Quick Start Guide

Get your Stock Market application running in 3 simple steps!

## 🚀 Quick Start

### Step 1: Open Terminal

Navigate to the project directory:
```bash
cd /Users/Vinayak/stock-market
```

### Step 2: Run the Service Manager

Execute this single command:
```bash
./run-service-manager.sh
```

**What happens:**
- ✅ Automatically sets up Python virtual environment (first time only)
- ✅ Installs required packages (PyQt6)
- ✅ Launches a beautiful GUI to manage your services

### Step 3: Start Your Services

In the GUI that opens:
1. Click **"▶ Start All Services"**
2. Wait for all three services to show 🟢 (green)
3. Click **"🌐 Open Frontend"** to use the app!

That's it! 🎉

---

## 📋 What Gets Started

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Database (runs in Docker) |
| Backend API | 8000 | FastAPI server with uvicorn |
| Frontend | 5173 | React app with Vite |

---

## 🎮 Using the Service Manager GUI

### Main Controls

- **▶ Start All Services** - Starts everything at once
- **⏹ Stop All Services** - Stops everything cleanly
- **Individual Buttons** - Control services one at a time

### Status Indicators

- 🟢 **Running** - Service is active and healthy
- ⚫ **Stopped** - Service is not running

### Quick Actions

- **🌐 Open Frontend** - Opens http://localhost:5173 in browser
- **📡 Open Backend** - Opens http://localhost:8000/docs (API docs)
- **🗑️ Clear Logs** - Clears the console output

### Console Output

The bottom panel shows real-time logs of what's happening:
- Command execution
- Service startup messages
- Error messages (if any)

---

## 🔧 Alternative: Command Line

If you prefer not to use the GUI, you can use shell scripts:

### Start all services:
```bash
./start-services.sh
```

### Stop all services:
```bash
./stop-services.sh
```

---

## ❓ Troubleshooting

### "Docker is not running"
1. Open Docker Desktop
2. Wait for it to fully start (whale icon in menu bar should be steady)
3. Try again

### "Port already in use"
The scripts automatically kill processes on busy ports, but if you see this:
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

### "PyQt6 not found"
Run the setup script:
```bash
./setup-service-manager.sh
```

### Backend can't connect to database
1. Check PostgreSQL is running: `docker ps | grep postgres`
2. Restart PostgreSQL: Click "🐘 Start PostgreSQL" in the GUI

---

## 📱 Accessing Your Application

Once all services show 🟢 in the GUI:

- **Frontend App**: http://localhost:5173
- **Backend API Docs**: http://localhost:8000/docs
- **Backend API**: http://localhost:8000

---

## 🛑 Stopping Everything

### Option 1: GUI
Click **"⏹ Stop All Services"** in the Service Manager

### Option 2: Command Line
```bash
./stop-services.sh
```

### Option 3: Quick Kill
```bash
# Kill frontend and backend
lsof -ti:5173 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Stop PostgreSQL
docker stop stock-market-postgres
```

---

## 📚 Next Steps

- **Full Documentation**: See [SERVICE_MANAGER_README.md](SERVICE_MANAGER_README.md)
- **Backend Configuration**: Edit `stocks/vedl-backend/main.py`
- **Frontend Configuration**: Edit `stocks/vite.config.js`
- **Database Access**:
  ```bash
  docker exec -it stock-market-postgres psql -U stockuser -d stockmarket
  ```

---

## 💡 Pro Tips

1. **Keep the Service Manager open** while developing - it shows you what's happening
2. **Use individual service buttons** when you only need to restart one service
3. **Check the console** if something isn't working - error messages appear there
4. **Logs are saved** to `/tmp/stock-market-*.log` for later inspection

---

## 🎓 Understanding the Setup

### First Run
- Creates virtual environment at: `venv-service-manager/`
- Installs PyQt6 for the GUI
- Takes about 30-60 seconds

### Subsequent Runs
- Reuses existing virtual environment
- Starts immediately (< 5 seconds)

### PostgreSQL Database
- Container name: `stock-market-postgres`
- Data persists in Docker volume: `stock-market-pgdata`
- Database won't lose data when you stop/restart services

---

**Ready to get started?** Just run: `./run-service-manager.sh` 🚀
