import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(4000); // Wait for animations and data to load
  await page.screenshot({ path: 'public/dashboard-preview.png', fullPage: true });
  await browser.close();
  console.log('Screenshot taken!');
})();
