export default async ({page}) => {
  const email = process.env.QA_EMAIL, pw = process.env.QA_PW || 'QaPass123!';
  await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  const me0 = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()));
  if (me0 && me0.email === email) return {already: me0.email, url: page.url()};
  if (!page.url().includes('/login')) { await page.goto('https://airion-cargo.store/login', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(1200); }
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', pw);
  await page.click('button[type=submit]');
  await page.waitForTimeout(4000);
  const me = await page.evaluate(async () => { const r = await fetch('/api/v1/auth/me',{credentials:'include'}); return {s:r.status, j: await r.json()}; });
  return {loggedIn: me.j && me.j.email, status: me.s, url: page.url()};
};
