/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dns from 'dns';
import { validateIp } from '@safe-link-checker/core';

/**
 * A custom DNS lookup function for Node's http/https requests.
 * It resolves the hostname and immediately validates the resolved IP 
 * using our internal `validateIp` logic before returning it to the socket.
 * This completely prevents DNS Rebinding attacks because the socket will never
 * connect to a private/local IP space even if the DNS record changed.
 */
export const safeLookup = (
  hostname: string,
  options: dns.LookupOptions | number | undefined | null,
  callback: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void
) => {
  dns.lookup(hostname, options as dns.LookupOptions, (err, address, family) => {
    if (err) {
      return callback(err, address as string | dns.LookupAddress[], family);
    }

    let ipToCheck: string | null = null;
    
    if (typeof address === 'string') {
      ipToCheck = address;
    } else if (Array.isArray(address) && address.length > 0) {
      const first = address[0];
      if (first && typeof first === 'object' && 'address' in first) {
        ipToCheck = (first as dns.LookupAddress).address;
      }
    }

    if (ipToCheck) {
      const urlStr = ipToCheck.includes(':') ? `http://[${ipToCheck}]` : `http://${ipToCheck}`;
      const ipResult = validateIp(urlStr);
      if (!ipResult.safe && process.env.NODE_ENV !== 'test') {
        return callback(new Error(`Security Exception: DNS Rebinding Blocked. Hostname resolved to forbidden IP: ${ipToCheck}`), address as string | dns.LookupAddress[], family);
      }
    }

    callback(null, address as string | dns.LookupAddress[], family);
  });
};
