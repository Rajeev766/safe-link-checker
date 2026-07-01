/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { VerifyOptions, CheckResult, RedirectAnomalyKind } from '../types/index.js';

export type PluginType = 'network' | 'content' | 'heuristic' | 'provider';

export interface RedirectTrace {
  finalUrl: string;
  redirectCount: number;
  chain: string[];
  anomalies: RedirectAnomalyKind[];
}

export interface PluginState {
  finalUrl?: string;
  isShortener?: boolean;
  redirectTrace?: RedirectTrace;
  [key: string]: unknown;
}

export interface PluginContext {
  url: string;
  normalizedUrl: string;
  options: VerifyOptions;
  state: PluginState; // Shared state across plugins during a single verification run
}

export interface VerificationPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  capabilities: string[];
  priority: number;
  weight?: number; // Defines how much this plugin impacts the final score
  
  /** 
   * Initialization hook (e.g. connecting to DB, setting up local models) 
   */
  initialize?(): Promise<void>;

  /**
   * Main execution hook. 
   * Returns a CheckResult or null if the plugin decides to skip.
   */
  execute(ctx: PluginContext): Promise<CheckResult | null>;

  /**
   * Optional teardown hook
   */
  dispose?(): Promise<void>;

  /**
   * Optional health check hook
   */
  health?(): Promise<boolean>;
}

export class PluginManager {
  private plugins: VerificationPlugin[] = [];

  register(plugin: VerificationPlugin) {
    if (this.plugins.some(p => p.name === plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered.`);
    }
    this.plugins.push(plugin);
  }

  async initializeAll() {
    await Promise.all(
      this.plugins.map(p => p.initialize ? p.initialize() : Promise.resolve())
    );
  }

  async disposeAll() {
    await Promise.all(
      this.plugins.map(p => p.dispose ? p.dispose() : Promise.resolve())
    );
  }

  getPluginsByType(type: PluginType): VerificationPlugin[] {
    return this.plugins.filter(p => p.type === type);
  }

  getAll(): VerificationPlugin[] {
    return this.plugins;
  }
}
