const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const os = require('os');

const CLAUDE_CONFIG_PATH = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
const CLAUDE_CONFIG_PATH_ALT = path.join(os.homedir(), '.claude.json');

async function setup() {
    console.log(chalk.blue("🛠 Setting up Universal Context MCP..."));

    const mcpConfig = {
        "command": "npx",
        "args": ["-y", "universal-context-mcp", "--mcp"],
        "description": "Hardcore Context Preservation & Auto-Bootstrapping"
    };

    const targetPaths = [CLAUDE_CONFIG_PATH, CLAUDE_CONFIG_PATH_ALT];
    let success = false;

    for (const configPath of targetPaths) {
        try {
            if (fs.existsSync(configPath)) {
                const config = fs.readJsonSync(configPath);
                config.mcpServers = config.mcpServers || {};
                config.mcpServers["universal-context"] = mcpConfig;
                fs.writeJsonSync(configPath, config, { spaces: 2 });
                console.log(chalk.green(`✅ Updated: ${configPath}`));
                success = true;
            }
        } catch (e) {
            console.error(chalk.red(`Failed to update ${configPath}:`), e.message);
        }
    }

    if (!success) {
        console.log(chalk.yellow("⚠️ No global Claude config found. Please manually add the MCP server."));
    }

    console.log(chalk.blue("\nNext Steps:"));
    console.log("1. Run " + chalk.cyan("npx universal-context-mcp --setup") + " any time to refresh settings.");
    console.log("2. In your projects, add the bootstrap rule to " + chalk.bold("CLAUDE.md") + " or " + chalk.bold("GEMINI.md") + ".");
}

setup().catch(console.error);
module.exports = setup;
