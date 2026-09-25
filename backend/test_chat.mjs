const res = await fetch('http://localhost:5000/api/agent/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Kedarnath trip 3 days budget 5000' })
});
const d = await res.json();
console.log('HTTP STATUS:', res.status);
console.log('SUCCESS:', d.success);
// Print all keys
console.log('KEYS:', Object.keys(d));
// Print message (could be object or string)
const msg = typeof d.message === 'string' ? d.message : JSON.stringify(d.message);
console.log('MESSAGE:', msg.slice(0, 400));
console.log('PROVIDER:', d.meta?.provider || d.meta?.providerUsed || 'N/A');
console.log('SESSION:', d.sessionId);
console.log('TOOLS USED:', d.toolsUsed || d.toolCount);
