import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = 'Select microphone';
  const pick = process.env.QA_DEVNAME || 'Fake Audio Input 1';
  const out = {pick};
  const readTrack = async () => await page.evaluate(async ()=>{
    const pcs = window.__pcs || []; const o=[];
    for (const pc of pcs) for (const s of pc.getSenders()) {
      if (!s.track || s.track.kind!=='audio') continue;
      const st=s.track.getSettings?s.track.getSettings():{};
      o.push((s.track.label||'').slice(0,30)+' / '+String(st.deviceId||'').slice(0,10));
    } return o; });
  out.t0 = await readTrack();
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator(`button[aria-label="${which}"]`).first().click(); await page.waitForTimeout(2200);
  out.click = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1];
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.innerText||'').includes(n));
    if(!b) return {err:'no row'}; b.click();
    return {ok:true, at:Date.now(), txt:(b.innerText||'').replace(/\s+/g,' ').slice(0,42)}; }, [pick, VIS]);
  out.samples=[];
  for (let i=0;i<12;i++){ await page.waitForTimeout(2000); out.samples.push({s:(i+1)*2, tr: await readTrack()}); }
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(800);
  await page.mouse.move(700,500); await page.waitForTimeout(300);
  await page.locator(`button[aria-label="${which}"]`).first().click(); await page.waitForTimeout(2200);
  out.rows = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1];
    return [...m.querySelectorAll('button')].filter(vis)
      .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), s:b.getAttribute('data-selected')}))
      .filter(r=>r.t); }, VIS);
  await page.keyboard.press('Escape').catch(()=>{});
  return out;
};
