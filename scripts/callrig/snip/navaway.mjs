import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M='V4OTNMFRI8I1W04';
  const before = await page.evaluate('('+RTC_STATS+')()');
  const inCall0 = await page.evaluate(()=>!!document.querySelector('[data-testid="call-toolbar"]'));
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/C4QAGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const after = await page.evaluate('('+RTC_STATS+')()');
  const ui = await page.evaluate(()=>({
    pip: !!document.querySelector('[data-testid="draggable-pip"],[data-testid="pip-mini-call"]'),
    surface: !!document.querySelector('[data-testid="call-toolbar"]'),
    body: document.body.innerText.replace(/\n+/g,' | ').slice(0,220)
  }));
  const parts = await page.evaluate(async (M)=> ((await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json()).participants||[]).map(p=>p.name), M);
  return {inCall0, pcsBefore: before.pcs, pcsAfter: after.pcs, connAfter: after.stats.map(s=>s.conn), ui, participants: parts};
};
