import React, { useState } from 'react';
import { verifyLink } from 'safe-link-checker';

export function LinkInput() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<string>('');

  const check = async (val: string) => {
    setUrl(val);
    if (!val.startsWith('http')) {
      setStatus('');
      return;
    }
    setStatus('Checking...');
    try {
      const result = await verifyLink(val);
      setStatus(`Score: ${result.trustScore}/100 - ${result.decision}`);
    } catch (e) {
      setStatus('Error checking link');
    }
  };

  return (
    <div>
      <input 
        type="url" 
        value={url} 
        onChange={(e) => check(e.target.value)} 
        placeholder="Enter URL..." 
      />
      <div>{status}</div>
    </div>
  );
}
