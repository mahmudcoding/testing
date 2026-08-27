import { UI_STATE, RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const steps = [];
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  // click Join on the Live now card
  const j = await page.$('main button:has-text("Join")');
  if (!j) return {err:'no Join on hub', txt: await page.evaluate(()=>document.querySelector('main').innerText.slice(0,400))};
  await j.click();
  await page.waitForTimeout(5000);
  steps.push(await page.evaluate(()=>({url:location.href, txt:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,160)})));
  // if lobby, click the lobby Join
  const btns = await page.$$('button');
  for (const b of btns) {
    const t = ((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if (/^Join$/i.test(t)) { await b.click(); steps.push({clicked:'lobby Join'}); break; }
  }
  await page.waitForTimeout(Number(process.env.QA_WAIT||10000));
  const ui = await page.evaluate('('+UI_STATE+')()');
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  return {steps, url: ui.url, txt: ui.text.slice(0,300), rtc: {pcs: rtc.pcs, stats: rtc.stats.map(s=>({conn:s.conn, out:s.out.length, in:s.in.length}))}};
};
