#!/usr/bin/env node
const path = require("path");

// Dynamically resolve relative to this file, ensuring global symlinks don't break requires
const exporterPath = path.join(__dirname, "../src/exporter.js");
const serverPath = path.join(__dirname, "../src/server.js");
const setupPath = path.join(__dirname, "../src/setup.js");
const loggerPath = path.join(__dirname, "../src/utils/logger.js");
const hookPath = path.join(__dirname, "../src/hook.js");

const { exportContext } = require(exporterPath);
const { runServer } = require(serverPath);
const { setDebug, setSilent, logger } = require(loggerPath);

const args = process.argv.slice(2);

// Configure Logger
if (args.includes("--debug")) setDebug(true);
if (args.includes("--silent")) setSilent(true);

if (args.includes("--mcp")) {
    runServer().catch(console.error);
} else if (args.includes("--setup")) {
    const setup = require(setupPath);
    setup();
} else if (args.includes("--install-hook")) {
    const installHook = require(hookPath);
    installHook();
} else {
    // Filter out flags from the handoff message
    const flagsToIgnore = ["--cloud", "--debug", "--silent", "--install-hook", "--setup", "--mcp"];
    const handoffMsg = args.filter(a => !flagsToIgnore.includes(a)).join(" ");
    const cloudSync = args.includes("--cloud");
    
    exportContext(handoffMsg, cloudSync).catch(err => {
        logger.error("Failed to export context:", err);
        process.exit(1);
    });
}
