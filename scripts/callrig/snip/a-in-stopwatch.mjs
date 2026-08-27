const delta = async (page, ms) => {
  const grab=()=>page.evaluate(async()=>{const m={};
    for(const pc of (window.__pcs||[])){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') m['v:'+r.ssrc]=r.bytesReceived; }); }
    return m;});
  const a=await grab(); await page.waitForTimeout(ms); const b=await grab();
  const d={}; for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const v=(b[k]||0)-(a[k]||0); if(v>0) d[k]=v;}
  return d;
};
const menu = async (page, who) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate((w)=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].find(x=>(x.getAttribute('aria-label')||'').includes(w)); if(b)b.click();},who);
  await page.waitForTimeout(1500);
};
const pick = (page, re) => page.evaluate((src)=>{
  const RE=new RegExp(src,'i'); const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
  const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
  const p=c[c.length-1]; if(!p) return {err:'no menu'};
  const it=[...p.querySelectorAll('button,[role="menuitem"]')].filter(vis).find(x=>RE.test((x.textContent||'').trim()));
  if(!it) return {err:'no item', had:[...p.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).slice(0,10)};
  it.click(); return {clicked:(it.textContent||'').trim()};
}, re);
export default async ({page}) => {
  const out={};
  await menu(page,'QA Bob'); out.unpin = await pick(page,'^Unpin for me$'); await page.waitForTimeout(2500);
  out.beforeDelta = await delta(page, 6000);
  await menu(page,'QA Bob'); out.stopWatch = await pick(page,'^Stop watching$'); await page.waitForTimeout(4000);
  out.afterDelta = await delta(page, 6000);
  await menu(page,'QA Bob');
  out.menuNow = await page.evaluate(()=>{const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; return p?[...p.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,26)).slice(0,6):null;});
  await page.keyboard.press('Escape');
  return out;
};
