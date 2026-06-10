const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

const IGNORE_DIRS = [".git", "node_modules", ".next", "dist", "build", "venv", ".venv", "__pycache__", ".Trash", "Library", "Applications"];
const CORE_FILES = ["README.md", "GEMINI.md", "CLAUDE.md", "CONTEXT.md", "package.json", "Cargo.toml", "requirements.txt", "go.mod", "tsconfig.json", "next.config.js", "next.config.ts"];

function getDirectoryTree(dir, prefix = "", depth = 0) {
    if (depth > 3) return `${prefix}└── ... (max depth)\n`;
    let result = "";
    let items = [];
    try {
        items = fs.readdirSync(dir).filter(item => !IGNORE_DIRS.includes(item) && !item.startsWith("."));
        items.sort();
    } catch (e) {
        return `${prefix} [Permission Denied]\n`;
    }

    items.forEach((item, index) => {
        const filePath = path.join(dir, item);
        const isLast = index === items.length - 1;
        const stats = fs.statSync(filePath);
        
        result += `${prefix}${isLast ? "└── " : "├── "}${item}\n`;
        if (stats.isDirectory()) {
            result += getDirectoryTree(filePath, prefix + (isLast ? "    " : "│   "), depth + 1);
        }
    });
    return result;
}

function getGitDiff() {
    try { return execSync('git diff --stat', { stdio: 'pipe' }).toString(); } catch (e) { return ""; }
}

function getGitLog() {
    try { return execSync('git log -n 5 --oneline', { stdio: 'pipe' }).toString(); } catch (e) { return ""; }
}

function getCoreMandates() {
    const claudePath = path.join(process.cwd(), 'CLAUDE.md');
    if (fs.existsSync(claudePath)) {
        const content = fs.readFileSync(claudePath, 'utf8');
        const mandates = content.match(/## Core Mandates([\s\S]*?)(?=##|$)/);
        return mandates ? mandates[1].trim() : 'Mandates not found in CLAUDE.md';
    }
    return 'CLAUDE.md not found.';
}

function getLocalMemory() {
    const memoryPath = path.join(process.cwd(), 'MEMORY.md');
    if (fs.existsSync(memoryPath)) {
        return fs.readFileSync(memoryPath, 'utf8');
    }
    return 'No local MEMORY.md found.';
}

async function exportContext(handoffMsg = "", cloudSync = false) {
    const outputFileName = "_SESSION_CONTEXT.md";
    const ledgerFile = ".session_checkpoints.jsonl";
    
    console.log(chalk.blue("🚀 Gathering universal project context..."));

    // 1. Ledger Persistence
    if (handoffMsg) {
        const entry = JSON.stringify({ timestamp: new Date().toISOString(), message: handoffMsg });
        fs.appendFileSync(path.join(process.cwd(), ledgerFile), entry + "\n");
    }

    let content = `# 📦 PROJECT CONTEXT EXPORT\n*Generated on: ${new Date().toLocaleString()}*\n\n`;

    if (handoffMsg) {
        content += `## 🌑 SHADOW CONTEXT (Handoff Note)\n> **Message:** ${handoffMsg}\n\n`;
    }

    content += `## 📜 Core Mandates (Active)\n\`\`\`markdown\n${getCoreMandates()}\n\`\`\`\n\n`;

    content += `## 🧠 Mental Model & Truths\n- **Persistence:** Syncing with local MEMORY.md and .session_checkpoints.jsonl\n- **Auto-Bootstrap:** Ready for next agent initialization.\n\n`;

    content += `## 📂 Local Memory Snapshot\n\`\`\`markdown\n${getLocalMemory()}\n\`\`\`\n\n`;

    content += `## 🆘 LAST RESORT CONTEXT RULE\n> **Mandate:** When nearing token limits, the active agent MUST emit a compressed 'Shadow Context' summary into this file before exiting.\n\n`;

    const diff = getGitDiff();
    if (diff) {
        content += `## 🛠️ Active Changes (Uncommitted)\n\`\`\`diff\n${diff}\n\`\`\`\n\n`;
    }

    content += `## 📁 Directory Structure\n\`\`\`\n${path.basename(process.cwd())}\n${getDirectoryTree(process.cwd())}\`\`\`\n\n`;

    const log = getGitLog();
    if (log) {
        content += `## 🔄 Recent Git History\n\`\`\`\n${log}\`\`\`\n\n`;
    }

    content += `## 📄 Core Context Files\n\n`;
    for (const file of CORE_FILES) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            content += `### ${file}\n\`\`\`\n${fs.readFileSync(filePath, 'utf8')}\n\`\`\`\n\n`;
        }
    }

    // Token Weight Estimation
    const estTokens = Math.floor(content.length / 4);
    content = content.replace("## 🧠 Mental Model", `## ⚖️ Token Weight Estimation\n- **Estimated Export Size:** ~${estTokens} tokens\n\n## 🧠 Mental Model`);

    fs.writeFileSync(path.join(process.cwd(), outputFileName), content);
    
    // Clipboard (macOS)
    if (process.platform === 'darwin') {
        try {
            execSync(`pbcopy < ${outputFileName}`);
            console.log(chalk.green("📋 Clipboard Sync: Contents copied!"));
        } catch (e) {}
    }

    // Cloud Sync (Gist)
    if (cloudSync) {
        try {
            console.log(chalk.cyan("☁️ Uploading to private GitHub Gist..."));
            const gistUrl = execSync(`gh gist create ${outputFileName} -p -d "Session Context: ${new Date().toISOString()}" | tail -n 1`).toString().trim();
            console.log(chalk.cyan(`🔗 Gist Link: ${gistUrl}`));
            fs.appendFileSync(path.join(process.cwd(), outputFileName), `\n\n🔗 Gist Link: ${gistUrl}`);
            if (process.platform === 'darwin') execSync(`pbcopy < ${outputFileName}`);
        } catch (e) {
            console.log(chalk.red("❌ Cloud sync failed. Ensure 'gh' CLI is installed and authenticated."));
        }
    }

    console.log(chalk.green(`✅ Context exported to: ${outputFileName}`));
    return content;
}

module.exports = { exportContext };
