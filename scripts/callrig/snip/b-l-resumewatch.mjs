import { DOM } from './lib.mjs';
const st = async (page, who) => page.evaluate((w)=>{
  const q=window.__qa;
  const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w)||/stopped watching/i.test(n.innerText||''));
  if(!t) return {tile:false};
  const v=t.querySelector('video');
  const pq=v&&v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;
  return {tile:true, hasVideo:!!v, vw:v?v.videoWidth:null, tf:pq?pq.totalVideoFrames:null,
    text:(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)};
}, who);
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const who='Carol';
  const out={};
  out.before = await st(page, who);
  const b = await page.evaluate(()=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/stopped watching/i.test(n.innerText||''));
    if(!t) return null; const r=t.getBoundingClientRect();
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};
  });
  if(!b) return {...out, ok:false, why:'no stopped tile'};
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(900);
  await page.evaluate(()=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>/stopped watching/i.test(n.innerText||''));
    const tr=t?[...t.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger'):null;
    tr&&tr.click();
  });
  await page.waitForTimeout(1300);
  out.pick = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis).filter(n=>/^Resume watching$/i.test(q.nameOf(n).trim()));
    if(c.length!==1) return {ok:false, got:c.length};
    c[0].click(); return {ok:true};
  });
  out.samples=[];
  for(let i=0;i<8;i++){ await page.waitForTimeout(2500); out.samples.push({i, ...(await st(page, who))}); }
  return out;
};
