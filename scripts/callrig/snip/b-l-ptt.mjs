/* sector L: push to talk — enable, then hold Space and watch the local audio sender */
import { DOM } from './lib.mjs';
const mic = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^(Mute|Unmute)$/i.test(q.nameOf(x).trim()));
  const s=[]; for(const pc of (window.__pcs||[])){ if(pc.connectionState==='closed') continue;
    for(const t of pc.getSenders()) if(t.track&&t.track.kind==='audio') s.push({en:t.track.enabled,mu:t.track.muted}); }
  return {label:b?q.nameOf(b).trim():null, pressed:b?b.getAttribute('aria-pressed'):null, senders:s};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  // make sure we start unmuted
  out.start = await mic(page);
  if(/^Unmute$/i.test(out.start.label||'')){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Unmute$/i));
    await page.waitForTimeout(1500);
  }
  out.unmuted = await mic(page);
  // open popover, flip Push to talk on
  await page.evaluate(()=>{const q=window.__qa;
    const b=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/^Select microphone$/i.test(q.nameOf(x).trim())); b&&b.click();});
  await page.waitForTimeout(1400);
  out.flip = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    const w=wraps[wraps.length-1]; if(!w) return {ok:false,why:'no popover'};
    const s=[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n)));
    if(!s) return {ok:false,why:'no switch'};
    const before=s.getAttribute('aria-checked'); s.click();
    return {ok:true, before};
  });
  await page.waitForTimeout(1200);
  out.switchAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const wraps=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    const w=wraps[wraps.length-1]; if(!w) return null;
    const s=[...w.querySelectorAll('[role=switch]')].find(n=>/Push to talk/i.test(q.nameOf(n)));
    return s?{checked:s.getAttribute('aria-checked'), hint:(w.innerText||'').replace(/\s+/g,' ').slice(-140)}:null;
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  out.afterEnable = await mic(page);
  // hold Space
  await page.evaluate(()=>{ const m=document.querySelector('[data-testid="call-surface"]')||document.body; m.focus&&m.focus(); });
  await page.keyboard.down('Space');
  await page.waitForTimeout(1200);
  out.holding = await mic(page);
  await page.waitForTimeout(1200);
  out.holding2 = await mic(page);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1200);
  out.released = await mic(page);
  out.notices = await page.evaluate(()=>window.__qa.notices());
  return out;
};
