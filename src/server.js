const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { exportContext } = require("./exporter");
const fs = require("fs-extra");
const path = require("path");

const server = new Server(
  { name: "universal-context-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "export_session_context",
      description: "SAVE context: Aggregates project metadata, tree, diffs, and mental model to clipboard and ledger.",
      inputSchema: {
        type: "object",
        properties: {
          handoff_message: { type: "string", description: "Intent/Focus for next session." },
          cloud_sync: { type: "boolean", description: "Upload to private Gist." },
        },
      },
    },
    {
      name: "bootstrap_session_context",
      description: "LOAD context: Fetches the latest 'Shadow Context' from the ledger to resume work perfectly.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "export_session_context") {
    const msg = request.params.arguments?.handoff_message || "";
    const cloud = request.params.arguments?.cloud_sync || false;
    await exportContext(msg, cloud);
    return { content: [{ type: "text", text: "✅ Context saved and copied to clipboard." }] };
  }

  if (request.params.name === "bootstrap_session_context") {
    const ledgerPath = path.join(process.cwd(), ".session_checkpoints.jsonl");
    if (!fs.existsSync(ledgerPath)) return { content: [{ type: "text", text: "No session ledger found." }] };
    const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n");
    const last = JSON.parse(lines[lines.length - 1]);
    return { content: [{ type: "text", text: `🎯 RESUMING SESSION\n\nLast Intent (${last.timestamp}):\n> ${last.message}` }] };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

module.exports = { runServer };
