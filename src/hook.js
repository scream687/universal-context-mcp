const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./utils/logger');

const HOOK_SCRIPT = `#!/bin/bash
# Universal Context MCP - Autopilot Hook
# Automatically saves context in the background on commit.
if command -v context-save &> /dev/null; then
    context-save "Autopilot: Post-commit save" --silent &
elif command -v npx &> /dev/null; then
    npx universal-context-mcp "Autopilot: Post-commit save" --silent &
fi
`;

async function installHook() {
    logger.info("🛠 Installing Autopilot Git Hook...");
    
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) {
        logger.error("❌ Not a Git repository. Please run this inside a project with git initialized.");
        return;
    }

    const hooksDir = path.join(gitDir, 'hooks');
    fs.ensureDirSync(hooksDir);

    const postCommitPath = path.join(hooksDir, 'post-commit');
    
    try {
        if (fs.existsSync(postCommitPath)) {
            const currentContent = fs.readFileSync(postCommitPath, 'utf8');
            if (currentContent.includes('universal-context-mcp') || currentContent.includes('context-save')) {
                logger.success("✅ Autopilot hook is already installed.");
                return;
            }
            logger.debug("Appending to existing post-commit hook.");
            fs.appendFileSync(postCommitPath, `\n${HOOK_SCRIPT}`);
        } else {
            logger.debug("Creating new post-commit hook.");
            fs.writeFileSync(postCommitPath, HOOK_SCRIPT);
        }

        // Make executable
        fs.chmodSync(postCommitPath, '755');
        logger.success("✅ Autopilot enabled! Context will now save silently in the background on every commit.");
    } catch (err) {
        logger.error("❌ Failed to install hook:", err);
    }
}

module.exports = installHook;
