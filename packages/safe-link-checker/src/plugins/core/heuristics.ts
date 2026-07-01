/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerificationPlugin, PluginContext, PluginType } from '../../core/plugin.js';
import { validateShortener } from '../../validators/shortener.js';
import { validatePunycode } from '../../validators/punycode.js';
import { validateHeuristics } from '../../validators/heuristic.js';
import type { CheckResult } from '../../types/index.js';

export class ShortenerPlugin implements VerificationPlugin {
  id = 'core:shortener';
  name = 'ShortenerDetection';
  version = '1.0.0';
  description = 'Detects if the URL is a known link shortener';
  author = 'SafeLink Team';
  type: PluginType = 'heuristic';
  capabilities = ['url-expansion', 'shortener-detection'];
  priority = 85;
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const res = validateShortener(ctx.normalizedUrl, ctx.options.customShorteners);
    ctx.state.isShortener = res.metadata?.isShortener === true;
    return { ...res, confidence: 95 };
  }
}

export class PunycodePlugin implements VerificationPlugin {
  id = 'core:punycode';
  name = 'PunycodeDetection';
  version = '1.0.0';
  description = 'Detects Punycode and homograph attacks in domains';
  author = 'SafeLink Team';
  type: PluginType = 'heuristic';
  capabilities = ['homograph-detection', 'punycode-analysis'];
  priority = 75;
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.finalUrl || ctx.normalizedUrl;
    const res = validatePunycode(urlToTest);
    return { ...res, confidence: 100 };
  }
}

export class HeuristicsPlugin implements VerificationPlugin {
  id = 'core:heuristics';
  name = 'GeneralHeuristics';
  version = '1.0.0';
  description = 'General URL heuristics like length and entropy';
  author = 'SafeLink Team';
  type: PluginType = 'heuristic';
  capabilities = ['entropy-analysis', 'pattern-matching'];
  priority = 70;
  weight = 1.5;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.finalUrl || ctx.normalizedUrl;
    const res = validateHeuristics(urlToTest);
    return { ...res, confidence: 85 };
  }
}
