/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { PluginManager } from './plugin.js';
import { UrlValidationPlugin, IpValidationPlugin } from '@safe-link-checker/plugins/core/basic.js';
import { ShortenerPlugin, PunycodePlugin, HeuristicsPlugin } from '@safe-link-checker/plugins/core/heuristics.js';

export class DefaultPluginFactory {
  /**
   * Registers the core suite of verification plugins into the provided PluginManager.
   * This decoupled factory ensures the core orchestrator isn't tightly bound to concrete plugin implementations.
   */
  static registerCorePlugins(manager: PluginManager): void {
    manager.register(new UrlValidationPlugin());
    manager.register(new ShortenerPlugin());
    manager.register(new IpValidationPlugin());
    manager.register(new HeuristicsPlugin());
    manager.register(new PunycodePlugin());
  }
}
