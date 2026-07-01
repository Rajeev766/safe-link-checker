/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerificationPlugin, PluginContext, PluginType } from '../../core/plugin.js';
import { validateUrl } from '../../validators/url.js';
import { validateIp } from '../../validators/ip.js';
import { validateHttps } from '../../validators/https.js';
import type { CheckResult } from '../../types/index.js';

export class UrlValidationPlugin implements VerificationPlugin {
  name = 'UrlValidation';
  type: PluginType = 'network';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const res = validateUrl(ctx.normalizedUrl);
    // Set confidence high for basic structural checks
    return { ...res, confidence: 100, fatal: !res.safe };
  }
}

export class IpValidationPlugin implements VerificationPlugin {
  name = 'IpValidation';
  type: PluginType = 'network';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const res = validateIp(ctx.normalizedUrl);
    return { ...res, confidence: 100, fatal: !res.safe };
  }
}

export class HttpsValidationPlugin implements VerificationPlugin {
  name = 'HttpsValidation';
  type: PluginType = 'network';
  version = '1.0.0';
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    if (ctx.options.checkHttps === false) {
      return null;
    }
    const timeout = ctx.options.timeout ?? 5000;
    const res = await validateHttps(ctx.normalizedUrl, timeout, ctx.options.signal);
    return { ...res, confidence: 95 };
  }
}
