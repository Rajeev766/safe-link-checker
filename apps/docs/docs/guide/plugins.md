# Plugins

Plugins are the extensibility mechanism of safe-link-checker. Every analysis capability — heuristics, redirect tracing, TLS validation — is implemented as a plugin.

## Built-in Plugins

| Plugin | Runtime | Purpose |
|---|---|---|
| `BasicUrlPlugin` | All | URL syntax validation, scheme checking, IP detection |
| `HeuristicsPlugin` | All | Entropy, keyword, brand impersonation, TLD analysis |
| `HomographPlugin` | All | Punycode / IDN homograph attack detection |
| `ShortenerPlugin` | All | URL shortener detection |
| `RuleEnginePlugin` | All | Declarative rule evaluation |
| `RedirectPlugin` | Node (via capabilities) | HTTP redirect chain tracing |
| `HttpsValidationPlugin` | Node | TLS/certificate validation |
| `ProviderPluginAdapter` | All | Wraps Provider instances as plugins |

## Creating a Custom Plugin

A plugin must implement the `VerificationPlugin` interface:

```typescript
import type {
  VerificationPlugin,
  PluginContext,
  CheckResult,
  PluginType
} from 'safe-link-checker';

class MyPlugin implements VerificationPlugin {
  id = 'my-plugin:v1';
  name = 'MyPlugin';
  version = '1.0.0';
  description = 'Checks URLs against my custom blocklist';
  author = 'Your Name';
  type: PluginType = 'heuristic';
  capabilities = ['custom-check'];
  priority = 50;  // lower = runs earlier
  weight = 1.0;

  async execute(ctx: PluginContext): Promise<CheckResult | null> {
    const { normalizedUrl, options } = ctx;

    // Skip if the option is disabled
    if (options.skipMyPlugin) return null;

    const isBlocked = await myBlocklist.check(normalizedUrl);

    if (isBlocked) {
      return {
        name: this.name,
        safe: false,
        scoreImpact: 60,
        confidence: 95,
        message: `URL found in custom blocklist`,
        description: 'This domain is on your custom blocklist',
        severity: 'high',
        category: 'domain',
        detector: 'my-plugin',
        fatal: false,
      };
    }

    return {
      name: this.name,
      safe: true,
      scoreImpact: 0,
      message: 'Not in custom blocklist',
    };
  }
}
```

## Registering Your Plugin

```typescript
import { SafeLinkChecker } from 'safe-link-checker';

const checker = new SafeLinkChecker();
checker.use(new MyPlugin());
```

## Plugin Context

The `PluginContext` object passed to `execute()` contains everything your plugin needs:

```typescript
interface PluginContext {
  url: string;             // Original URL
  normalizedUrl: string;   // Normalized URL
  options: VerifyOptions;  // Current verify options
  state: {
    checks: CheckResult[]; // Results from previously-run plugins
    finalUrl?: string;     // Final URL after redirects
    redirectTrace?: RedirectTrace;
  };
  capabilities: {
    traceRedirects?: Function; // Available in Node.js runtime
  };
}
```

## Plugin Priority

Plugins run in **ascending priority order** (lower number = runs first). Use this to ensure your plugin has access to earlier plugins' results via `ctx.state.checks`.

```typescript
class MyPlugin implements VerificationPlugin {
  priority = 200; // runs after all built-in plugins (priority 10–100)
}
```

## Fatal Plugins

Set `fatal: true` in your `CheckResult` to stop all subsequent plugin execution immediately:

```typescript
return {
  safe: false,
  fatal: true,  // ← stops the pipeline immediately
  scoreImpact: 100,
  message: 'Known malware URL — aborting analysis',
};
```

## Plugin Lifecycle Hook

Implement `init()` for async setup:

```typescript
class DatabasePlugin implements VerificationPlugin {
  private db: Database;

  async init() {
    this.db = await Database.connect(process.env.DB_URL);
  }

  async execute(ctx: PluginContext) {
    // db is ready here
  }
}
```
