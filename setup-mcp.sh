#!/bin/bash

# Nasab MCP Setup Script
echo "Setting up MCP servers for Nasab Family Tree Manager..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update your .env file with your actual GEMINI_API_KEY and database configuration"
fi

# Install MCP servers globally
echo "Installing MCP servers..."
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-sequential-thinking
npm install -g @xingyuchen/mysql-mcp-server

# Create Claude Code config directory
mkdir -p ~/.config/claude-code

# Check if Claude Code config exists
if [ ! -f ~/.config/claude-code/claude_code_config.json ]; then
    echo "Creating Claude Code configuration..."
    cat > ~/.config/claude-code/claude_code_config.json << 'EOF'
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "description": "Memory server for storing and retrieving family tree data"
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "description": "Sequential thinking server for enhanced AI reasoning about family relationships"
    },
    "mysql": {
      "command": "npx",
      "args": ["-y", "@xingyuchen/mysql-mcp-server"],
      "description": "MySQL server for persistent family data storage",
      "env": {
        "MYSQL_HOST": "localhost",
        "MYSQL_PORT": "3306",
        "MYSQL_USER": "root",
        "MYSQL_PASSWORD": "",
        "MYSQL_DATABASE": "nasab_family"
      }
    }
  }
}
EOF
else
    echo "Claude Code configuration already exists"
fi

echo "✅ MCP servers setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with your GEMINI_API_KEY"
echo "2. Set up MySQL database (optional):"
echo "   - Install MySQL"
echo "   - Create database: mysql -u root -e 'CREATE DATABASE nasab_family;'"
echo "3. Restart Claude Code to load MCP servers"
echo "4. Use /help to see available MCP tools"