import { validateIp } from '@safe-link-checker/node-runtime';

describe('validateIp', () => {
  // ─── Safe / public IPs ────────────────────────────────────────────────────
  describe('safe addresses', () => {
    it('should pass a regular public domain', () => {
      const res = validateIp('https://example.com');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
    });

    it('should pass a public IPv4 address', () => {
      const res = validateIp('https://8.8.8.8');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
    });

    it('should pass a public IPv6 address', () => {
      const res = validateIp('https://[2001:4860:4860::8888]');
      expect(res.safe).toBe(true);
      expect(res.scoreImpact).toBe(0);
    });
  });

  // ─── Hostname-based local detection ──────────────────────────────────────
  describe('local hostname detection', () => {
    it('should block localhost', () => {
      const res = validateIp('http://localhost');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('localhost');
    });

    it('should block localhost with a path and port', () => {
      const res = validateIp('http://localhost:8080/api');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
    });

    it('should block .local mDNS hostnames', () => {
      const cases = [
        'http://mydevice.local',
        'http://printer.local/admin',
        'http://nas.local:9000',
      ];
      for (const url of cases) {
        const res = validateIp(url);
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('.local');
      }
    });
  });

  // ─── IPv4 loopback (127.x.x.x) ───────────────────────────────────────────
  describe('IPv4 loopback addresses', () => {
    const loopback = [
      'http://127.0.0.1',
      'http://127.0.0.1:3000',
      'http://127.1.2.3',
      'http://127.255.255.255',
    ];

    it.each(loopback)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('loopback');
    });
  });

  // ─── IPv4 private ranges ──────────────────────────────────────────────────
  describe('IPv4 private network addresses (RFC 1918)', () => {
    const private4 = [
      // 10.0.0.0/8
      'http://10.0.0.1',
      'http://10.255.255.255',
      // 172.16.0.0/12
      'http://172.16.0.1',
      'http://172.20.0.1',
      'http://172.31.255.255',
      // 192.168.0.0/16
      'http://192.168.0.1',
      'http://192.168.1.100',
      'http://192.168.255.255',
    ];

    it.each(private4)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('private');
    });
  });

  // ─── IPv4 link-local (169.254.x.x) ───────────────────────────────────────
  describe('IPv4 link-local addresses', () => {
    const linkLocal4 = [
      'http://169.254.0.1',
      'http://169.254.169.254', // AWS metadata endpoint
      'http://169.254.255.255',
    ];

    it.each(linkLocal4)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('link-local');
    });
  });

  // ─── IPv6 loopback (::1) ─────────────────────────────────────────────────
  describe('IPv6 loopback addresses', () => {
    it('should block ::1', () => {
      const res = validateIp('http://[::1]');
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('loopback');
    });
  });

  // ─── IPv6 link-local (fe80::/10) ─────────────────────────────────────────
  describe('IPv6 link-local addresses', () => {
    const linkLocal6 = [
      'http://[fe80::1]',
      'http://[fe80::abcd:ef01]',
      'http://[fe80::dead:beef:cafe:1234]',
    ];

    it.each(linkLocal6)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('link-local');
    });
  });

  // ─── IPv6 unique local (fc00::/7) ────────────────────────────────────────
  describe('IPv6 unique local addresses', () => {
    const uniqueLocal6 = [
      'http://[fc00::1]',
      'http://[fd00::1]',
      'http://[fd12:3456:789a::1]',
    ];

    it.each(uniqueLocal6)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
      expect(res.message).toContain('unique local');
    });
  });

  // ─── IPv4-mapped IPv6 ────────────────────────────────────────────────────
  describe('IPv4-mapped IPv6 addresses', () => {
    const mapped = [
      'http://[::ffff:192.168.1.1]',
      'http://[::ffff:10.0.0.1]',
      'http://[::ffff:127.0.0.1]',
    ];

    it.each(mapped)('should block %s', (url) => {
      const res = validateIp(url);
      expect(res.safe).toBe(false);
      expect(res.scoreImpact).toBe(100);
    });
  });

  // ─── Score and riskLevel integration ─────────────────────────────────────
  describe('score metadata', () => {
    it('should return scoreImpact 100 for any blocked address', () => {
      expect(validateIp('http://127.0.0.1').scoreImpact).toBe(100);
      expect(validateIp('http://192.168.0.1').scoreImpact).toBe(100);
      expect(validateIp('http://[::1]').scoreImpact).toBe(100);
    });

    it('should return scoreImpact 0 for a public address', () => {
      expect(validateIp('https://1.1.1.1').scoreImpact).toBe(0);
    });
  });

  // ─── SSRF bypass: non-canonical IPv4 encodings ───────────────────────────
  // Node's WHATWG URL parser normalizes decimal-integer, hex-integer, and
  // octal-dotted IPv4 forms to canonical dotted-decimal before validateIp() sees
  // the hostname. This means non-canonical encodings are blocked by the existing
  // ipaddr.js range checks. This test suite verifies the blocking behavior end-to-end
  // and provides a regression guard. The tryNormalizeAlternativeIpv4() helper in
  // ip.ts provides additional defense-in-depth for non-Node URL parsers.
  describe('alternative IPv4 encodings (SSRF bypass prevention)', () => {
    // ── Decimal integer encoding ────────────────────────────────────────────
    // Node normalizes: http://2130706433 → hostname = "127.0.0.1"
    describe('decimal integer (e.g. http://2130706433 = 127.0.0.1)', () => {
      it('should block decimal encoding of 127.0.0.1 (loopback)', () => {
        const res = validateIp('http://2130706433'); // 0x7f000001 = 127.0.0.1
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('loopback');
        expect(res.fatal).toBe(true);
      });

      it('should block decimal encoding of 192.168.0.1 (private)', () => {
        const res = validateIp('http://3232235521'); // 0xC0A80001 = 192.168.0.1
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('private');
        expect(res.fatal).toBe(true);
      });

      it('should block decimal encoding of 10.0.0.1 (private)', () => {
        const res = validateIp('http://167772161'); // 0x0A000001 = 10.0.0.1
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('private');
      });

      it('should block decimal encoding of 169.254.169.254 (AWS metadata link-local)', () => {
        const res = validateIp('http://2852039166'); // 0xA9FEA9FE = 169.254.169.254
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('link-local');
      });

      it('should not false-positive on decimal numbers above 2^32 (not valid IPs)', () => {
        // 4294967296 = 2^32 — Node's URL parser treats this as a domain component
        const res = validateIp('http://4294967296.example.com');
        expect(res.safe).toBe(true); // It's a domain, not an IP
      });
    });

    // ── Hex integer encoding ────────────────────────────────────────────────
    // Node normalizes: http://0x7f000001 → hostname = "127.0.0.1"
    describe('hex integer (e.g. http://0x7f000001 = 127.0.0.1)', () => {
      it('should block hex encoding of 127.0.0.1 (loopback)', () => {
        const res = validateIp('http://0x7f000001');
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('loopback');
        expect(res.fatal).toBe(true);
      });

      it('should block hex encoding of 192.168.1.1 (private)', () => {
        const res = validateIp('http://0xC0A80101');
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('private');
      });

      it('should block hex encoding of 169.254.169.254 (link-local)', () => {
        const res = validateIp('http://0xA9FEA9FE');
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('link-local');
      });
    });

    // ── Octal dotted encoding ───────────────────────────────────────────────
    // Node normalizes: http://0177.0.0.1 → hostname = "127.0.0.1"
    describe('octal dotted notation (e.g. http://0177.0.0.1 = 127.0.0.1)', () => {
      it('should block octal encoding of 127.0.0.1 (loopback)', () => {
        const res = validateIp('http://0177.0.0.1');
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('loopback');
        expect(res.fatal).toBe(true);
      });

      it('should block octal encoding of 10.0.0.1 (private)', () => {
        const res = validateIp('http://012.0.0.1'); // 012 octal = 10 decimal
        expect(res.safe).toBe(false);
        expect(res.scoreImpact).toBe(100);
        expect(res.message).toContain('private');
      });
    });

    // ── No false positives on valid domain names ────────────────────────────
    describe('no false positives on regular domains', () => {
      it('should not block a domain that looks like a large number', () => {
        const res = validateIp('http://1234567890.example.com');
        expect(res.safe).toBe(true); // It's a domain, not a raw IP
      });

      it('should not change behavior for canonical IPs', () => {
        expect(validateIp('http://127.0.0.1').safe).toBe(false);
        expect(validateIp('https://8.8.8.8').safe).toBe(true);
        expect(validateIp('https://example.com').safe).toBe(true);
      });
    });
  });
});
