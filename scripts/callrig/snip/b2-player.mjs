export default async ({page}) => {
  return await page.evaluate(()=>{
    const v = el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; };
    const vids=[...document.querySelectorAll('video')];
    return {videos: vids.map(x=>({dur:x.duration, cur:x.currentTime, w:x.videoWidth, h:x.videoHeight, src:(x.currentSrc||x.src||'').slice(0,60), paused:x.paused})),
      dlg: (()=>{const d=[...document.querySelectorAll('[role=dialog]')].filter(v).pop(); return d?(d.innerText||'').replace(/\n+/g,' | ').slice(0,300):null;})()};
  });
};
