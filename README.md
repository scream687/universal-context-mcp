# 📦 Universal Context MCP

A professional-grade context preservation engine for AI Agents (Gemini, Claude, etc.). This tool ensures zero knowledge loss when transitioning between sessions, environments, or agents.

## 🚀 One-Click Handoff

This suite provides a lossless context bridge by bundling your project state into a high-density Markdown package and automatically syncing it to your clipboard or the cloud.

### ✨ Key Features
- **Zero-Touch Setup:** One command to configure your global CLI environment.
- **Auto-Bootstrapping:** Agents automatically "re-animate" with the previous session's architectural intent.
- **Session Time Machine:** Local ledger tracks the evolution of your project decisions.
- **Precision Token Budgeting:** Calculates exact context pressure to prevent agent degradation.
- **Cloud Sync:** Securely upload context to private GitHub Gists for global portability.

## 📦 Installation

```bash
# 1. Install the engine globally
npm install -g universal-context-mcp

# 2. Auto-configure your CLI/Agent environment
context-save --setup
```

## 🛠 Usage

### Manual Export
Run this in any project root to copy context to your clipboard:
```bash
context-save "Brief description of current focus"
```

### Cloud Export
Move context between machines using private Gists:
```bash
context-save "Moving to home laptop" --cloud
```

### 📜 Mandatory Bootstrap Rule
Add this mandate to your project's `CLAUDE.md` or `GEMINI.md` to ensure every new session starts perfectly:

```markdown
## Core Mandates
- **Auto-Bootstrap:** At the start of EVERY new session, you MUST immediately call `bootstrap_session_context` to load the previous architectural intent and focus.
```

## 🏗 Suite Components
- `export-context.sh`: The core bash engine (zero-dependency).
- `context-save`: The global CLI tool.
- `universal-context-mcp`: The integrated MCP server for agentic automation.
- `shadow-sync.ts`: The architectural "mental model" persistent ledger.

---
Built for the next generation of AI-Native development.
