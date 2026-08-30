/* Guest + password: wrong password first, then correct. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  const seen = [];
  gp.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method()==='GET') return;
    let b=null; try { b=(await r.text()).slice(0,300); } catch {}
    seen.push({ u:u.replace(/^https?:\/\/[^/]+/,''), s:r.status(), res:b });
  });
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.evaluate(DOM);
  await gp.locator('input[type=text]').first().fill('Guest PW');
  await gp.locator('input[type=password]').first().fill('WrongOne1');
  await gp.waitForTimeout(700);
  await gp.locator('button[type=submit]').first().click();
  await gp.waitForTimeout(7000);
  out.afterWrong = await gp.evaluate(() => ({
    url: location.pathname,
    inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,400) }));
  out.apiWrong = seen.slice();

  const n = seen.length;
  await gp.locator('input[type=password]').first().fill('Secret123');
  await gp.waitForTimeout(700);
  await gp.locator('button[type=submit]').first().click();
  await gp.waitForTimeout(11000);
  out.afterRight = await gp.evaluate(() => ({
    url: location.pathname,
    inCall: !!document.querySelector('[data-testid="guest-call-surface"]'),
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,300) }));
  out.apiRight = seen.slice(n);
  await gctx.close();
  return out;
};
