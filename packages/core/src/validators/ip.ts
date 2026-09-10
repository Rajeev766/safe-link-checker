/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '@safe-link-checker/types';
import ipaddr from 'ipaddr.js';

// Hostnames that are always local regardless of IP resolution
const LOCAL_HOSTNAMES = new Set(['localhost', 'broadcasthost']);
const LOCAL_HOSTNAME_SUFFIX = '.local';

// IPv4 private/local CIDR ranges not covered by ipaddr.js range names we care about
// ipaddr.js covers: loopback, private, linkLocal, carrierGradeNat, broadcast, etc.
const BLOCKED_IPV4_RANGES = [
  'loopback',       // 127.0.0.0/8
  'private',        // 10/8, 172.16/12, 192.168/16
  'linkLocal',      // 169.254.0.0/16
  'broadcast',      // 255.255.255.255/32
  'carrierGradeNat', // 100.64.0.0/10
  'unspecified',    // 0.0.0.0
] as const;

const BLOCKED_IPV6_RANGES = [
  'loopback',       // ::1
  'linkLocal',      // fe80::/10
  'uniqueLocal',    // fc00::/7 (fc/fd)
  'unspecified',    // ::
] as const;

function describeRange(range: string): string {
  const descriptions: Record<string, string> = {
    loopback: 'loopback address',
    private: 'private network address (RFC 1918)',
    linkLocal: 'link-local address',
    broadcast: 'broadcast address',
    carrierGradeNat: 'carrier-grade NAT address',
    uniqueLocal: 'unique local IPv6 address',
    unspecified: 'unspecified address',
  };
  return descriptions[range] ?? `reserved range "${range}"`;
}

/**
 * Converts non-canonical IPv4 representations to dotted-decimal notation.
 *
 * Handles three SSRF bypass encodings that `ipaddr.isValid()` does not recognize
 * because Node's `URL` parser does not normalize them:
 *
 *  1. Pure decimal integer:  2130706433  → 127.0.0.1
 *  2. Hex integer:           0x7f000001  → 127.0.0.1
 *  3. Mixed-octal dotted:    0177.0.0.1  → 127.0.0.1
 *
 * Returns the dotted-decimal string if the input is a recognized alternative
 * encoding of a valid IPv4 address, or null if it is not.
 *
 * Security note: this function is purely arithmetic with no network I/O or
 * external calls. It is deterministic and side-effect free.
 */
function tryNormalizeAlternativeIpv4(host: string): string | null {
  // ── Case 1: Pure decimal integer (e.g. 2130706433 = 127.0.0.1) ──────────
  // Must be all ASCII digits only. Values > 0xFFFFFFFF are not valid IPv4.
  if (/^\d+$/.test(host)) {
    // Use BigInt to safely handle values up to 2^32-1 without precision loss
    const n = BigInt(host);
    if (n >= 0n && n <= 0xFFFFFFFFn) {
      const num = Number(n);
      return [
        (num >>> 24) & 0xFF,
        (num >>> 16) & 0xFF,
        (num >>> 8) & 0xFF,
        num & 0xFF,
      ].join('.');
    }
    return null;
  }

  // ── Case 2: Hex integer (e.g. 0x7f000001 = 127.0.0.1) ──────────────────
  if (/^0x[0-9a-f]+$/i.test(host)) {
    const n = parseInt(host, 16);
    if (!isNaN(n) && n >= 0 && n <= 0xFFFFFFFF) {
      return [
        (n >>> 24) & 0xFF,
        (n >>> 16) & 0xFF,
        (n >>> 8) & 0xFF,
        n & 0xFF,
      ].join('.');
    }
    return null;
  }

  // ── Case 3: Dotted notation where one or more octets are octal (e.g. 0177.0.0.1) ──
  // We match 4-part dot-separated tokens only (the most common obfuscation form).
  // Each part may be decimal or octal (leading zero prefix).
  if (/^(\d+\.){3}\d+$/.test(host)) {
    const parts = host.split('.');
    if (parts.length !== 4) return null;

    const octets: number[] = [];
    for (const part of parts) {
      // Octal: starts with '0', followed by more digits, all 0-7
      const isOctal = part.length > 1 && part.startsWith('0') && /^[0-7]+$/.test(part);
      const isDecimal = /^\d+$/.test(part);
      if (!isOctal && !isDecimal) return null;

      const value = isOctal ? parseInt(part, 8) : parseInt(part, 10);
      if (isNaN(value) || value < 0 || value > 255) return null;
      octets.push(value);
    }

    // Only normalize if at least one part was octal — otherwise it's already
    // canonical dotted-decimal and ipaddr.isValid() handles it correctly.
    const hasOctalPart = parts.some(p => p.length > 1 && p.startsWith('0') && /^[0-7]+$/.test(p));
    if (hasOctalPart) {
      return octets.join('.');
    }
  }

  return null;
}

export function validateIp(urlStr: string): CheckResult {
  let hostname: string;
  try {
    hostname = new URL(urlStr).hostname.toLowerCase();
  } catch {
    // If URL parsing fails here, the URL validator will have already caught it
    return { name: 'IP Validator', detector: 'ip-parser', category: 'network', severity: 'info', safe: true, scoreImpact: 0, title: 'Unparseable IP', message: 'Could not parse hostname.' };
  }

  // Strip IPv6 brackets: [::1] → ::1
  const bracketStripped = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;

  // Strip IPv6 zone ID suffix: fe80::1%eth0 → fe80::1
  const rawHost = bracketStripped.includes('%')
    ? bracketStripped.slice(0, bracketStripped.indexOf('%'))
    : bracketStripped;

  // --- Hostname-based checks ---
  if (LOCAL_HOSTNAMES.has(rawHost)) {
    return {
      name: 'IP Validator',
      detector: 'ip-localhost',
      category: 'network',
      severity: 'critical',
      safe: false,
      scoreImpact: 100,
      title: 'Localhost Address Detected',
      message: `High risk: "${rawHost}" resolves to a local/loopback address.`,
      fatal: true,
    };
  }

  if (rawHost.endsWith(LOCAL_HOSTNAME_SUFFIX)) {
    return {
      name: 'IP Validator',
      detector: 'ip-mdns',
      category: 'network',
      severity: 'critical',
      safe: false,
      scoreImpact: 100,
      title: 'mDNS Address Detected',
      message: `High risk: "${rawHost}" is a link-local mDNS hostname (.local).`,
      fatal: true,
    };
  }

  // --- Alternative IPv4 encoding normalization (SSRF bypass prevention) ---
  // ipaddr.js only recognizes canonical dotted-decimal. Decimal integers
  // (2130706433), hex integers (0x7f000001), and octal-dotted forms (0177.0.0.1)
  // would otherwise fall through the ipaddr.isValid() check as "Standard Domain"
  // and return safe:true — a critical SSRF bypass.
  const normalizedHost = ipaddr.isValid(rawHost)
    ? rawHost
    : (tryNormalizeAlternativeIpv4(rawHost) ?? rawHost);

  const wasObfuscated = normalizedHost !== rawHost;

  // --- IP-based checks ---
  if (!ipaddr.isValid(normalizedHost)) {
    // It's a regular domain name — no IP concerns
    return { name: 'IP Validator', detector: 'ip-domain', category: 'network', severity: 'info', safe: true, scoreImpact: 0, title: 'Standard Domain', message: 'Hostname is a domain name, not a raw IP.' };
  }

  const addr = ipaddr.parse(normalizedHost);

  if (addr.kind() === 'ipv4') {
    const range = (addr as ipaddr.IPv4).range();
    if ((BLOCKED_IPV4_RANGES as readonly string[]).includes(range)) {
      return {
        name: 'IP Validator',
        detector: wasObfuscated ? 'ip-v4-obfuscated-private' : 'ip-v4-private',
        category: 'network',
        severity: 'critical',
        safe: false,
        scoreImpact: 100,
        title: wasObfuscated ? 'Obfuscated Private IPv4 Address' : 'Private IPv4 Address',
        message: wasObfuscated
          ? `High risk: "${rawHost}" is an obfuscated encoding of a ${describeRange(range)} (normalized: ${normalizedHost}).`
          : `High risk: IP address is a ${describeRange(range)}.`,
        fatal: true,
        metadata: wasObfuscated ? { originalEncoding: rawHost, normalizedIp: normalizedHost } : undefined,
      };
    }

    // Public IP but encoded in a non-canonical form — obfuscation itself is suspicious
    if (wasObfuscated) {
      return {
        name: 'IP Validator',
        detector: 'ip-v4-obfuscated-public',
        category: 'network',
        severity: 'medium',
        safe: false,
        scoreImpact: 30,
        title: 'Obfuscated IP Address Encoding',
        message: `Suspicious: "${rawHost}" is an obfuscated encoding of public IP ${normalizedHost}. Obfuscated IPs are a common evasion technique.`,
        metadata: { originalEncoding: rawHost, normalizedIp: normalizedHost },
      };
    }
  } else {
    // IPv6
    const v6 = addr as ipaddr.IPv6;
    const range = v6.range();

    // Check plain IPv6 blocked ranges
    if ((BLOCKED_IPV6_RANGES as readonly string[]).includes(range)) {
      return {
        name: 'IP Validator',
        detector: 'ip-v6-private',
        category: 'network',
        severity: 'critical',
        safe: false,
        scoreImpact: 100,
        title: 'Private IPv6 Address',
        message: `High risk: IPv6 address is a ${describeRange(range)}.`,
        fatal: true,
      };
    }

    // Also check IPv4-mapped IPv6 (::ffff:192.168.x.x)
    if (v6.isIPv4MappedAddress()) {
      const v4 = v6.toIPv4Address();
      const v4Range = v4.range();
      if ((BLOCKED_IPV4_RANGES as readonly string[]).includes(v4Range)) {
        return {
          name: 'IP Validator',
          detector: 'ip-v6-mapped-private',
          category: 'network',
          severity: 'critical',
          safe: false,
          scoreImpact: 100,
          title: 'Private IPv4-Mapped IPv6 Address',
          message: `High risk: IPv4-mapped IPv6 address maps to a ${describeRange(v4Range)}.`,
          fatal: true,
        };
      }
    }
  }

  return {
    name: 'IP Validator',
    detector: 'ip-public',
    category: 'network',
    severity: 'info',
    safe: true,
    scoreImpact: 0,
    title: 'Public IP',
    message: 'IP address is not in a private or reserved range.',
  };
}
