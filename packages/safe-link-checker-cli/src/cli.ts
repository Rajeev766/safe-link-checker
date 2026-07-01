#!/usr/bin/env node
/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { parseArgs } from 'util';
import { SafeLinkChecker, URLHausProvider, OpenPhishProvider } from 'safe-link-checker';
import type { CheckResult } from 'safe-link-checker';

class Spinner {
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private current = 0;
  private timer?: NodeJS.Timeout;
  private text = '';

  start(text: string) {
    this.text = text;
    this.timer = setInterval(() => {
      process.stdout.write(`\r\x1b[36m${this.frames[this.current++]}\x1b[0m ${this.text}`);
      this.current %= this.frames.length;
    }, 80);
  }

  stop(success: boolean, message?: string) {
    if (this.timer) clearInterval(this.timer);
    if (success) {
      process.stdout.write(`\r\x1b[32m✔\x1b[0m ${message || this.text}\n`);
    } else {
      process.stdout.write(`\r\x1b[31m✖\x1b[0m ${message || this.text}\n`);
    }
  }
  
  clear() {
    if (this.timer) clearInterval(this.timer);
    process.stdout.write('\r\x1b[K');
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      json: { type: 'boolean' },
      pretty: { type: 'boolean' },
      markdown: { type: 'boolean' },
      html: { type: 'boolean' },
      verbose: { type: 'boolean', short: 'v' },
      debug: { type: 'boolean' },
      silent: { type: 'boolean' },
      'no-color': { type: 'boolean' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(`
Usage: safe-link-checker <url> [options]

Options:
  --json       Output results in JSON format
  --pretty     Output in pretty JSON format
  --markdown   Output results in Markdown format
  --html       Output results in HTML format
  -v, --verbose  Output detailed check results and redirects
  --debug      Enable debug logging
  --silent     Suppress all output except errors
  --no-color   Disable colored output
  -h, --help     Show this help message
    `);
    process.exit(0);
  }

  const url = positionals[0] as string;
  const useColor = !values['no-color'] && !values.json && !values.pretty && !values.markdown && !values.html;
  
  // Coloring helpers
  const reset = useColor ? '\x1b[0m' : '';
  const red = useColor ? '\x1b[31m' : '';
  const green = useColor ? '\x1b[32m' : '';
  const yellow = useColor ? '\x1b[33m' : '';
  const bold = useColor ? '\x1b[1m' : '';

  const checker = new SafeLinkChecker()
    .use(new URLHausProvider())
    .use(new OpenPhishProvider());

  // Graceful shutdown handling
  let isShuttingDown = false;
  const handleShutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    if (!values.silent && !values.json && !values.pretty && !values.markdown && !values.html) {
      console.log(`\n${red}Verification interrupted by user. Shutting down gracefully...${reset}`);
    }
    process.exit(130);
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  const spinner = new Spinner();
  const shouldSpin = !values.silent && !values.json && !values.pretty && !values.markdown && !values.html && !values.debug;

  if (values.debug && !values.silent) {
    console.log(`[DEBUG] Initializing verification for: ${url}`);
  }

  if (shouldSpin) {
    spinner.start(`Analyzing ${url}...`);
  }

  try {
    const result = await checker.verify(url);

    if (shouldSpin) {
      spinner.clear();
    }
    
    if (values.debug && !values.silent) {
      console.log(`[DEBUG] Verification completed in ${result.metrics?.durationMs ?? 0}ms`);
    }

    if (values.silent) {
      process.exit(result.safe ? 0 : 1);
    }

    if (values.json || values.pretty) {
      console.log(JSON.stringify(result, null, values.pretty ? 2 : undefined));
      process.exit(result.safe ? 0 : 1);
    }

    if (values.markdown) {
      console.log(`# Security Report for ${result.url.original}`);
      console.log(`\n**Status:** ${result.safe ? 'Safe' : 'Unsafe'} (${result.riskLevel})`);
      console.log(`**Score:** ${result.riskScore}/100\n`);
      if (result.reasons.length > 0) {
        console.log(`## Reasons\n${result.reasons.map((r: string) => `- ${r}`).join('\n')}\n`);
      }
      if (result.recommendations.length > 0) {
        console.log(`## Recommendations\n${result.recommendations.map((r: string) => `- ${r}`).join('\n')}\n`);
      }
      process.exit(result.safe ? 0 : 1);
    }

    if (values.html) {
      console.log(`
<!DOCTYPE html>
<html>
<head><title>Security Report</title></head>
<body>
  <h1>Security Report for ${result.url.original}</h1>
  <p><strong>Status:</strong> ${result.safe ? 'Safe' : 'Unsafe'} (${result.riskLevel})</p>
  <p><strong>Score:</strong> ${result.riskScore}/100</p>
  ${result.reasons.length > 0 ? `<h2>Reasons</h2><ul>${result.reasons.map((r: string) => `<li>${r}</li>`).join('')}</ul>` : ''}
  ${result.recommendations.length > 0 ? `<h2>Recommendations</h2><ul>${result.recommendations.map((r: string) => `<li>${r}</li>`).join('')}</ul>` : ''}
</body>
</html>`);
      process.exit(result.safe ? 0 : 1);
    }

    let color = green;
    if (result.riskLevel === 'DANGEROUS') color = red;
    else if (result.riskLevel === 'SUSPICIOUS') color = yellow;

    console.log(`\n${bold}URL:${reset} ${result.url.original}`);
    if (result.url.original !== result.url.normalized) {
      console.log(`${bold}Normalized:${reset} ${result.url.normalized}`);
    }
    console.log(`${bold}Status:${reset} ${color}${result.riskLevel}${reset}`);
    console.log(`${bold}Score:${reset} ${result.riskScore}/100`);

    if (result.reasons && result.reasons.length > 0) {
      console.log(`\n${bold}Reasons:${reset}`);
      result.reasons.forEach((r: string) => console.log(`  - ${r}`));
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log(`\n${bold}Recommendations:${reset}`);
      result.recommendations.forEach((r: string) => console.log(`  - ${r}`));
    }

    if (values.verbose && result.checks) {
      console.log(`\n${bold}Checks Run:${reset}`);
      result.checks.forEach((c: CheckResult) => {
        const cColor = !useColor ? '' : (c.safe ? green : ((c.scoreImpact ?? 0) >= 50 ? red : yellow));
        console.log(`  - ${c.name}: ${cColor}${c.safe ? 'PASS' : 'FAIL'}${reset} (Impact: ${c.scoreImpact ?? 0})`);
      });

      if (result.redirectTrace && result.redirectTrace.chain.length > 1) {
        console.log(`\n${bold}Redirect Chain:${reset}`);
        result.redirectTrace.chain.forEach((link: string, idx: number) => {
          console.log(`  ${idx + 1}. ${link}`);
        });
      }
    }
    
    console.log('');
    process.exit(result.safe ? 0 : 1);
  } catch (error) {
    if (shouldSpin) spinner.clear();
    if (!values.silent) {
      console.error(`${red}Error checking URL:${reset}`, error);
    }
    process.exit(1);
  }
}

main();
