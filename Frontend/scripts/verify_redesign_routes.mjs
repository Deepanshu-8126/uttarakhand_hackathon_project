import http from 'http';

const routes = [
  '/',
  '/trip-planner',
  '/stays',
  '/rentals',
  '/checkout',
  '/checkout/stay/st-001',
  '/checkout/rental/rt-001',
  '/my-trip',
  '/destinations/adi-kailash',
  '/spiritual',
  '/activities',
  '/login'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5173${route}`, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          route,
          statusCode: res.statusCode,
          ok: res.statusCode >= 200 && res.statusCode < 400,
          hasHtml: data.includes('<div id="root">') || data.includes('html')
        });
      });
    }).on('error', (err) => {
      resolve({ route, statusCode: 0, ok: false, error: err.message });
    });
  });
}

async function run() {
  console.log('Testing frontend routes on http://localhost:5173...\n');
  let allOk = true;
  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.ok) {
      console.log(`✓ [${res.statusCode}] ${r}`);
    } else {
      console.error(`✗ [${res.statusCode || 'ERR'}] ${r} - ${res.error || 'Failed'}`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log('\nAll tested routes responded with status 200 OK!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();
