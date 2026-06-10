#!/bin/bash
# Universal Context Exporter
# Run this in the root of ANY project to generate a portable context markdown file and copy it to clipboard.

OUTPUT_FILE="_SESSION_CONTEXT.md"
LEDGER_FILE=".session_checkpoints.jsonl"
echo "🚀 Gathering universal project context..."

# 0. Handle Cloud Upload and Ledger
HANDOFF_MSG="$1"
UPLOAD_CLOUD=false
if [[ "$*" == *"--cloud"* ]]; then
    UPLOAD_CLOUD=true
    # Filter out the flag from the handoff message
    HANDOFF_MSG="${HANDOFF_MSG//--cloud/}"
fi

# Append to local ledger if message exists
if [ ! -z "$HANDOFF_MSG" ]; then
    echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"message\": \"$HANDOFF_MSG\"}" >> "$LEDGER_FILE"
fi

# 1. Initialize Document
echo "# 📦 PROJECT CONTEXT EXPORT" > "$OUTPUT_FILE"
echo "*Generated on: $(date)*" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1.5 Shadow Context (Manual or Agent Handoff)
if [ ! -z "$HANDOFF_MSG" ]; then
    echo "## 🌑 SHADOW CONTEXT (Handoff Note)" >> "$OUTPUT_FILE"
    echo "> **Message:** $HANDOFF_MSG" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# 1.8 Token Weight Estimation (High Precision)
echo "## ⚖️ Token Weight Estimation" >> "$OUTPUT_FILE"
# Only count chars of files we actually read
TEMP_FILE=$(mktemp)
for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then cat "$file" >> "$TEMP_FILE"; fi
done
# Include the tree and env info for accuracy
TOTAL_CHARS=$(cat "$OUTPUT_FILE" "$TEMP_FILE" | wc -c)
rm "$TEMP_FILE"

EST_TOKENS=$((TOTAL_CHARS / 4))
echo "- **Estimated Export Size:** ~$EST_TOKENS tokens" >> "$OUTPUT_FILE"
if [ $EST_TOKENS -gt 150000 ]; then
    echo "- **⚠️ WARNING:** Context is heavy (>150k). Consider pruning or using /context-budget." >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

echo "## 🆘 LAST RESORT CONTEXT RULE" >> "$OUTPUT_FILE"
echo "> **Mandate:** When nearing token limits, the active agent MUST emit a compressed 'Shadow Context' summary (Focus, Goals, Blockers) into this file before exiting. This ensures the next session picks up with zero knowledge loss." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 2. Environment Info
echo "## 🖥️ Environment" >> "$OUTPUT_FILE"
echo "- **OS:** $(uname -s)" >> "$OUTPUT_FILE"
echo "- **Path:** $(pwd)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 2.5 Active Changes (Git Diff Summary)
if [ -d ".git" ]; then
    echo "## 🛠️ Active Changes (Uncommitted)" >> "$OUTPUT_FILE"
    echo "\`\`\`diff" >> "$OUTPUT_FILE"
    git diff --stat >> "$OUTPUT_FILE" 2>/dev/null
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# 3. Directory Tree (Max depth 3, ignoring noise)
echo "## 📁 Directory Structure" >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
python3 -c '
import os
ignore = {".git", "node_modules", ".next", "dist", "build", "venv", ".venv", "__pycache__", ".Trash", "Library", "Applications"}
def tree(dir_path, prefix="", depth=0):
    if depth > 3:
        print(prefix + "└── ... (max depth)")
        return
    try:
        items = [d for d in os.listdir(dir_path) if d not in ignore and not d.startswith(".")]
        items.sort()
    except PermissionError:
        print(prefix + " [Permission Denied]")
        return
    for i, item in enumerate(items):
        path = os.path.join(dir_path, item)
        is_last = (i == len(items) - 1)
        print(prefix + ("└── " if is_last else "├── ") + item)
        if os.path.isdir(path):
            tree(path, prefix + ("    " if is_last else "│   "), depth + 1)
print(os.path.basename(os.path.abspath(".")))
tree(".")
' >> "$OUTPUT_FILE"
echo "\`\`\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 4. Git Context (if applicable)
if [ -d ".git" ]; then
    echo "## 🔄 Recent Git History" >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    git log -n 5 --oneline 2>/dev/null || echo "No commits yet." >> "$OUTPUT_FILE"
    echo "\`\`\`" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
fi

# 5. Core Configuration & AI Instruction Files
echo "## 📄 Core Context Files" >> "$OUTPUT_FILE"
CORE_FILES=("README.md" "GEMINI.md" "CLAUDE.md" "CONTEXT.md" "package.json" "Cargo.toml" "requirements.txt" "go.mod" "tsconfig.json" "next.config.js" "next.config.ts")

for file in "${CORE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "### $file" >> "$OUTPUT_FILE"
        echo "\`\`\`" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "\`\`\`" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "✅ Context exported to: $OUTPUT_FILE"

# 6. Clipboard Integration (macOS)
if command -v pbcopy &> /dev/null; then
    cat "$OUTPUT_FILE" | pbcopy
    echo "📋 Clipboard Sync: Contents copied!"
fi

# 7. Cloud Sync (Optional)
if [ "$UPLOAD_CLOUD" = true ]; then
    if command -v gh &> /dev/null; then
        echo "☁️ Uploading to private GitHub Gist..."
        GIST_URL=$(gh gist create "$OUTPUT_FILE" -p -d "Session Context: $(date)" | tail -n 1)
        echo "🔗 Gist Link: $GIST_URL"
        # Re-append link to clipboard
        echo -e "\n🔗 Gist Link: $GIST_URL" >> "$OUTPUT_FILE"
        cat "$OUTPUT_FILE" | pbcopy
    else
        echo "❌ Error: 'gh' CLI not found. Please install GitHub CLI to use --cloud."
    fi
fi
