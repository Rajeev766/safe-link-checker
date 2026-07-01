/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CheckResult } from '../types/index.js';
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

  // --- IP-based checks ---
  if (!ipaddr.isValid(rawHost)) {
    // It's a regular domain name — no IP concerns
    return { name: 'IP Validator', detector: 'ip-domain', category: 'network', severity: 'info', safe: true, scoreImpact: 0, title: 'Standard Domain', message: 'Hostname is a domain name, not a raw IP.' };
  }

  const addr = ipaddr.parse(rawHost);

  if (addr.kind() === 'ipv4') {
    const range = (addr as ipaddr.IPv4).range();
    if ((BLOCKED_IPV4_RANGES as readonly string[]).includes(range)) {
      return {
        name: 'IP Validator',
        detector: 'ip-v4-private',
        category: 'network',
        severity: 'critical',
        safe: false,
        scoreImpact: 100,
        title: 'Private IPv4 Address',
        message: `High risk: IP address is a ${describeRange(range)}.`,
        fatal: true,
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

