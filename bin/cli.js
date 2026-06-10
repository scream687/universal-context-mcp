#!/usr/bin/env node
const { exportContext } = require("../src/exporter");
const { runServer } = require("../src/server");
const chalk = require("chalk");

const args = process.argv.slice(2);

if (args.includes("--mcp")) {
    runServer().catch(console.error);
} else if (args.includes("--setup")) {
    require("../src/setup");
} else {
    const handoffMsg = args.filter(a => !a.startsWith("--")).join(" ");
    const cloudSync = args.includes("--cloud");
    
    exportContext(handoffMsg, cloudSync).catch(err => {
        console.error(chalk.red("Failed to export context:"), err);
        process.exit(1);
    });
}
