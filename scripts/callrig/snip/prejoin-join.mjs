import { UI_STATE, RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const netlog = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/')){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){} if(r.status()>=400||u.includes('meeting')) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  const before = await page.evaluate('('+UI_STATE+')()');
  const btns = await page.$$('button');
  let clicked = null;
  for (const b of btns) { const t = ((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^Join$/i.test(t)) { await b.click(); clicked = t; break; } }
  if (!clicked) return {err:'no Join', before};
  await page.waitForTimeout(Number(process.env.QA_WAIT||9000));
  const ui = await page.evaluate('('+UI_STATE+')()');
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  return {net: netlog, ui, rtc};
};
