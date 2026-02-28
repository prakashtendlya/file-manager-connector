import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';

// 1. Initialize the Brain
const server = new McpServer({
    name: "file-manager",
    version: "1.0.0"
});

// 2. The Bridge (Axios helper)
async function makeApiRequest(url, method, content = null) {
    try {
        console.error(`[Bridge] Sending ${method} to ${url}`);
        const response = await axios({
            method: method,
            url: url,
            // Ensure we send content as an object for POST/PUT
            data: (method === 'POST' || method === 'PUT') ? { content: content || '' } : null
        });
        return {
            statusCode: response.status,
            body: response.data
        };
    } catch (error) {
        console.error(`[Bridge Error] ${error.message}`);
        return {
            statusCode: error.response?.status || 500,
            body: error.response?.data || error.message
        };
    }
}

// 3. Register the Tools
server.tool(
    "create_file",
    "Creates a new file with the given content.",
    {
        filename: z.string().min(1),
        content: z.string().optional()
    },
    async ({ filename, content = '' }) => {
        console.error(`[DEBUG] Tool create_file called for: ${filename}`);
        const url = `http://localhost:3000/files/${filename}`;
        const response = await makeApiRequest(url, 'POST', content);
        return {
            content: [{ type: "text", text: JSON.stringify(response.body) }]
        };
    }
);

server.tool(
    "list_files",
    "Lists all files in the target directory.",
    {},
    async () => {
        console.error(`[DEBUG] Tool list_files called`);
        const url = `http://localhost:3000/files`;
        const response = await makeApiRequest(url, 'GET');

        // Extract the files array from the response body
        const files = response.body.files || [];
        const fileList = files.length > 0 ? files.join('\n') : "No files found.";

        return {
            content: [{ type: "text", text: fileList }]
        };
    }
);

server.tool(
    "read_file",
    "Reads the content of a file from the target directory.",
    {
        filename: z.string().min(1)
    },
    async ({ filename }) => {
        console.error(`[DEBUG] Tool read_file called for: ${filename}`);
        const url = `http://localhost:3000/files/${filename}`;
        const response = await makeApiRequest(url, 'GET');

        // Extract content if available, otherwise return raw body
        const textContent = response.body.content || JSON.stringify(response.body);

        return {
            content: [{ type: "text", text: textContent }]
        };
    }
);

server.tool(
    "update_file",
    "Updates (overwrites) an existing file with new content.",
    {
        filename: z.string().min(1),
        content: z.string()
    },
    async ({ filename, content }) => {
        console.error(`[DEBUG] Tool update_file called for: ${filename}`);
        const url = `http://localhost:3000/files/${filename}`;
        const response = await makeApiRequest(url, 'PUT', content);
        return {
            content: [{ type: "text", text: JSON.stringify(response.body) }]
        };
    }
);

server.tool(
    "delete_file",
    "Deletes a file from the target directory.",
    {
        filename: z.string().min(1)
    },
    async ({ filename }) => {
        console.error(`[DEBUG] Tool delete_file called for: ${filename}`);
        const url = `http://localhost:3000/files/${filename}`;
        const response = await makeApiRequest(url, 'DELETE');
        return {
            content: [{ type: "text", text: JSON.stringify(response.body) }]
        };
    }
);

// 4. Connect to the Communication Pipe (Stdio)
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 MCP Connector is listening...");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
