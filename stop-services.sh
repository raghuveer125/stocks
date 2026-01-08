#!/bin/bash

# Stock Market Application - Service Stop Script

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Stock Market Application - Stopping Services ===${NC}\n"

# Stop Frontend
echo -e "${BLUE}[1/3] Stopping Frontend...${NC}"
if lsof -ti:5173 >/dev/null 2>&1; then
    lsof -ti:5173 | xargs kill -9
    echo -e "${GREEN}Frontend stopped${NC}"
else
    echo -e "${YELLOW}Frontend is not running${NC}"
fi

# Stop Backend
echo -e "\n${BLUE}[2/3] Stopping Backend...${NC}"
if lsof -ti:8000 >/dev/null 2>&1; then
    lsof -ti:8000 | xargs kill -9
    echo -e "${GREEN}Backend stopped${NC}"
else
    echo -e "${YELLOW}Backend is not running${NC}"
fi

# Stop PostgreSQL
echo -e "\n${BLUE}[3/3] Stopping PostgreSQL...${NC}"
if docker ps --format '{{.Names}}' | grep -q "^stock-market-postgres$"; then
    docker stop stock-market-postgres
    echo -e "${GREEN}PostgreSQL stopped${NC}"
else
    echo -e "${YELLOW}PostgreSQL is not running${NC}"
fi

echo -e "\n${GREEN}=== All Services Stopped ===${NC}"
