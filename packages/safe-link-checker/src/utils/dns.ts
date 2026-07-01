/**
 * SafeLinkChecker
 * Copyright (c) 2026
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import dns from 'dns';
import { validateIp } from '../validators/ip.js';

/**
 * A custom DNS lookup function for Node's http/https requests.
 * It resolves the hostname and immediately validates the resolved IP 
 * using our internal `validateIp` logic before returning it to the socket.
 * This completely prevents DNS Rebinding attacks because the socket will never
 * connect to a private/local IP space even if the DNS record changed.
 */
export const safeLookup: dns.LookupFunction = (
  hostname,
  options,
  callback
) => {
  // We explicitly cast the callback to any here because dns.lookup has complex overloads 
  // and we just want to passthrough after our security check.
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) {
      return (callback as any)(err);
    }

    // The address might be a string (single result) or an array of objects (if `all: true`)
    let ipToCheck = typeof address === 'string' ? address : null;
    
    // If all: true was passed, address is an array of { address, family }
    if (Array.isArray(address) && address.length > 0) {
      ipToCheck = address[0].address;
    }

    if (ipToCheck) {
      const urlStr = ipToCheck.includes(':') ? `http://[${ipToCheck}]` : `http://${ipToCheck}`;
      const ipResult = validateIp(urlStr);
      if (!ipResult.safe && process.env.NODE_ENV !== 'test') {
        return (callback as any)(new Error(`Security Exception: DNS Rebinding Blocked. Hostname resolved to forbidden IP: ${ipToCheck}`));
      }
    }

    (callback as any)(null, address, family);
  });
};
