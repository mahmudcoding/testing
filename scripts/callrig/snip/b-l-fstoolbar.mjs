/* sector L: in fullscreen, is the toolbar auto-hidden (returns on pointer move) or gone? */
import { DOM } from './lib.mjs';
const tb = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const t=document.querySelector('[data-testid="call-toolbar"]');
  const r=t?t.getBoundingClientRect():null;
  const cs=t?getComputedStyle(t):null;
  const named=[...document.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b).trim().slice(0,32));
  return {present:!!t, boxVis:t?q.boxVis(t):null, opacity:t?q.opacity(t):null,
    ownOpacity:cs?cs.opacity:null, display:cs?cs.display:null, transform:cs?cs.transform:null,
    rect:r?{w:Math.round(r.width),h:Math.round(r.height),y:Math.round(r.top)}:null,
    fsEl:!!document.fullscreenElement,
    visibleButtons:named.length, sample:named.slice(0,8),
    hasLeave: named.some(n=>/Leave call/i.test(n)), hasMute: named.some(n=>/^(Mute|Unmute)$/i.test(n))};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={samples:[]};
  out.entry = await tb(page);
  if(!out.entry.fsEl){
    await page.evaluate(()=>document.querySelector('[data-testid="call-surface-fullscreen"]').click());
    await page.waitForTimeout(2000);
  }
  out.justAfterFs = await tb(page);
  // sit still and sample
  for(let i=0;i<6;i++){ await page.waitForTimeout(1500); out.samples.push({phase:'idle', dt:i, ...(await tb(page))}); }
  // now move the pointer over the stage
  for(let i=0;i<4;i++){
    await page.mouse.move(700+i*60, 500+i*20);
    await page.waitForTimeout(400);
    out.samples.push({phase:'move', dt:i, ...(await tb(page))});
  }
  await page.waitForTimeout(1500);
  out.afterMoveSettle = await tb(page);
  // keep still again for 12s to see if it hides once more
  for(let i=0;i<6;i++){ await page.waitForTimeout(2000); out.samples.push({phase:'still-again', dt:i, ...(await tb(page))}); }
  // leave fullscreen via the DOM API (Escape is a UA action Playwright cannot send)
  out.exit = await page.evaluate(async ()=>{ try{ await document.exitFullscreen(); return 'ok'; }catch(e){ return String(e).slice(0,60); } });
  await page.waitForTimeout(2000);
  out.final = await tb(page);
  return out;
};
