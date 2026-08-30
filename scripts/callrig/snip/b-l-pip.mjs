/* sector L: minimize to picture-in-picture — controls, media, drag, navigation, restore */
import { DOM, RTC_STATS } from './lib.mjs';
const snap = async (page, tag) => {
  const s = await page.evaluate(()=>{
    const q=window.__qa;
    const surf=document.querySelector('[data-testid="call-surface"]');
    const pipIds=[...document.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')).filter(t=>/pip|mini|draggable/i.test(t));
    const pip=document.querySelector('[data-testid*="pip" i]')||document.querySelector('[data-testid*="mini" i]');
    const r=pip?pip.getBoundingClientRect():null;
    return {
      url:location.pathname,
      surfaceVisible: surf?q.boxVis(surf):false,
      surfaceTestidPresent: !!surf,
      pipTestids:[...new Set(pipIds)],
      pipBox: r?{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}:null,
      pipText: pip?(pip.innerText||'').replace(/\s+/g,' ').trim().slice(0,150):null,
      pipButtons: pip?[...pip.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b).trim().slice(0,40)):null,
      videos:[...document.querySelectorAll('video')].filter(q.boxVis).map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,
        rw:Math.round(v.getBoundingClientRect().width),rh:Math.round(v.getBoundingClientRect().height)}))
    };
  });
  const rtc = await page.evaluate(`(${RTC_STATS})()`);
  return {tag, ...s, out:rtc.stats.flatMap(x=>x.out).map(o=>({k:o.kind,b:o.bytes,fe:o.framesEnc})),
          in:rtc.stats.flatMap(x=>x.in).map(o=>({k:o.kind,b:o.bytes,fd:o.framesDec}))};
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.a_before = await snap(page,'before');
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
  await page.waitForTimeout(2500);
  out.b_min = await snap(page,'minimized');
  await page.waitForTimeout(3000);
  out.c_min2 = await snap(page,'minimized+3s');
  // navigate away while minimized
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/settings/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.evaluate(DOM);
  out.d_nav = await snap(page,'after-nav');
  await page.waitForTimeout(3500);
  out.e_nav2 = await snap(page,'after-nav+3.5s');
  return out;
};
