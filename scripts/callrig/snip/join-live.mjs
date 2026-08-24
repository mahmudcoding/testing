import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const netlog = [];
  page.on('response', async r => { const u=r.url(); if(u.includes('/api/v1/meeting')||u.includes('/meetings')){ let b=''; try{b=(await r.text()).slice(0,220);}catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const btn = await page.$('main button:has-text("Join")');
  if (!btn) return {err:'no Join button', text: await page.evaluate(()=>document.querySelector('main').innerText.slice(0,500))};
  await btn.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||8000));
  const ui = await page.evaluate('('+UI_STATE+')()');
  return {net: netlog, ui};
};
