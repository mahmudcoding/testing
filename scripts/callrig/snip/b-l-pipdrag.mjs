/* sector L: PiP — in-app navigation, its own controls, and the drag */
import { DOM, RTC_STATS } from './lib.mjs';
const pipState = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const pip=document.querySelector('[data-testid="draggable-pip"]');
  const r=pip?pip.getBoundingClientRect():null;
  return {present:!!pip, vis:pip?q.boxVis(pip):false,
    box:r?{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}:null,
    text:pip?(pip.innerText||'').replace(/\s+/g,' ').trim().slice(0,120):null,
    buttons:pip?[...pip.querySelectorAll('button')].filter(q.vis).map(b=>({n:q.nameOf(b).trim().slice(0,30),p:b.getAttribute('aria-pressed')})):null,
    url:location.pathname, vw:window.innerWidth, vh:window.innerHeight};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.a_start = await pipState(page);
  if(!out.a_start.present){
    out.min = await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
    await page.waitForTimeout(2500);
  }
  out.b_min = await pipState(page);
  // in-app navigation via the left nav
  out.nav = await page.evaluate(()=>window.__qa.clickDeepest(/^Chat Chat$|^Chat$/i));
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.c_afterNav = await pipState(page);
  const r1 = await page.evaluate(`(${RTC_STATS})()`);
  out.c_media = r1.stats.flatMap(s=>s.out).map(o=>({k:o.kind,b:o.bytes,fe:o.framesEnc}));
  // drag the PiP: mouse down on its header area, move, up
  const box = out.c_afterNav.box;
  if(box){
    await page.mouse.move(box.x+box.w/2, box.y+12);
    await page.mouse.down();
    await page.mouse.move(box.x+box.w/2-500, box.y+12-400, {steps:12});
    await page.mouse.up();
    await page.waitForTimeout(900);
  }
  out.d_afterDrag = await pipState(page);
  // drag hard toward the top-left corner, past the viewport edge
  const b2 = out.d_afterDrag.box;
  if(b2){
    await page.mouse.move(b2.x+b2.w/2, b2.y+12);
    await page.mouse.down();
    await page.mouse.move(-800, -800, {steps:15});
    await page.mouse.up();
    await page.waitForTimeout(900);
  }
  out.e_offTopLeft = await pipState(page);
  // and past the bottom-right edge
  const b3 = out.e_offTopLeft.box;
  if(b3){
    await page.mouse.move(b3.x+b3.w/2, b3.y+12);
    await page.mouse.down();
    await page.mouse.move(3000, 2000, {steps:15});
    await page.mouse.up();
    await page.waitForTimeout(900);
  }
  out.f_offBottomRight = await pipState(page);
  return out;
};
