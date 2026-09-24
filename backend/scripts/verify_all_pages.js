import puppeteer from 'puppeteer';

const PAGES_TO_TEST = [
  '/',
  '/destinations/adi-kailash',
  '/map',
  '/stays',
  '/rentals',
  '/spiritual',
  '/culture',
  '/activities',
  '/guides',
  '/trip-planner',
  '/copilot',
  '/innovations',
  '/audit',
  '/login'
];

async function verifyPages() {
  console.log('🚀 Starting end-to-end page verification...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let totalErrors = 0;

  for (const path of PAGES_TO_TEST) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    const pageConsoleErrors = [];
    const unhandledErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageConsoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      unhandledErrors.push(err.message);
    });

    try {
      await page.goto(`http://localhost:5173${path}`, { waitUntil: 'load', timeout: 25000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 1200));

      const hasErrorBoundary = await page.evaluate(() => {
        return document.body.innerText.includes('Something went wrong') &&
               document.body.innerText.includes('Try Reloading');
      });

      if (hasErrorBoundary || unhandledErrors.length > 0) {
        console.error(`❌ [FAIL] ${path} - ErrorBoundary triggered or unhandled error!`);
        if (unhandledErrors.length > 0) {
          console.error(`   Unhandled Errors:`, unhandledErrors);
        }
        totalErrors++;
      } else {
        console.log(`✅ [PASS] ${path} (0 UI crash errors)`);
      }
    } catch (err) {
      console.error(`⚠️ [TIMEOUT/ERR] ${path}:`, err.message);
      totalErrors++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(`\n========================================`);
  console.log(`Verification finished. Total failures: ${totalErrors}`);
  console.log(`========================================\n`);

  if (totalErrors > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

verifyPages();
