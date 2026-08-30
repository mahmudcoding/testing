/* sector L: PTT with focus on body, and focus/visibility recorded */
import { DOM } from './lib.mjs';
const mic = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
  const s=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') s.push({en:t.track.enabled}); }
  return {label:b?q.nameOf(b).trim():null, senders:s,
    active:document.activeElement?document.activeElement.tagName:null,
    hasFocus:document.hasFocus(), vis:document.visibilityState};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  out.pttSwitch = await page.evaluate(()=>{
    const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim()));
    b&&b.click(); return true;
  });
  await page.waitForTimeout(1400);
  out.pttChecked = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    const w=wraps[wraps.length-1]; if(!w) return null;
    const s=[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n)));
    return s?s.getAttribute('aria-checked'):null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  await page.evaluate(()=>{ document.activeElement&&document.activeElement.blur&&document.activeElement.blur(); });
  await page.waitForTimeout(400);
  out.before = await mic(page);
  // sample every 300ms across the hold
  const samples=[];
  const t0=Date.now();
  await page.keyboard.down('Space');
  for(let i=0;i<8;i++){ await page.waitForTimeout(300);
    samples.push({dt:Date.now()-t0, ...(await mic(page))}); }
  await page.keyboard.up('Space');
  await page.waitForTimeout(900);
  out.samples = samples.map(s=>({dt:s.dt, label:s.label, en:s.senders[0]?.en, active:s.active, hf:s.hasFocus, v:s.vis}));
  out.after = await mic(page);
  // control: does the ordinary Mute button still work from here?
  out.controlClick = await page.evaluate(()=>window.__qa.clickDeepest(/^Unmute$/i));
  await page.waitForTimeout(1500);
  out.afterControl = await mic(page);
  return out;
};
