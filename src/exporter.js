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
    try {
        return execSync('git diff --stat', { stdio: 'pipe' }).toString();
    } catch (e) {
        return "";
    }
}

function getGitLog() {
    try {
        return execSync('git log -n 5 --oneline', { stdio: 'pipe' }).toString();
    } catch (e) {
        return "";
    }
}

async function exportContext(handoffMsg = "", cloudSync = false) {
    const outputFileName = "_SESSION_CONTEXT.md";
    const ledgerFile = ".session_checkpoints.jsonl";
    
    console.log(chalk.blue("🚀 Gathering universal project context..."));

    // 1. Ledger
    if (handoffMsg) {
        const entry = JSON.stringify({ timestamp: new Date().toISOString(), message: handoffMsg });
        fs.appendFileSync(path.join(process.cwd(), ledgerFile), entry + "\n");
    }

    let content = `# 📦 PROJECT CONTEXT EXPORT\n*Generated on: ${new Date().toLocaleString()}*\n\n`;

    if (handoffMsg) {
        content += `## 🌑 SHADOW CONTEXT (Handoff Note)\n> **Message:** ${handoffMsg}\n\n`;
    }

    content += `## 🆘 LAST RESORT CONTEXT RULE\n> **Mandate:** When nearing token limits, the active agent MUST emit a compressed 'Shadow Context' summary into this file before exiting.\n\n`;

    content += `## 🖥️ Environment\n- **OS:** ${process.platform}\n- **Path:** ${process.cwd()}\n\n`;

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
        if (fs.existsSync(file)) {
            content += `### ${file}\n\`\`\`\n${fs.readFileSync(file, 'utf8')}\n\`\`\`\n\n`;
        }
    }

    // Token Weight Calculation
    const estTokens = Math.floor(content.length / 4);
    content = content.replace("## 🖥️ Environment", `## ⚖️ Token Weight Estimation\n- **Estimated Export Size:** ~${estTokens} tokens\n\n## 🖥️ Environment`);

    fs.writeFileSync(outputFileName, content);
    
    // Clipboard
    try {
        if (process.platform === 'darwin') {
            execSync(`pbcopy < ${outputFileName}`);
            console.log(chalk.green("📋 Clipboard Sync: Contents copied!"));
        }
    } catch (e) {}

    // Cloud
    if (cloudSync) {
        try {
            console.log(chalk.cyan("☁️ Uploading to private GitHub Gist..."));
            const gistUrl = execSync(`gh gist create ${outputFileName} -p -d "Session Context: ${new Date().toISOString()}" | tail -n 1`).toString().trim();
            console.log(chalk.cyan(`🔗 Gist Link: ${gistUrl}`));
            fs.appendFileSync(outputFileName, `\n\n🔗 Gist Link: ${gistUrl}`);
            if (process.platform === 'darwin') execSync(`pbcopy < ${outputFileName}`);
        } catch (e) {
            console.log(chalk.red("❌ Cloud sync failed. Ensure 'gh' CLI is installed."));
        }
    }

    console.log(chalk.green(`✅ Context exported to: ${outputFileName}`));
    return content;
}

module.exports = { exportContext };
