#!/bin/bash

# Stock Market Application - Service Manager Setup Script
# This script sets up the Python virtual environment and installs required dependencies

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Stock Market - Service Manager Setup                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Navigate to project directory (stocks folder)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Python 3 is installed
echo -e "${CYAN}[1/5] Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    echo -e "${YELLOW}Please install Python 3 from https://www.python.org/downloads/${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✓ Found: $PYTHON_VERSION${NC}\n"

# Check if virtual environment exists
VENV_DIR="$SCRIPT_DIR/venv-service-manager"

if [ -d "$VENV_DIR" ]; then
    echo -e "${CYAN}[2/5] Virtual environment already exists${NC}"
    echo -e "${YELLOW}📁 Location: $VENV_DIR${NC}"

    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Removing existing virtual environment...${NC}"
        rm -rf "$VENV_DIR"
        echo -e "${GREEN}✓ Removed${NC}\n"
    else
        echo -e "${GREEN}✓ Using existing virtual environment${NC}\n"
    fi
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo -e "${CYAN}[2/5] Creating Python virtual environment...${NC}"
    echo -e "${YELLOW}📦 Creating venv at: $VENV_DIR${NC}"

    python3 -m venv "$VENV_DIR"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Virtual environment created successfully${NC}\n"
    else
        echo -e "${RED}✗ Failed to create virtual environment${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Virtual environment ready${NC}\n"
fi

# Activate virtual environment
echo -e "${CYAN}[3/5] Activating virtual environment...${NC}"
source "$VENV_DIR/bin/activate"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
    echo -e "${YELLOW}🐍 Python: $(which python)${NC}\n"
else
    echo -e "${RED}✗ Failed to activate virtual environment${NC}"
    exit 1
fi

# Upgrade pip
echo -e "${CYAN}[4/5] Upgrading pip...${NC}"
python -m pip install --upgrade pip --quiet

if [ $? -eq 0 ]; then
    PIP_VERSION=$(pip --version)
    echo -e "${GREEN}✓ pip upgraded: $PIP_VERSION${NC}\n"
else
    echo -e "${YELLOW}⚠️  Could not upgrade pip, continuing...${NC}\n"
fi

# Install required packages
echo -e "${CYAN}[5/5] Installing required Python packages...${NC}"
echo -e "${YELLOW}📦 Installing: PyQt6${NC}"

pip install PyQt6 --quiet

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PyQt6 installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install PyQt6${NC}"
    echo -e "${YELLOW}Trying with verbose output...${NC}"
    pip install PyQt6

    if [ $? -ne 0 ]; then
        echo -e "${RED}Installation failed. Please check the error messages above.${NC}"
        exit 1
    fi
fi

# Verify installation
echo -e "\n${CYAN}Verifying installation...${NC}"
python3 -c "from PyQt6.QtWidgets import QApplication; print('✓ PyQt6 successfully imported')" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All packages verified${NC}\n"
else
    echo -e "${RED}✗ Package verification failed${NC}"
    exit 1
fi

# Create activation helper script
echo -e "${CYAN}Creating activation helper script...${NC}"
cat > "$SCRIPT_DIR/activate-venv.sh" << 'EOFSCRIPT'
#!/bin/bash
# Activation helper for Service Manager virtual environment
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/venv-service-manager/bin/activate"
echo "✓ Virtual environment activated"
echo "Python: $(which python)"
echo ""
echo "To run the Service Manager:"
echo "  python service_manager.py"
EOFSCRIPT

chmod +x "$SCRIPT_DIR/activate-venv.sh"
echo -e "${GREEN}✓ Helper script created: activate-venv.sh${NC}\n"

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setup Complete! ✓                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}📋 Installation Summary:${NC}"
echo -e "  • Virtual environment: ${CYAN}$VENV_DIR${NC}"
echo -e "  • Python version: ${CYAN}$PYTHON_VERSION${NC}"
echo -e "  • Packages installed: ${CYAN}PyQt6${NC}"
echo -e ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo -e "  ${GREEN}1.${NC} Activate the virtual environment:"
echo -e "     ${CYAN}source activate-venv.sh${NC}"
echo -e ""
echo -e "  ${GREEN}2.${NC} Run the Service Manager GUI:"
echo -e "     ${CYAN}python service_manager.py${NC}"
echo -e ""
echo -e "  ${GREEN}OR${NC} run everything in one command:"
echo -e "     ${CYAN}./run-service-manager.sh${NC}"
echo -e ""
echo -e "${YELLOW}📖 For more information, see: SERVICE_MANAGER_README.md${NC}\n"

# Deactivate for now
deactivate 2>/dev/null
