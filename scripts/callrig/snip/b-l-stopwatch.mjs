/* sector L: "Stop watching" on a tile — does the video subscription actually stop? */
import { DOM } from './lib.mjs';
const st = async (page, who) => page.evaluate((w)=>{
  const q=window.__qa;
  const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
  if(!t) return {tile:false};
  const v=t.querySelector('video');
  const pq=v&&v.getVideoPlaybackQuality?v.getVideoPlaybackQuality():null;
  const ph=t.querySelector('[data-testid="participant-video-placeholder"]');
  const vm=t.querySelector('[data-testid="video-muted-icon"]');
  return {tile:true, hasVideo:!!v, vw:v?v.videoWidth:null, tf:pq?pq.totalVideoFrames:null,
    ct:v?Math.round(v.currentTime*100)/100:null,
    phVis:ph?q.boxVis(ph):false, vmVis:vm?q.boxVis(vm):false,
    text:(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,50),
    badges:[...t.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid'))};
}, who);
const pick = async (page, who, item) => {
  const b = await page.evaluate((w)=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    if(!t) return null; const r=t.getBoundingClientRect();
    return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)};
  }, who);
  if(!b) return {ok:false,why:'no tile'};
  await page.mouse.move(b.x+b.w/2, b.y+b.h/2); await page.waitForTimeout(900);
  await page.evaluate((w)=>{
    const t=[...document.querySelectorAll('[data-testid="participant-tile"]')].find(n=>(n.innerText||'').includes(w));
    const tr=t?[...t.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='participant-tile-card-trigger'):null;
    tr&&tr.click();
  }, who);
  await page.waitForTimeout(1300);
  const menu = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    return w?(w.innerText||'').replace(/\s+/g,' ').trim():null;
  });
  const r = await page.evaluate((i)=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis).pop();
    if(!w) return {ok:false};
    const c=[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis).filter(n=>q.nameOf(n).replace(/\s+/g,' ').trim()===i);
    if(c.length!==1) return {ok:false, got:c.length, all:[...w.querySelectorAll('button,[role=menuitem],li')].filter(q.vis).map(n=>q.nameOf(n).trim())};
    c[0].click(); return {ok:true};
  }, item);
  return {menu, ...r};
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const who = process.env.QA_TARGET || 'QA Carol';
  const out={who, samples:[]};
  out.before = await st(page, who);
  await page.waitForTimeout(3000);
  out.before2 = await st(page, who);
  out.pick = await pick(page, who, 'Stop watching');
  for(let i=0;i<6;i++){ await page.waitForTimeout(2500); out.samples.push({i, ...(await st(page, who))}); }
  // restore
  out.restore = await pick(page, who, 'Watch again');
  if(!out.restore.ok) out.restore2 = await pick(page, who, 'Start watching');
  await page.waitForTimeout(4000);
  out.after = await st(page, who);
  await page.waitForTimeout(3000);
  out.after2 = await st(page, who);
  return out;
};
