#!/bin/bash

# Stock Market Application - Service Startup Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stock Market Application - Starting Services ===${NC}\n"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:"$1" >/dev/null 2>&1
}

# Check if Docker is installed
if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${YELLOW}Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Start PostgreSQL in Docker
echo -e "${BLUE}[1/3] Starting PostgreSQL database...${NC}"

# Check if PostgreSQL container already exists
if docker ps -a --format '{{.Names}}' | grep -q "^stock-market-postgres$"; then
    echo -e "${YELLOW}PostgreSQL container already exists${NC}"

    # Check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^stock-market-postgres$"; then
        echo -e "${GREEN}PostgreSQL is already running${NC}"
    else
        echo -e "${YELLOW}Starting existing PostgreSQL container...${NC}"
        docker start stock-market-postgres
        echo -e "${GREEN}PostgreSQL started${NC}"
    fi
else
    echo -e "${YELLOW}Creating new PostgreSQL container...${NC}"
    docker run -d \
        --name stock-market-postgres \
        -e POSTGRES_USER=stockuser \
        -e POSTGRES_PASSWORD=stockpass \
        -e POSTGRES_DB=stockmarket \
        -p 5432:5432 \
        -v stock-market-pgdata:/var/lib/postgresql/data \
        postgres:15-alpine

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}PostgreSQL container created and started${NC}"
        echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
        sleep 3
    else
        echo -e "${RED}Failed to start PostgreSQL${NC}"
        exit 1
    fi
fi

# Start Backend
echo -e "\n${BLUE}[2/3] Starting Backend (uvicorn)...${NC}"

cd "$(dirname "$0")/vedl-backend"

# Kill existing backend process if running
if port_in_use 8000; then
    echo -e "${YELLOW}Port 8000 is in use. Killing existing process...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start backend in background
echo -e "${YELLOW}Starting uvicorn server...${NC}"
nohup uvicorn main:app --reload --port 8000 > /tmp/stock-market-backend.log 2>&1 &
BACKEND_PID=$!

sleep 2

if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}Failed to start backend. Check logs: /tmp/stock-market-backend.log${NC}"
    exit 1
fi

# Start Frontend
echo -e "\n${BLUE}[3/3] Starting Frontend (Vite)...${NC}"

cd "$(dirname "$0")"

# Kill existing frontend process if running
if port_in_use 5173; then
    echo -e "${YELLOW}Port 5173 is in use. Killing existing process...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start frontend in background
echo -e "${YELLOW}Starting Vite dev server...${NC}"
nohup npm run dev > /tmp/stock-market-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}Failed to start frontend. Check logs: /tmp/stock-market-frontend.log${NC}"
    exit 1
fi

# Summary
echo -e "\n${GREEN}=== All Services Started Successfully ===${NC}"
echo -e "${BLUE}PostgreSQL:${NC} Running in Docker (port 5432)"
echo -e "${BLUE}Backend:${NC}    http://localhost:8000 (PID: $BACKEND_PID)"
echo -e "${BLUE}Frontend:${NC}   http://localhost:5173 (PID: $FRONTEND_PID)"
echo -e "\n${YELLOW}Logs:${NC}"
echo -e "  Backend:  /tmp/stock-market-backend.log"
echo -e "  Frontend: /tmp/stock-market-frontend.log"
echo -e "\n${YELLOW}To stop services, run:${NC} ./stop-services.sh"
