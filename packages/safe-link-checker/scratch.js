const ipaddr = require('ipaddr.js');
console.log("Decimal IP via URL:", new URL('http://2130706433').hostname);
console.log("Decimal IP via URL:", new URL('http://0177.0.0.1').hostname);
console.log("Octal IP via URL:", new URL('http://0123.0123.0123.0123').hostname);
