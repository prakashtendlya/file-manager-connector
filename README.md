# File Manager MCP Server

A custom Model Context Protocol (MCP) server that allows Claude to manage files on your local machine within a safe `target/` directory.

## Features
- **Create File**: Create new files with specific content.
- **Read File**: Retrieve content from existing files.
- **Update File**: Overwrite existing files with new content.
- **Delete File**: Remove files from the storage directory.

## Architecture
This project uses a two-layer approach:
1. **Express API (`index.js`)**: A local web server running on Port 3000 that performs physical disk operations.
2. **MCP Connector (`mcp_server.js`)**: A bridge that speaks the Model Context Protocol over `stdio` and communicates with the Express API using Axios.

---

## Setup Instructions

### 1. Install Dependencies
Ensure you are in the project directory and run:
```bash
npm install
```

### 2. Start the Express API
The worker process must be running in a terminal for the tools to function:
```bash
node index.js
```
*You should see: `Server is running on port 3000`*

### 3. Configure Claude Desktop
Add the server to your `claude_desktop_config.json` file (typically located at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).

```json
{
  "mcpServers": {
    "file-manager": {
      "command": "/path/to/your/node",
      "args": ["/path/to/your/project/file-manager-connector/mcp_server.js"],
      "env": {
        "NODE_PATH": "/path/to/your/project/file-manager-connector/node_modules"
      }
    }
  }
}
```
*Note: Ensure the `command` path matches your local `node` path (run `which node` to verify).*

---

## Testing

You can verify the connection manually using the provided `commands.jsonl` file:

```bash
(cat commands.jsonl; sleep 1) | node mcp_server.js
```

This will simulate a full lifecycle (Create -> Update -> Read -> Delete) and output the JSON-RPC results to your terminal.

## Safety Note
All file operations are restricted to the `target/` folder inside this project directory to prevent accidental modification of system files.