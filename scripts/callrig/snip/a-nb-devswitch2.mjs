import { VIS } from './a-nb-lib.mjs';
const TRACKS = `async () => {
  const pcs = window.__pcs || [];
  const out = [];
  for (const pc of pcs) for (const s of pc.getSenders()) {
    if (!s.track || s.track.kind !== 'audio') continue;
    const st = s.track.getSettings ? s.track.getSettings() : {};
    out.push({label: (s.track.label||'').slice(0,34), deviceId: String(st.deviceId||'').slice(0,10)});
  }
  return out;
}`;
const READROWS = `(vis) => {
  const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
    .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
  const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
  return [...m.querySelectorAll('button')].filter(vis)
    .map(b=>({t:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34), s:b.getAttribute('data-selected')}))
    .filter(r=>r.t);
}`;
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  const pick = process.env.QA_DEVNAME || 'Fake Audio Input 2';
  const out = {pick};
  const open = async () => { await page.mouse.move(700,500); await page.waitForTimeout(400);
    await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(500);
    await page.locator(`button[aria-label="${which}"]`).first().click(); await page.waitForTimeout(2200); };
  out.tracksBefore = await page.evaluate('('+TRACKS+')()');
  await open();
  out.rowsBefore = await page.evaluate(([v,r])=>eval('('+r+')')(eval(v)), [VIS, READROWS]);
  out.click = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1];
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').includes(n));
    if(!b) return {err:'no row '+n};
    const before=b.getAttribute('data-selected'); b.click();
    return {ok:true, wasSelected:before, txt:(b.innerText||'').replace(/\s+/g,' ').slice(0,40)}; }, [pick, VIS]);
  await page.waitForTimeout(4500);
  out.tracksAfter = await page.evaluate('('+TRACKS+')()');
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(1000);
  await open();
  out.rowsAfter = await page.evaluate(([v,r])=>eval('('+r+')')(eval(v)), [VIS, READROWS]);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
