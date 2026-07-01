#!/usr/bin/env node
/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { parseArgs } from 'util';
import { SafeLinkChecker } from './checker.js';
import type { CheckResult } from './types/index.js';
import { URLHausProvider } from './providers/urlhaus.js';
import { OpenPhishProvider } from './providers/openphish.js';

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      json: { type: 'boolean' },
      verbose: { type: 'boolean', short: 'v' },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
  });

  if (values.help || positionals.length === 0) {
    console.log(`
Usage: safe-link-checker <url> [options]

Options:
  --json       Output results in JSON format
  -v, --verbose  Output detailed check results and redirects
  -h, --help     Show this help message
    `);
    process.exit(0);
  }

  const url = positionals[0] as string;

  const checker = new SafeLinkChecker()
    .use(new URLHausProvider())
    .use(new OpenPhishProvider());

  try {
    const result = await checker.verify(url);

    if (values.json) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.safe ? 0 : 1);
    }

    // Colored output
    const reset = '\x1b[0m';
    const red = '\x1b[31m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const bold = '\x1b[1m';

    let color = green;
    if (result.riskLevel === 'DANGEROUS') color = red;
    else if (result.riskLevel === 'SUSPICIOUS') color = yellow;

    console.log(`\n${bold}URL:${reset} ${result.url}`);
    if (result.url !== result.normalizedUrl) {
      console.log(`${bold}Normalized:${reset} ${result.normalizedUrl}`);
    }
    console.log(`${bold}Status:${reset} ${color}${result.riskLevel}${reset}`);
    console.log(`${bold}Score:${reset} ${result.score}/100`);

    if (result.reasons.length > 0) {
      console.log(`\n${bold}Reasons:${reset}`);
      result.reasons.forEach((r: string) => console.log(`  - ${r}`));
    }

    if (result.recommendations.length > 0) {
      console.log(`\n${bold}Recommendations:${reset}`);
      result.recommendations.forEach((r: string) => console.log(`  - ${r}`));
    }

    if (values.verbose) {
      console.log(`\n${bold}Checks Run:${reset}`);
      result.checks.forEach((c: CheckResult) => {
        const cColor = c.safe ? green : (c.scoreImpact >= 50 ? red : yellow);
        console.log(`  - ${c.name}: ${cColor}${c.safe ? 'PASS' : 'FAIL'}${reset} (Impact: ${c.scoreImpact})`);
      });

      if (result.redirectTrace.chain.length > 1) {
        console.log(`\n${bold}Redirect Chain:${reset}`);
        result.redirectTrace.chain.forEach((link: string, idx: number) => {
          console.log(`  ${idx + 1}. ${link}`);
        });
      }
    }
    
    console.log('');
    process.exit(result.safe ? 0 : 1);
  } catch (error) {
    console.error(`\x1b[31mError checking URL:\x1b[0m`, error);
    process.exit(1);
  }
}

main();
