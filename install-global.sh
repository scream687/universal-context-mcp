#!/bin/bash
# Global Installer for Universal Context Exporter

SCRIPT_PATH="/Users/rishabh/export-context.sh"
INSTALL_DIR="/usr/local/bin"
COMMAND_NAME="context-save"

echo "📦 Installing Universal Context Exporter globally as '$COMMAND_NAME'..."

# Ensure source script is executable
chmod +x "$SCRIPT_PATH"

# Create symlink
if [ -d "$INSTALL_DIR" ]; then
    sudo ln -sf "$SCRIPT_PATH" "$INSTALL_DIR/$COMMAND_NAME"
    echo "✅ Success! You can now use '$COMMAND_NAME' from any directory."
    echo "Usage: $COMMAND_NAME \"Handoff message here\" [--cloud]"
else
    echo "❌ Error: $INSTALL_DIR does not exist."
fi
