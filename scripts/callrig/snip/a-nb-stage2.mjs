import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const big=[...ov.querySelectorAll('*')].filter(vis).map(e=>{const r=e.getBoundingClientRect();
      return {tid:e.getAttribute('data-testid'), tag:e.tagName.toLowerCase(),
        a:Math.round(r.width*r.height/1000), box:`${Math.round(r.width)}x${Math.round(r.height)}`,
        txt:(e.childElementCount===0?(e.textContent||'').trim().slice(0,30):'')};})
      .filter(e=>e.tid && e.a>200).sort((a,b)=>b.a-a.a).slice(0,14);
    const vids=[...ov.querySelectorAll('video')].filter(vis).map(x=>{const r=x.getBoundingClientRect();
      return {tid:x.getAttribute('data-testid'), wh:x.videoWidth+'x'+x.videoHeight, box:`${Math.round(r.width)}x${Math.round(r.height)}`};});
    const labels=[...ov.querySelectorAll('*')].filter(e=>!e.childElementCount).map(e=>(e.textContent||'').trim())
      .filter(t=>/present|screen|shar/i.test(t)).slice(0,6);
    return {big, vids, labels}; }, VIS);
};
