# Stock Market Application - Service Manager

This directory contains tools to easily manage all services required for the Stock Market application.

## Quick Start (Easiest Method)

**Just run this one command:**

```bash
./run-service-manager.sh
```

This will:
- ✅ Automatically create a virtual environment if needed
- ✅ Install all required Python packages (PyQt6)
- ✅ Launch the Service Manager GUI

That's it! The script handles everything for you.

## Prerequisites

The setup script will check for these, but you need:

1. **Docker Desktop** - Must be installed and running
2. **Python 3.x** - Usually pre-installed on macOS
3. **Node.js and npm** - For the frontend
4. **Backend dependencies** - uvicorn, FastAPI, etc.

## First-Time Setup

### Option 1: Automatic Setup (Recommended)

Run the setup script once:

```bash
./setup-service-manager.sh
```

This interactive script will:
- 🔍 Check your Python installation
- 📦 Create a dedicated virtual environment
- ⬇️  Install PyQt6 and all dependencies
- ✅ Verify everything is working
- 💡 Show you what to do next

### Option 2: Manual Setup

If you prefer to do it manually:

```bash
# Create virtual environment
python3 -m venv venv-service-manager

# Activate it
source venv-service-manager/bin/activate

# Install PyQt6
pip install PyQt6
```

## Running the Service Manager

### Method 1: All-in-One Script (Easiest)

```bash
./run-service-manager.sh
```

Handles virtual environment activation and launches the GUI automatically.

### Method 2: Manual Activation

```bash
# Activate virtual environment
source activate-venv.sh

# Run the GUI
python service_manager.py
```

### Method 3: Direct Python

If you've already activated the virtual environment:

```bash
python service_manager.py
```

### Features

The GUI provides:

- **Real-time Status Monitoring**: See which services are running
- **One-Click Start/Stop**: Control all services or individual ones
- **Console Output**: View real-time logs and command output
- **Quick Links**: Open frontend and backend in your browser
- **Service Management**:
  - PostgreSQL (Docker container on port 5432)
  - Backend API (uvicorn on port 8000)
  - Frontend (Vite dev server on port 5173)

## Shell Scripts (Alternative)

If you prefer command-line tools:

### Start All Services

```bash
./start-services.sh
```

This will:
1. Start PostgreSQL in a Docker container (or reuse existing)
2. Start the backend API server on port 8000
3. Start the frontend dev server on port 5173

### Stop All Services

```bash
./stop-services.sh
```

This will cleanly stop all running services.

## PostgreSQL Database

### Container Details

- **Container Name**: `stock-market-postgres`
- **Port**: 5432
- **Database**: `stockmarket`
- **User**: `stockuser`
- **Password**: `stockpass`
- **Data Volume**: `stock-market-pgdata` (persists data between restarts)

### Manual PostgreSQL Commands

Start existing container:
```bash
docker start stock-market-postgres
```

Stop container:
```bash
docker stop stock-market-postgres
```

Remove container (data will be preserved in volume):
```bash
docker rm stock-market-postgres
```

Access PostgreSQL shell:
```bash
docker exec -it stock-market-postgres psql -U stockuser -d stockmarket
```

## Service URLs

Once all services are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

## Logs

Service logs are stored in:

- **Backend**: `/tmp/stock-market-backend.log`
- **Frontend**: `/tmp/stock-market-frontend.log`

View logs in real-time:

```bash
# Backend logs
tail -f /tmp/stock-market-backend.log

# Frontend logs
tail -f /tmp/stock-market-frontend.log
```

## Troubleshooting

### Docker Not Running

If you see "Docker is not running":
1. Open Docker Desktop
2. Wait for it to fully start
3. Try again

### Port Already in Use

If ports 5173 or 8000 are already in use:
1. The scripts will automatically kill existing processes
2. Or manually kill: `lsof -ti:8000 | xargs kill -9`

### PostgreSQL Connection Issues

If the backend can't connect to PostgreSQL:
1. Ensure the container is running: `docker ps | grep postgres`
2. Check the logs: `docker logs stock-market-postgres`
3. Verify the database exists: `docker exec stock-market-postgres psql -U stockuser -l`

### PyQt6 Import Error

If you get `ModuleNotFoundError: No module named 'PyQt6'`:
```bash
pip install PyQt6
```

## Development Workflow

### Recommended Workflow

1. Start the Service Manager GUI: `python3 service_manager.py`
2. Click "Start All Services"
3. Monitor the status indicators
4. Open frontend and backend using the quick links
5. When done, click "Stop All Services"

### Quick Restart

To quickly restart a service:
1. Use the individual service buttons (e.g., "Start Backend")
2. The script will kill the old process and start a new one

## Configuration

### Changing PostgreSQL Credentials

Edit the following files:
- `start-services.sh` - Docker run command
- `service_manager.py` - start_postgres() function
- Backend configuration file

### Changing Ports

Edit the respective files to change default ports:
- Frontend: `stocks/package.json` (Vite config)
- Backend: Scripts use `--port 8000` flag

## License

Part of the Stock Market Application project.
