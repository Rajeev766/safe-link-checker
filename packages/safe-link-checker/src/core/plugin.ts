import type { VerifyOptions, CheckResult } from '../types/index.js';

export type PluginType = 'network' | 'content' | 'heuristic' | 'provider';

export interface PluginContext {
  url: string;
  normalizedUrl: string;
  options: VerifyOptions;
  state: Map<string, unknown>; // Shared state across plugins during a single verification run
}

export interface VerificationPlugin {
  name: string;
  type: PluginType;
  version: string;
  weight?: number; // Defines how much this plugin impacts the final score
  
  /** 
   * Initialization hook (e.g. connecting to DB, setting up local models) 
   */
  init?(): Promise<void>;

  /**
   * Main execution hook. 
   * Returns a CheckResult or null if the plugin decides to skip.
   */
  execute(ctx: PluginContext): Promise<CheckResult | null>;

  /**
   * Optional teardown hook
   */
  destroy?(): Promise<void>;
}

export class PluginManager {
  private plugins: VerificationPlugin[] = [];

  register(plugin: VerificationPlugin) {
    if (this.plugins.some(p => p.name === plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered.`);
    }
    this.plugins.push(plugin);
  }

  async initAll() {
    await Promise.all(
      this.plugins.map(p => p.init ? p.init() : Promise.resolve())
    );
  }

  getPluginsByType(type: PluginType): VerificationPlugin[] {
    return this.plugins.filter(p => p.type === type);
  }

  getAll(): VerificationPlugin[] {
    return this.plugins;
  }
}
