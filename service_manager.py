#!/usr/bin/env python3
"""
Stock Market Application - Service Manager UI
A PyQt-based GUI to manage all application services
"""

import sys
import subprocess
import time
import os
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QTextEdit, QGroupBox, QMessageBox
)
from PyQt6.QtCore import QThread, pyqtSignal, Qt, QTimer
from PyQt6.QtGui import QFont, QIcon

# Get the script directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


class ServiceStatus:
    """Check service status"""

    @staticmethod
    def check_port(port):
        """Check if a port is in use"""
        try:
            result = subprocess.run(
                ['lsof', '-i', f':{port}'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception:
            return False

    @staticmethod
    def check_docker_container(name):
        """Check if Docker container is running"""
        try:
            result = subprocess.run(
                ['docker', 'ps', '--format', '{{.Names}}'],
                capture_output=True,
                text=True
            )
            return name in result.stdout
        except Exception:
            return False


class CommandThread(QThread):
    """Thread to run shell commands without blocking UI"""
    output_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(bool, str)

    def __init__(self, command, description=""):
        super().__init__()
        self.command = command
        self.description = description

    def run(self):
        try:
            self.output_signal.emit(f"\n{'='*60}\n")
            self.output_signal.emit(f"Executing: {self.description}\n")
            self.output_signal.emit(f"{'='*60}\n")

            process = subprocess.Popen(
                self.command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )

            # Read output line by line
            for line in process.stdout:
                self.output_signal.emit(line)

            process.wait()

            if process.returncode == 0:
                self.finished_signal.emit(True, "Success")
            else:
                self.finished_signal.emit(False, f"Failed with code {process.returncode}")

        except Exception as e:
            self.output_signal.emit(f"\nError: {str(e)}\n")
            self.finished_signal.emit(False, str(e))


class ServiceManagerUI(QMainWindow):
    """Main UI for managing services"""

    def __init__(self):
        super().__init__()
        self.init_ui()
        self.command_thread = None

        # Start status update timer
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.update_status)
        self.status_timer.start(2000)  # Update every 2 seconds

        # Initial status update
        self.update_status()

    def init_ui(self):
        """Initialize the user interface"""
        self.setWindowTitle('Stock Market - Service Manager')
        self.setGeometry(100, 100, 900, 700)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        layout = QVBoxLayout()
        central_widget.setLayout(layout)

        # Title
        title = QLabel('Stock Market Application\nService Manager')
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_font = QFont('Arial', 18, QFont.Weight.Bold)
        title.setFont(title_font)
        title.setStyleSheet('color: #2563eb; margin: 10px;')
        layout.addWidget(title)

        # Status Group
        status_group = self.create_status_group()
        layout.addWidget(status_group)

        # Control Buttons
        control_group = self.create_control_group()
        layout.addWidget(control_group)

        # Output Console
        console_group = self.create_console_group()
        layout.addWidget(console_group)

        # Apply stylesheet
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f8fafc;
            }
            QGroupBox {
                font-weight: bold;
                border: 2px solid #cbd5e1;
                border-radius: 8px;
                margin-top: 10px;
                padding-top: 15px;
                background-color: white;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 5px;
                color: #1e293b;
            }
            QPushButton {
                padding: 10px 20px;
                font-size: 14px;
                font-weight: bold;
                border-radius: 6px;
                border: none;
            }
            QLabel {
                font-size: 13px;
            }
        """)

    def create_status_group(self):
        """Create status display group"""
        group = QGroupBox('Service Status')
        layout = QHBoxLayout()

        # PostgreSQL Status
        postgres_layout = QVBoxLayout()
        postgres_label = QLabel('PostgreSQL')
        postgres_label.setStyleSheet('font-weight: bold; font-size: 14px;')
        self.postgres_status = QLabel('⚫ Stopped')
        self.postgres_status.setStyleSheet('color: #64748b; font-size: 13px;')
        postgres_layout.addWidget(postgres_label)
        postgres_layout.addWidget(self.postgres_status)
        layout.addLayout(postgres_layout)

        # Backend Status
        backend_layout = QVBoxLayout()
        backend_label = QLabel('Backend (Port 8000)')
        backend_label.setStyleSheet('font-weight: bold; font-size: 14px;')
        self.backend_status = QLabel('⚫ Stopped')
        self.backend_status.setStyleSheet('color: #64748b; font-size: 13px;')
        backend_layout.addWidget(backend_label)
        backend_layout.addWidget(self.backend_status)
        layout.addLayout(backend_layout)

        # Frontend Status
        frontend_layout = QVBoxLayout()
        frontend_label = QLabel('Frontend (Port 5173)')
        frontend_label.setStyleSheet('font-weight: bold; font-size: 14px;')
        self.frontend_status = QLabel('⚫ Stopped')
        self.frontend_status.setStyleSheet('color: #64748b; font-size: 13px;')
        frontend_layout.addWidget(frontend_label)
        frontend_layout.addWidget(self.frontend_status)
        layout.addLayout(frontend_layout)

        group.setLayout(layout)
        return group

    def create_control_group(self):
        """Create control buttons group"""
        group = QGroupBox('Controls')
        layout = QVBoxLayout()

        # Row 1: Start/Stop All
        row1 = QHBoxLayout()

        self.start_all_btn = QPushButton('▶ Start All Services')
        self.start_all_btn.setStyleSheet('background-color: #22c55e; color: white;')
        self.start_all_btn.clicked.connect(self.start_all_services)
        row1.addWidget(self.start_all_btn)

        self.stop_all_btn = QPushButton('⏹ Stop All Services')
        self.stop_all_btn.setStyleSheet('background-color: #ef4444; color: white;')
        self.stop_all_btn.clicked.connect(self.stop_all_services)
        row1.addWidget(self.stop_all_btn)

        layout.addLayout(row1)

        # Row 2: Individual Services
        row2 = QHBoxLayout()

        self.postgres_btn = QPushButton('🐘 Start PostgreSQL')
        self.postgres_btn.setStyleSheet('background-color: #3b82f6; color: white;')
        self.postgres_btn.clicked.connect(self.start_postgres)
        row2.addWidget(self.postgres_btn)

        self.backend_btn = QPushButton('⚙️ Start Backend')
        self.backend_btn.setStyleSheet('background-color: #8b5cf6; color: white;')
        self.backend_btn.clicked.connect(self.start_backend)
        row2.addWidget(self.backend_btn)

        self.frontend_btn = QPushButton('🎨 Start Frontend')
        self.frontend_btn.setStyleSheet('background-color: #06b6d4; color: white;')
        self.frontend_btn.clicked.connect(self.start_frontend)
        row2.addWidget(self.frontend_btn)

        layout.addLayout(row2)

        # Row 3: Utility buttons
        row3 = QHBoxLayout()

        clear_logs_btn = QPushButton('🗑️ Clear Logs')
        clear_logs_btn.setStyleSheet('background-color: #64748b; color: white;')
        clear_logs_btn.clicked.connect(self.clear_logs)
        row3.addWidget(clear_logs_btn)

        open_frontend_btn = QPushButton('🌐 Open Frontend')
        open_frontend_btn.setStyleSheet('background-color: #f59e0b; color: white;')
        open_frontend_btn.clicked.connect(self.open_frontend)
        row3.addWidget(open_frontend_btn)

        open_backend_btn = QPushButton('📡 Open Backend')
        open_backend_btn.setStyleSheet('background-color: #f59e0b; color: white;')
        open_backend_btn.clicked.connect(self.open_backend)
        row3.addWidget(open_backend_btn)

        layout.addLayout(row3)

        group.setLayout(layout)
        return group

    def create_console_group(self):
        """Create console output group"""
        group = QGroupBox('Console Output')
        layout = QVBoxLayout()

        self.console = QTextEdit()
        self.console.setReadOnly(True)
        self.console.setStyleSheet("""
            QTextEdit {
                background-color: #1e293b;
                color: #e2e8f0;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                border: 1px solid #334155;
                border-radius: 4px;
            }
        """)
        self.console.setMinimumHeight(200)
        layout.addWidget(self.console)

        group.setLayout(layout)
        return group

    def update_status(self):
        """Update service status indicators"""
        # Check PostgreSQL
        if ServiceStatus.check_docker_container('stock-market-postgres'):
            self.postgres_status.setText('🟢 Running')
            self.postgres_status.setStyleSheet('color: #22c55e; font-size: 13px;')
        else:
            self.postgres_status.setText('⚫ Stopped')
            self.postgres_status.setStyleSheet('color: #64748b; font-size: 13px;')

        # Check Backend
        if ServiceStatus.check_port(8000):
            self.backend_status.setText('🟢 Running')
            self.backend_status.setStyleSheet('color: #22c55e; font-size: 13px;')
        else:
            self.backend_status.setText('⚫ Stopped')
            self.backend_status.setStyleSheet('color: #64748b; font-size: 13px;')

        # Check Frontend
        if ServiceStatus.check_port(5173):
            self.frontend_status.setText('🟢 Running')
            self.frontend_status.setStyleSheet('color: #22c55e; font-size: 13px;')
        else:
            self.frontend_status.setText('⚫ Stopped')
            self.frontend_status.setStyleSheet('color: #64748b; font-size: 13px;')

    def run_command(self, command, description):
        """Run a shell command in a separate thread"""
        if self.command_thread and self.command_thread.isRunning():
            self.log_message("⚠️  Another command is already running. Please wait...")
            return

        self.command_thread = CommandThread(command, description)
        self.command_thread.output_signal.connect(self.log_message)
        self.command_thread.finished_signal.connect(self.command_finished)
        self.command_thread.start()

        # Disable buttons while running
        self.set_buttons_enabled(False)

    def command_finished(self, success, message):
        """Handle command completion"""
        self.set_buttons_enabled(True)
        if success:
            self.log_message(f"✅ {message}\n")
        else:
            self.log_message(f"❌ {message}\n")
        self.update_status()

    def set_buttons_enabled(self, enabled):
        """Enable/disable all buttons"""
        self.start_all_btn.setEnabled(enabled)
        self.stop_all_btn.setEnabled(enabled)
        self.postgres_btn.setEnabled(enabled)
        self.backend_btn.setEnabled(enabled)
        self.frontend_btn.setEnabled(enabled)

    def log_message(self, message):
        """Add message to console"""
        self.console.append(message.rstrip())
        self.console.verticalScrollBar().setValue(
            self.console.verticalScrollBar().maximum()
        )

    def start_all_services(self):
        """Start all services"""
        script_path = os.path.join(SCRIPT_DIR, 'start-services.sh')
        self.run_command(f'bash {script_path}', 'Starting all services')

    def stop_all_services(self):
        """Stop all services"""
        script_path = os.path.join(SCRIPT_DIR, 'stop-services.sh')
        self.run_command(f'bash {script_path}', 'Stopping all services')

    def start_postgres(self):
        """Start PostgreSQL only"""
        command = """
        if docker ps -a --format '{{.Names}}' | grep -q "^stock-market-postgres$"; then
            docker start stock-market-postgres
        else
            docker run -d \
                --name stock-market-postgres \
                -e POSTGRES_USER=stockuser \
                -e POSTGRES_PASSWORD=stockpass \
                -e POSTGRES_DB=stockmarket \
                -p 5432:5432 \
                -v stock-market-pgdata:/var/lib/postgresql/data \
                postgres:15-alpine
        fi
        """
        self.run_command(command, 'Starting PostgreSQL')

    def start_backend(self):
        """Start backend only"""
        backend_dir = os.path.join(SCRIPT_DIR, 'vedl-backend')
        command = f"""
        cd {backend_dir}
        lsof -ti:8000 | xargs kill -9 2>/dev/null || true
        nohup uvicorn main:app --reload --port 8000 > /tmp/stock-market-backend.log 2>&1 &
        echo "Backend started"
        """
        self.run_command(command, 'Starting Backend')

    def start_frontend(self):
        """Start frontend only"""
        command = f"""
        cd {SCRIPT_DIR}
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
        nohup npm run dev > /tmp/stock-market-frontend.log 2>&1 &
        sleep 2
        echo "Frontend started"
        """
        self.run_command(command, 'Starting Frontend')

    def clear_logs(self):
        """Clear console logs"""
        self.console.clear()
        self.log_message("🗑️  Console cleared\n")

    def open_frontend(self):
        """Open frontend in browser"""
        subprocess.run(['open', 'http://localhost:5173'])
        self.log_message("🌐 Opening frontend in browser...\n")

    def open_backend(self):
        """Open backend docs in browser"""
        subprocess.run(['open', 'http://localhost:8000/docs'])
        self.log_message("📡 Opening backend API docs in browser...\n")

    def closeEvent(self, event):
        """Handle window close event"""
        reply = QMessageBox.question(
            self,
            'Confirm Exit',
            'Do you want to stop all services before exiting?',
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No | QMessageBox.StandardButton.Cancel
        )

        if reply == QMessageBox.StandardButton.Yes:
            self.stop_all_services()
            # Wait a bit for services to stop
            time.sleep(1)
            event.accept()
        elif reply == QMessageBox.StandardButton.No:
            event.accept()
        else:
            event.ignore()


def main():
    """Main entry point"""
    app = QApplication(sys.argv)
    app.setStyle('Fusion')

    window = ServiceManagerUI()
    window.show()

    sys.exit(app.exec())


if __name__ == '__main__':
    main()
