const delta = async (page, ms) => {
  const grab=()=>page.evaluate(async()=>{const m={};
    for(const pc of (window.__pcs||[])){ let s; try{s=await pc.getStats();}catch(e){continue;}
      s.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='video') m['v:'+r.ssrc]=r.bytesReceived; }); }
    return m;});
  const a=await grab(); await page.waitForTimeout(ms); const b=await grab();
  const d={}; for(const k of new Set([...Object.keys(a),...Object.keys(b)])){const v=(b[k]||0)-(a[k]||0); if(v>0) d[k]=v;}
  return d;
};
export default async ({page}) => {
  const out={};
  out.tileWhileStopped = await page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].find(x=>/QA Bob/.test(x.getAttribute('aria-label')||''));
    if(!b) return null; let n=b,best=b;
    while(n&&n!==r){const q=n.getBoundingClientRect(); if(q.width>120&&q.height>90){best=n;break;} n=n.parentElement;}
    return {text:(best.innerText||'').replace(/\s+/g,' ').trim().slice(0,120),
      hasVideo: !!best.querySelector('video'),
      videoPlaying: [...best.querySelectorAll('video')].map(v=>({w:v.videoWidth,paused:v.paused}))};
  });
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].find(x=>/QA Bob/.test(x.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(1500);
  out.resume = await page.evaluate(()=>{const vis=e=>{const q=e.getBoundingClientRect();return q.width>2&&q.height>2;};
    const c=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(vis).filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
    const p=c[c.length-1]; if(!p) return {err:'no menu'};
    const it=[...p.querySelectorAll('button')].filter(vis).find(x=>/^Resume watching$/i.test((x.textContent||'').trim()));
    if(!it) return {err:'no resume'}; it.click(); return {ok:true};});
  await page.waitForTimeout(4000);
  out.afterResumeDelta = await delta(page, 6000);
  return out;
};
