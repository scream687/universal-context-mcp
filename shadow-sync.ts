import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SHADOW_CONTEXT_PATH = path.join(process.cwd(), 'SHADOW_CONTEXT.md');
const LOCAL_MEMORY_PATH = path.join(process.cwd(), 'MEMORY.md');
const CLAUDE_MD_PATH = path.join(process.cwd(), 'CLAUDE.md');

function getRecentCommits() {
    try {
        return execSync('git log -n 5 --pretty=format:"- %s (%h)"').toString();
    } catch (e) {
        return 'No git history found.';
    }
}

function getLocalMemory() {
    if (fs.existsSync(LOCAL_MEMORY_PATH)) {
        return fs.readFileSync(LOCAL_MEMORY_PATH, 'utf8');
    }
    return 'No local MEMORY.md found.';
}

function getCoreMandates() {
    if (fs.existsSync(CLAUDE_MD_PATH)) {
        const content = fs.readFileSync(CLAUDE_MD_PATH, 'utf8');
        const mandates = content.match(/## Core Mandates([\s\S]*?)(?=##|$)/);
        return mandates ? mandates[1].trim() : 'Mandates not found in CLAUDE.md';
    }
    return 'CLAUDE.md not found.';
}

async function shadowSync() {
    console.log('🔄 Shadow Syncing context...');

    let shadowContent = `# 🌑 SHADOW CONTEXT (Working Model)\n`;
    shadowContent += `*Last Synced: ${new Date().toLocaleString()}*\n\n`;

    shadowContent += `## 🎯 Current Focus\n`;
    shadowContent += `Project state preservation via Universal Context Exporter.\n\n`;

    shadowContent += `## 📜 Core Mandates (Active)\n`;
    shadowContent += `\`\`\`markdown\n${getCoreMandates()}\n\`\`\`\n\n`;

    shadowContent += `## 🧠 Mental Model & Truths\n`;
    shadowContent += `- **Persistence:** Syncing with local project memory.\n`;
    shadowContent += `- **Anti-Slop:** Ensuring all generated context is high-signal and evidence-based.\n\n`;

    shadowContent += `## 🏗️ Recent Architectural Changes\n`;
    shadowContent += `${getRecentCommits()}\n\n`;

    shadowContent += `## 📂 Local Memory Snapshot\n`;
    shadowContent += `\`\`\`markdown\n${getLocalMemory()}\n\`\`\`\n\n`;

    fs.writeFileSync(SHADOW_CONTEXT_PATH, shadowContent);
    console.log(`✅ Shadow Context updated at: ${SHADOW_CONTEXT_PATH}`);
}

shadowSync().catch(err => {
    console.error('Shadow Sync failed:', err);
    process.exit(1);
});
