#!/usr/bin/env node
const path = require("path");

// Dynamically resolve relative to this file, ensuring global symlinks don't break requires
const exporterPath = path.join(__dirname, "../src/exporter.js");
const serverPath = path.join(__dirname, "../src/server.js");
const setupPath = path.join(__dirname, "../src/setup.js");

const { exportContext } = require(exporterPath);
const { runServer } = require(serverPath);
const chalk = require("chalk");

const args = process.argv.slice(2);

if (args.includes("--mcp")) {
    runServer().catch(console.error);
} else if (args.includes("--setup")) {
    const setup = require(setupPath);
    setup();
} else {
    const handoffMsg = args.filter(a => !a.startsWith("--")).join(" ");
    const cloudSync = args.includes("--cloud");
    
    exportContext(handoffMsg, cloudSync).catch(err => {
        console.error(chalk.red("Failed to export context:"), err);
        process.exit(1);
    });
}
