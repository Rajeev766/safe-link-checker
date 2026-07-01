import type { VerificationResult } from '@safe-link-checker/types';

export function formatResult(result: VerificationResult): string {
  const isBlocked = result.decision.toLowerCase() === 'block';
  const colorReset = '\x1b[0m';
  const colorTitle = '\x1b[1;34m'; // Bold Blue
  const colorSubtitle = '\x1b[1;37m'; // Bold White
  const colorGreen = '\x1b[32m';
  const colorRed = '\x1b[31m';
  const colorYellow = '\x1b[33m';
  const colorGray = '\x1b[90m';

  const decisionColor = isBlocked ? colorRed : result.decision.toLowerCase() === 'warn' ? colorYellow : colorGreen;
  const gradeColor = result.score.grade.startsWith('A') ? colorGreen : result.score.grade.startsWith('F') ? colorRed : colorYellow;

  const sep = `${colorGray}────────────────────────────────────────────${colorReset}`;

  let out = `
${sep}
${colorTitle}Safe Link Checker${colorReset}
${sep}

${colorSubtitle}URL${colorReset}
${result.url.original}

${colorSubtitle}Decision${colorReset}
${decisionColor}${result.decision.toUpperCase()}${colorReset}

${colorSubtitle}Classification${colorReset}
${result.classification.charAt(0).toUpperCase() + result.classification.slice(1)}

${colorSubtitle}Trust Score${colorReset}
${result.trustScore} / 100

${colorSubtitle}Risk Score${colorReset}
${result.riskScore} / 100

${colorSubtitle}Confidence${colorReset}
${result.confidence}%

${colorSubtitle}Grade${colorReset}
${gradeColor}${result.score.grade}${colorReset}

${colorSubtitle}Summary${colorReset}
${result.summary}

${colorSubtitle}${isBlocked ? 'Reasons' : 'Checks Passed'}${colorReset}
`;

  if (isBlocked) {
    const failures = result.evidence.filter(e => e.status === 'failed');
    if (failures.length > 0) {
      for (const f of failures) {
        out += `${colorRed}✗ ${f.title}${colorReset}\n`;
      }
    } else {
      out += `${colorRed}✗ Blocked by policy${colorReset}\n`;
    }
  } else {
    const passes = result.evidence.filter(e => e.status === 'passed');
    if (passes.length > 0) {
      for (const p of passes) {
        out += `${colorGreen}✓ ${p.title}${colorReset}\n`;
      }
    } else {
      out += `${colorGreen}✓ All checks passed${colorReset}\n`;
    }
  }

  out += `
${colorSubtitle}Recommendation${colorReset}
${result.recommendation}

${colorSubtitle}Runtime${colorReset}
${result.runtime}

${colorSubtitle}Verification Time${colorReset}
${result.performance.duration} ms

${colorSubtitle}Mode${colorReset}
${result.verification.mode.charAt(0).toUpperCase() + result.verification.mode.slice(1)} ${result.verification.engine.charAt(0).toUpperCase() + result.verification.engine.slice(1)}
${sep}
`;

  return out.trim();
}
