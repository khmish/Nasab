# MCP Setup for Nasab Family Tree Manager

This project is configured with Model Context Protocol (MCP) servers to enhance AI capabilities and data management.

## Configured MCP Servers

### 1. Memory Server (`@modelcontextprotocol/server-memory`)
- **Purpose**: Stores and retrieves family tree data, relationships, and genealogical information
- **Use Cases**:
  - Store family member profiles and biographical data
  - Maintain relationship mappings between family members
  - Cache family tree calculations and genealogical paths

### 2. Sequential Thinking Server (`@modelcontextprotocol/server-sequential-thinking`)
- **Purpose**: Enhances AI reasoning for complex family relationship analysis
- **Use Cases**:
  - Analyze complex family relationships and lineage
  - Generate comprehensive family histories and narratives
  - Resolve conflicting genealogical information

### 3. MySQL Server (`@xingyuchen/mysql-mcp-server`)
- **Purpose**: Provides persistent database storage for family data
- **Use Cases**:
  - Persistent storage of family member data
  - Complex querying of family relationships
  - Media file management for photos and documents
  - Full CRUD operations with transaction support

## Setup Instructions

### Quick Setup (Recommended)
Run the automated setup script:
```bash
./setup-mcp.sh
```

### Manual Setup

1. **Install MCP Servers**:
```bash
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-sequential-thinking
npm install -g @xingyuchen/mysql-mcp-server
```

2. **Configure Environment**:
```bash
cp .env.example .env
# Edit .env with your actual API keys and database configuration
```

3. **Set up MySQL (Optional)**:
```bash
# Install MySQL
brew install mysql  # macOS
sudo apt-get install mysql-server  # Ubuntu

# Start MySQL service
brew services start mysql  # macOS
sudo systemctl start mysql  # Ubuntu

# Create database
mysql -u root -e "CREATE DATABASE nasab_family;"
```

4. **Claude Code Configuration**:
The MCP servers are configured in `~/.config/claude-code/claude_code_config.json`

## Usage

Once configured, the MCP servers will be available in Claude Code sessions. Use `/help` to see available MCP tools and commands.

### Example Usage with MCP Tools:

- **Memory**: Ask Claude to "store this family relationship in memory"
- **Sequential Thinking**: Request "analyze the complex relationships in this family tree"
- **Database**: Query "find all descendants of person X in the database"

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key for AI generation
- `MYSQL_HOST`: MySQL server host (default: `localhost`)
- `MYSQL_PORT`: MySQL server port (default: `3306`)
- `MYSQL_USER`: MySQL username (default: `root`)
- `MYSQL_PASSWORD`: MySQL password (default: empty)
- `MYSQL_DATABASE`: MySQL database name (default: `nasab_family`)
- `MCP_MEMORY_ENABLED`: Enable memory server (default: true)
- `MCP_SEQUENTIAL_THINKING_ENABLED`: Enable sequential thinking server (default: true)
- `MCP_MYSQL_ENABLED`: Enable MySQL server (default: true)

## Troubleshooting

1. **MCP servers not loading**: Restart Claude Code after configuration
2. **Database connection issues**: Verify MySQL is running and database exists
3. **API errors**: Check your GEMINI_API_KEY is valid and properly configured

## Next Steps

1. Update your `.env` file with your actual GEMINI_API_KEY
2. Set up MySQL database if you want persistent storage
3. Restart Claude Code to load the MCP servers
4. Start using enhanced AI capabilities for family tree management!