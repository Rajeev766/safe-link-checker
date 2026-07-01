import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

const files = {
  'CHANGELOG.md': `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Comprehensive URL Intelligence Engine
- Full cross-platform support (Node, Browser, React Native, Edge, Bun, Deno)
- Built-in heuristics for phishing and malware detection
- Configurable policies and rules engine
- Interactive playground and documentation site
`,
  'CODE_OF_CONDUCT.md': `# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the
  overall community

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.
`,
  'CONTRIBUTING.md': `# Contributing to safe-link-checker

First off, thank you for considering contributing to \`safe-link-checker\`! It's people like you that make it such a great tool.

## Development Setup

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/Rajeev766/safe-link-checker.git
   cd safe-link-checker
   \`\`\`

2. **Install dependencies**
   This project uses \`npm\` workspaces.
   \`\`\`bash
   npm install
   \`\`\`

3. **Build the packages**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Run tests**
   \`\`\`bash
   npm test
   \`\`\`

## Architecture

The project is structured as a monorepo:
- \`packages/core\`: The core engine, types, and base plugins.
- \`packages/node-runtime\`: Node.js specific implementations (DNS, full TLS).
- \`packages/browser-runtime\`: Lightweight fetch-based implementation.
- \`packages/safe-link-checker\`: The universal entry point that routes to the correct runtime.

## Submitting a Pull Request

1. Create a new branch: \`git checkout -b my-feature-branch\`
2. Make your changes and commit them following the [Conventional Commits](https://www.conventionalcommits.org/) specification.
3. Push to your fork and submit a pull request.
4. Ensure all CI checks pass (lint, test, build).

Thank you for contributing!
`
};

Object.entries(files).forEach(([relPath, content]) => {
  const fullPath = path.join(ROOT_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + relPath);
});

// Playground
const PLAYGROUND_DIR = path.join(ROOT_DIR, 'apps/playground');
const playgroundFiles = {
  'package.json': `{
  "name": "playground",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "safe-link-checker": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Safe Link Checker - Playground</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.6; }
      input { width: 100%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 20px; box-sizing: border-box; }
      button { padding: 12px 24px; font-size: 16px; background: #0070f3; color: white; border: none; border-radius: 8px; cursor: pointer; }
      button:hover { background: #0051a8; }
      .result { margin-top: 30px; padding: 20px; border-radius: 8px; display: none; }
      .safe { background: #e6ffed; border: 1px solid #acf2bd; }
      .danger { background: #ffeef0; border: 1px solid #ffdce0; }
      .warn { background: #fff8c5; border: 1px solid #e0c83a; }
      pre { background: #f6f8fa; padding: 16px; border-radius: 8px; overflow-x: auto; }
      .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; margin-bottom: 10px; }
    </style>
  </head>
  <body>
    <h1>🔗 Safe Link Checker Playground</h1>
    <p>Paste a URL below to test the offline heuristic engine directly in your browser.</p>
    
    <input type="url" id="urlInput" placeholder="https://example.com" />
    <button id="checkBtn">Verify Link</button>

    <div id="resultBox" class="result">
      <div id="badge" class="badge"></div>
      <h2 style="margin-top:0">Trust Score: <span id="score"></span>/100</h2>
      <p><strong>Decision:</strong> <span id="decision"></span></p>
      <p><strong>Classification:</strong> <span id="classification"></span></p>
      <p><strong>Summary:</strong> <span id="summary"></span></p>
      
      <h3>Evidence</h3>
      <pre><code id="evidence"></code></pre>
    </div>

    <script type="module">
      import { verifyLink } from 'safe-link-checker';

      const input = document.getElementById('urlInput');
      const btn = document.getElementById('checkBtn');
      const resultBox = document.getElementById('resultBox');

      btn.addEventListener('click', async () => {
        const url = input.value;
        if (!url) return;
        
        btn.disabled = true;
        btn.textContent = 'Checking...';

        try {
          const result = await verifyLink(url);
          
          resultBox.style.display = 'block';
          resultBox.className = 'result ' + (result.safe ? 'safe' : (result.decision === 'WARN' ? 'warn' : 'danger'));
          
          document.getElementById('badge').textContent = result.safe ? 'SAFE' : 'UNSAFE';
          document.getElementById('badge').style.background = result.safe ? '#28a745' : '#cb2431';
          document.getElementById('badge').style.color = 'white';
          
          document.getElementById('score').textContent = result.trustScore;
          document.getElementById('decision').textContent = result.decision;
          document.getElementById('classification').textContent = result.classification;
          document.getElementById('summary').textContent = result.summary;
          
          document.getElementById('evidence').textContent = JSON.stringify(result.evidence, null, 2);
        } catch (e) {
          alert('Error: ' + e.message);
        } finally {
          btn.disabled = false;
          btn.textContent = 'Verify Link';
        }
      });
    </script>
  </body>
</html>`
};

if (!fs.existsSync(PLAYGROUND_DIR)) {
  fs.mkdirSync(PLAYGROUND_DIR, { recursive: true });
}

Object.entries(playgroundFiles).forEach(([relPath, content]) => {
  const fullPath = path.join(PLAYGROUND_DIR, relPath);
  fs.writeFileSync(fullPath, content);
  console.log('Created apps/playground/' + relPath);
});
