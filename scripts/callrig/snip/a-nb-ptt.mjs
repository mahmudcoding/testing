import { VIS } from './a-nb-lib.mjs';
const MIC = `async () => {
  const pcs = window.__pcs || []; const o=[];
  for (const pc of pcs) for (const s of pc.getSenders()) {
    if (!s.track || s.track.kind!=='audio') continue;
    o.push({label:(s.track.label||'').slice(0,26), enabled:s.track.enabled, muted:s.track.muted});
  } return o;
}`;
export default async ({page}) => {
  const out={};
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(2200);
  out.pttRow = await page.evaluate((v)=>{ const vis=eval(v);
    const cands=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
    const m=cands[cands.length-1]; if(!m) return {err:'no popover'};
    const els=[...m.querySelectorAll('button,[role="switch"],input')].filter(vis)
      .map(e=>({tag:e.tagName.toLowerCase(), t:e.getAttribute('data-testid'),
                al:e.getAttribute('aria-label'), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30),
                st:e.getAttribute('aria-checked')||e.getAttribute('data-state')||e.getAttribute('aria-pressed')||null}));
    return els.filter(e=>/talk|switch/i.test((e.txt||'')+(e.al||'')+(e.tag||'')) || e.tag==='input'); }, VIS);
  return out;
};
