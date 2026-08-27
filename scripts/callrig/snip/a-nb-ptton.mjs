import { VIS } from './a-nb-lib.mjs';
const MIC = `async () => {
  const pcs = window.__pcs || []; const o=[];
  for (const pc of pcs) for (const s of pc.getSenders()) {
    if (!s.track || s.track.kind!=='audio') continue;
    o.push({label:(s.track.label||'').slice(0,24), enabled:s.track.enabled});
  } return o;
}`;
export default async ({page}) => {
  const want = process.env.QA_PTT === '0' ? false : true;
  const out={want};
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(2200);
  out.toggle = await page.evaluate(([w,v])=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    const blk=[...m.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes('Push to talk'))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)
      .find(e=>e.querySelector('[role="switch"]'));
    if(!blk) return {err:'no ptt block'};
    const sw=blk.querySelector('[role="switch"]');
    const before=sw.getAttribute('aria-checked');
    if (String(before==='true') !== String(w)) sw.click();
    return {before, clicked: String(before==='true')!==String(w)}; }, [want, VIS]);
  await page.waitForTimeout(2500);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return null;
    const sw=[...m.querySelectorAll('[role="switch"]')].filter(vis)[0];
    return sw?sw.getAttribute('aria-checked'):null; }, VIS);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(800);
  out.mic = await page.evaluate('('+MIC+')()');
  out.micBtn = await page.evaluate((v)=>{const vis=eval(v);
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||'').trim()).filter(x=>/^(Mute|Unmute)$/.test(x))[0]||null;}, VIS);
  return out;
};
