#!/bin/bash

# Stock Market Application - Service Manager Launcher
# This script activates the virtual environment and launches the Service Manager GUI

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv-service-manager"

clear
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Stock Market - Service Manager                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found${NC}"
    echo -e "${CYAN}Running setup script...${NC}\n"

    if [ -f "$SCRIPT_DIR/setup-service-manager.sh" ]; then
        bash "$SCRIPT_DIR/setup-service-manager.sh"

        if [ $? -ne 0 ]; then
            echo -e "\n${RED}Setup failed. Please check the errors above.${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Setup script not found${NC}"
        echo -e "${YELLOW}Please run: ./setup-service-manager.sh${NC}"
        exit 1
    fi

    echo -e "\n${GREEN}Setup completed successfully!${NC}"
    echo -e "${CYAN}Continuing to launch Service Manager...${NC}\n"
    sleep 2
fi

# Activate virtual environment
echo -e "${CYAN}🔄 Activating virtual environment...${NC}"
source "$VENV_DIR/bin/activate"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to activate virtual environment${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo -e "${YELLOW}🐍 Python: $(which python)${NC}\n"

# Check if PyQt6 is installed
echo -e "${CYAN}🔍 Verifying PyQt6 installation...${NC}"
python -c "from PyQt6.QtWidgets import QApplication" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ PyQt6 not found${NC}"
    echo -e "${CYAN}Installing PyQt6...${NC}"
    pip install PyQt6

    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Failed to install PyQt6${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ PyQt6 ready${NC}\n"

# Launch Service Manager
echo -e "${CYAN}🚀 Launching Service Manager GUI...${NC}\n"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"

cd "$SCRIPT_DIR"
python service_manager.py

# Capture exit code
EXIT_CODE=$?

# Deactivate virtual environment
deactivate 2>/dev/null

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✓ Service Manager closed successfully${NC}"
else
    echo -e "\n${YELLOW}⚠️  Service Manager exited with code: $EXIT_CODE${NC}"
fi
