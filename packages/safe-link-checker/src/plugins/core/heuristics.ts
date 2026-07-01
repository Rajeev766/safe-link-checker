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
  name = 'ShortenerDetection';
  type: PluginType = 'heuristic';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const res = validateShortener(ctx.normalizedUrl, ctx.options.customShorteners);
    ctx.state.isShortener = res.metadata?.isShortener === true;
    return { ...res, confidence: 95 };
  }
}

export class PunycodePlugin implements VerificationPlugin {
  name = 'PunycodeDetection';
  type: PluginType = 'heuristic';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.finalUrl || ctx.normalizedUrl;
    const res = validatePunycode(urlToTest);
    return { ...res, confidence: 100 };
  }
}

export class HeuristicsPlugin implements VerificationPlugin {
  name = 'GeneralHeuristics';
  type: PluginType = 'heuristic';
  version = '1.0.0';
  weight = 1.5; // Slightly higher weight

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const urlToTest = ctx.state.finalUrl || ctx.normalizedUrl;
    const res = validateHeuristics(urlToTest);
    return { ...res, confidence: 85 };
  }
}
