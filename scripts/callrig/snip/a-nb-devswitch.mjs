import { VIS } from './a-nb-lib.mjs';
const TRACKS = `async () => {
  const pcs = window.__pcs || [];
  const out = [];
  for (const pc of pcs) for (const s of pc.getSenders()) {
    if (!s.track || s.track.kind !== 'audio') continue;
    const st = s.track.getSettings ? s.track.getSettings() : {};
    out.push({label: (s.track.label||'').slice(0,40), deviceId: String(st.deviceId||'').slice(0,12), enabled: s.track.enabled});
  }
  return out;
}`;
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  const pick = process.env.QA_DEVNAME || 'Fake Audio Input 1';
  const out = {};
  out.tracksBefore = await page.evaluate('('+TRACKS+')()');
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator(`button[aria-label="${which}"]`).first().click();
  await page.waitForTimeout(2200);
  out.click = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').includes(n));
    if(!b) return {err:'no row '+n}; b.click(); return {ok:true}; }, [pick, VIS]);
  await page.waitForTimeout(4000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1200);
  out.tracksAfter = await page.evaluate('('+TRACKS+')()');
  // reopen and read selection state
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.locator(`button[aria-label="${which}"]`).first().click();
  await page.waitForTimeout(2200);
  out.rows = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    return [...m.querySelectorAll('button')].filter(vis).map(b=>({
      txt:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40),
      sel:b.getAttribute('data-selected'), pressed:b.getAttribute('aria-pressed')})).slice(0,8); }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
