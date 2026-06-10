<div align="center">
  
# 📦 Universal Context MCP
**The God-Tier Context Preservation Engine for AI Agents**

[![npm version](https://badge.fury.io/js/universal-context-mcp.svg)](https://badge.fury.io/js/universal-context-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

*Zero knowledge loss when transitioning between sessions, environments, or agents.*

</div>

<br />

## 🎯 The Problem
You start a new session with an AI agent (Claude, Gemini, etc.). It spends the first 20 minutes reading files, guessing your architecture, and asking questions you already answered yesterday. 

## ⚡ The Solution
**Universal Context MCP** creates a lossless context bridge. It bundles your project state, uncommitted changes, and architectural intent into a high-density package that "re-animates" any new agent instantly.

---

## ✨ Features

- 🏎️ **Zero-Touch Setup:** One command auto-configures your global Claude/CLI environment.
- 🧠 **Auto-Bootstrapping:** Agents automatically load the previous session's exact focus and blockers.
- 🕰️ **Session Time Machine:** A local `.session_checkpoints.jsonl` ledger tracks the evolution of your project decisions.
- ⚖️ **Precision Token Budgeting:** Calculates exact context pressure to prevent agent degradation.
- ☁️ **Cloud Sync:** Securely upload context to private GitHub Gists for global cross-machine portability.

---

## 📦 Installation

```bash
# 1. Install the engine globally
npm install -g universal-context-mcp

# 2. Auto-configure your CLI/Agent environment
context-save --setup
```
*(The setup command automatically injects the MCP server into your global `.claude.json` or equivalent).*

---

## 🛠 Usage

### 1. Manual Export (The "Save State")
Run this in any project root to grab a high-density snapshot and copy it directly to your clipboard:
```bash
context-save "Brief description of current focus or blockers"
```

### 2. Cloud Export (Cross-Machine)
Moving from your desktop to your laptop? Use a secure GitHub Gist:
```bash
context-save "Moving to home laptop" --cloud
```

### 3. Agentic Handoff (The "Auto-Bootstrap")
Add this Ironclad Mandate to your project's `CLAUDE.md` or `GEMINI.md`:

```markdown
## Core Mandates
- **Auto-Bootstrap:** At the start of EVERY new session, you MUST immediately call `bootstrap_session_context` to load the previous architectural intent and focus.
```
When a new agent boots up, it will read this rule, call the MCP tool, and instantly resume your work exactly where you left off.

### 4. The Autopilot Hook (Zero-Effort Background Sync)
Never forget to save context again. Run this once per project to install a Git hook that silently updates your context in the background every time you commit:
```bash
context-save --install-hook
```

### 5. Debug Mode
If you need to trace execution speed, path resolution, or token count math, use the debug flag:
```bash
context-save --debug
```

---

## 🏗 How It Works Under The Hood

When invoked, the exporter intelligently bundles:
1.  **Environment:** OS and Path.
2.  **Shadow Context:** The manual intent or handoff note.
3.  **Active Changes:** A lightweight `git diff --stat`.
4.  **Structure:** A depth-limited, noise-filtered directory tree.
5.  **History:** The last 5 `git log` entries.
6.  **Core Files:** Automatic injection of `README.md`, `CLAUDE.md`, `package.json`, etc.

<br />

<div align="center">
  <i>Built for the next generation of AI-Native development.</i>
</div>
