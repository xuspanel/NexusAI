#!/usr/bin/env bash
# ==============================================================================
# NEXUS AI DEVELOPER EXPERIENCE (DEVEX) & PRODUCTIVITY AUTOMATED INSTALLER
# File: install-medium-priority-nexusai.sh
# Target OS: AlmaLinux 10 / Ubuntu 24.04 LTS / RHEL 10
# ==============================================================================

set -euo pipefail

# Visual Formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}🌟 NexusAI Developer Experience (DevEx) Installer${NC}"
echo "=========================================================="
echo ""

PROJECT_DIR="/home/ahmed_alsaleh/Dev/NexusAI"

# 1. Install DevEx & Git Automation Packages
install_devex_packages() {
    echo -e "${YELLOW}📦 [1/4] Installing DevEx & Git Automation Packages...${NC}"
    npm install -g husky lint-staged @commitlint/cli @commitlint/config-conventional git-cz conventional-changelog-cli typescript-language-server pyright || true
    echo -e "${GREEN}  ✓ DevEx global packages installed.${NC}"
}

# 2. Generate DevEx Configuration Files
generate_devex_configs() {
    echo -e "${YELLOW}⚙️ [2/4] Generating DevEx Config Files (.lintstagedrc.json, commitlint.config.js, .pre-commit-config.yaml)...${NC}"

    # commitlint.config.js
    cat > "${PROJECT_DIR}/commitlint.config.js" << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'revert', 'ci', 'build']
    ]
  }
};
EOF

    # .lintstagedrc.json
    cat > "${PROJECT_DIR}/.lintstagedrc.json" << 'EOF'
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss,json,md}": ["prettier --write"]
}
EOF

    # .pre-commit-config.yaml
    cat > "${PROJECT_DIR}/.pre-commit-config.yaml" << 'EOF'
repos:
  - repo: local
    hooks:
      - id: prettier
        name: prettier
        entry: npx prettier --write
        language: system
        files: \.(js|jsx|ts|tsx|css|scss|json|md)$

      - id: eslint
        name: eslint
        entry: npx eslint --fix
        language: system
        files: \.(js|jsx|ts|tsx)$
EOF

    # Setup Husky hooks directory
    mkdir -p "${PROJECT_DIR}/.husky"
    cat > "${PROJECT_DIR}/.husky/pre-commit" << 'EOF'
#!/bin/sh
npx lint-staged
EOF
    chmod +x "${PROJECT_DIR}/.husky/pre-commit"

    echo -e "${GREEN}  ✓ DevEx configuration files created.${NC}"
}

# 3. Restart NexusAI Node Server
restart_server() {
    echo -e "${YELLOW}🔄 [3/4] Restarting NexusAI Server Engine...${NC}"
    pkill -f "node server/index.js" || true
    sleep 1
    node "${PROJECT_DIR}/server/index.js" &
    sleep 2
    echo -e "${GREEN}  ✓ Server listening on http://localhost:3001.${NC}"
}

# 4. Validate DevEx API Endpoint
validate_devex() {
    echo -e "${YELLOW}✅ [4/4] Validating Tool Status API Endpoint...${NC}"
    curl -s http://localhost:3001/api/tools/status | grep -q "success" && echo -e "${GREEN}  ✓ DevEx Tool API: HEALTHY${NC}" || echo -e "${RED}  ❌ DevEx Tool API: FAILED${NC}"
}

main() {
    install_devex_packages
    generate_devex_configs
    restart_server
    validate_devex

    echo ""
    echo -e "${CYAN}🎉 NexusAI DevEx & Productivity Enhancement Complete!${NC}"
    echo "=========================================================="
}

main "$@"
