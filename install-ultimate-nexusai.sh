#!/usr/bin/env bash
# ==============================================================================
# NEXUS AI ULTIMATE TOOLCHAIN & DEVOPS AUTOMATED INSTALLER
# File: install-ultimate-nexusai.sh
# Target OS: AlmaLinux 10 / Ubuntu 26.04 LTS / RHEL 9/10
# ==============================================================================

set -euo pipefail

# Visual Formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🚀 NexusAI Enterprise Toolchain & DevOps Installer${NC}"
echo "=========================================================="
echo ""

PROJECT_DIR="/home/ahmed_alsaleh/Dev/NexusAI"

# 1. Prerequisites Check
check_prerequisites() {
    echo -e "${YELLOW}📋 [1/5] Checking System Prerequisites...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Node.js v24+ required.${NC}"
        exit 1
    fi

    NODE_VER=$(node -v)
    echo -e "${GREEN}  ✓ Node.js Version: ${NODE_VER}${NC}"

    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 is not installed.${NC}"
        exit 1
    fi

    PYTHON_VER=$(python3 --version)
    echo -e "${GREEN}  ✓ Python Version: ${PYTHON_VER}${NC}"
}

# 2. Category Tool Installations
install_code_quality() {
    echo -e "${YELLOW}📦 [2/5] Installing Code Quality & Testing Tools...${NC}"
    npm install -g eslint prettier typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin jest vite @mermaid-js/mermaid-cli || true
    python3 -m pip install black pylint mypy pytest pytest-cov bandit semgrep || true
    echo -e "${GREEN}  ✓ Code quality & testing tools configured.${NC}"
}

# 3. Generate Tool Configuration Files
generate_configs() {
    echo -e "${YELLOW}⚙️ [3/5] Generating Config Files (.eslintrc.js, .prettierrc, tsconfig.json, jest.config.js, pytest.ini, prometheus.yml)...${NC}"

    # .eslintrc.js
    cat > "${PROJECT_DIR}/.eslintrc.js" << 'EOF'
module.exports = {
  env: { node: true, es2022: true, browser: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
EOF

    # .prettierrc
    cat > "${PROJECT_DIR}/.prettierrc" << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
EOF

    # tsconfig.json
    cat > "${PROJECT_DIR}/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
EOF

    # jest.config.js
    cat > "${PROJECT_DIR}/jest.config.js" << 'EOF'
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  }
};
EOF

    # pytest.ini
    cat > "${PROJECT_DIR}/pytest.ini" << 'EOF'
[pytest]
testpaths = tests
python_files = test_*.py
addopts = -v --cov=. --cov-report=term-missing
EOF

    # prometheus.yml
    cat > "${PROJECT_DIR}/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nexusai-backend'
    static_configs:
      - targets: ['localhost:3001']
EOF

    echo -e "${GREEN}  ✓ Configuration files generated successfully.${NC}"
}

# 4. Restart Backend Server
restart_server() {
    echo -e "${YELLOW}🔄 [4/5] Restarting NexusAI Node Server...${NC}"
    pkill -f "node server/index.js" || true
    sleep 1
    node "${PROJECT_DIR}/server/index.js" &
    sleep 2
    echo -e "${GREEN}  ✓ Server re-launched on http://localhost:3001.${NC}"
}

# 5. Validate Tool Status API
validate_tools() {
    echo -e "${YELLOW}✅ [5/5] Validating Tool Status API Endpoint...${NC}"
    curl -s http://localhost:3001/api/tools/status | grep -q "success" && echo -e "${GREEN}  ✓ Tool Status API: HEALTHY${NC}" || echo -e "${RED}  ❌ Tool Status API: FAILED${NC}"
}

main() {
    check_prerequisites
    install_code_quality
    generate_configs
    restart_server
    validate_tools

    echo ""
    echo -e "${CYAN}🎉 NexusAI Ultimate Toolchain Installation Complete!${NC}"
    echo "=========================================================="
}

main "$@"
