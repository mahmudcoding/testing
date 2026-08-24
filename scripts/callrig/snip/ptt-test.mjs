import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const outA = async () => {
    const s = await page.evaluate('('+RTC_STATS+')()');
    return s.stats.reduce((a,pc)=>a+pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),0);
  };
  const label = async () => await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;});
  const r = {};
  r.pcs = (await page.evaluate('('+RTC_STATS+')()')).pcs;
  r.labelIdle = await label();
  const a1 = await outA(); await page.waitForTimeout(6000); const a2 = await outA();
  r.idleDelta6s = a2 - a1;
  // hold Space
  await page.evaluate(()=>window.focus());
  await page.keyboard.down('Space');
  await page.waitForTimeout(1000);
  r.labelHeld = await label();
  const b1 = await outA(); await page.waitForTimeout(6000); const b2 = await outA();
  r.heldDelta6s = b2 - b1;
  await page.keyboard.up('Space');
  await page.waitForTimeout(1500);
  r.labelAfter = await label();
  const c1 = await outA(); await page.waitForTimeout(5000); const c2 = await outA();
  r.releasedDelta5s = c2 - c1;
  return r;
};
